/**
 * Invite system — controlled user onboarding
 * Sovereign.os
 */

import type { Env } from '../types-env.js'
import { getAuthUser } from '../auth.js'
import { getCorsHeaders } from '../cors.js'
import { logSafetyEvent } from '../safety.js'

async function sha256hex(input: string): Promise<string> {
  const buf = new TextEncoder().encode(input)
  const hash = await crypto.subtle.digest('SHA-256', buf)
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
}

function generateToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(24))
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}

function jsonResponse(data: unknown, status = 200, request?: Request): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...(request ? getCorsHeaders(request) : {}) },
  })
}

async function sendInviteEmail(to: string, inviteUrl: string, env: Env, request?: Request): Promise<void> {
  if (!env.RESEND_API_KEY) return
  const html = `<div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;padding:48px 32px;background:#08070a;color:#f4efe9;"><p style="font-family:monospace;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:rgba(244,239,233,0.3);margin-bottom:32px;">Sovereign.os</p><h1 style="font-size:24px;font-weight:300;margin-bottom:16px;">You have been invited.</h1><p style="color:rgba(244,239,233,0.6);font-size:14px;line-height:1.7;margin-bottom:24px;">You have been invited to join Sovereign.os — a private relational intelligence space. Click the link below to create your account.</p><a href="${inviteUrl}" style="display:inline-block;border:1px solid rgba(244,239,233,0.2);padding:12px 24px;font-family:monospace;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#f4efe9;text-decoration:none;margin-bottom:24px;">Accept Invitation</a><p style="color:rgba(244,239,233,0.3);font-size:12px;">This invitation expires in 7 days. It can only be used once.</p></div>`
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: 'Sovereign.os <info@defrag.app>', reply_to: 'info@defrag.app', to: [to], subject: 'Your invitation to Sovereign.os', html }),
  }).catch(err => {
    logSafetyEvent({
      level: 'warn',
      event: 'invite_email_failed',
      request,
      error_type: 'system',
      error: err,
      details: { recipient: to },
    })
  })
}

export function registerInviteSystemRoutes(router: any, getEnv: () => Env) {

  // POST /api/invite/create — admin only
  router.post('/api/invite/create', async (request: Request) => {
    const env = getEnv()
    try {
      const user = await getAuthUser(request, env.DB)
      if (!user) return jsonResponse({ error: 'Unauthorized' }, 401, request)
      if (user.role !== 'admin' && user.role !== 'owner') return jsonResponse({ error: 'Admin required' }, 403, request)

      const { email, expiresInDays = 7 } = await request.json() as { email?: string; expiresInDays?: number }

      const token = generateToken()
      const tokenHash = await sha256hex(token)
      const expiresAt = Math.floor(Date.now() / 1000) + (expiresInDays * 86400)
      const id = crypto.randomUUID()

      await env.DB.prepare(
        'INSERT INTO invite_tokens (id, email, token_hash, created_by, expires_at) VALUES (?, ?, ?, ?, ?)'
      ).bind(id, email || null, tokenHash, user.email, expiresAt).run()

      const inviteUrl = `https://app.defrag.app/app/login?invite=${token}`

      if (email) {
        await sendInviteEmail(email, inviteUrl, env, request)
      }

      return jsonResponse({
        success: true,
        invite_id: id,
        token,
        invite_url: inviteUrl,
        expires_at: new Date(expiresAt * 1000).toISOString(),
        email: email || null,
      }, 200, request)
    } catch (err) {
      logSafetyEvent({ level: 'error', event: 'invite_create_failed', request, error_type: 'system', error: err })
      return jsonResponse({ error: 'Internal error' }, 500, request)
    }
  })

  // POST /api/invite/redeem — validate invite token during registration
  router.post('/api/invite/redeem', async (request: Request) => {
    const env = getEnv()
    try {
      const { token } = await request.json() as { token?: string }
      if (!token) return jsonResponse({ error: 'Token required' }, 400, request)

      const tokenHash = await sha256hex(token)
      const now = Math.floor(Date.now() / 1000)

      const invite = await env.DB.prepare(
        'SELECT id, email, expires_at, used_at FROM invite_tokens WHERE token_hash = ?'
      ).bind(tokenHash).first<{ id: string; email: string | null; expires_at: number; used_at: number | null }>()

      if (!invite) return jsonResponse({ valid: false, error: 'Invalid invitation' }, 400, request)
      if (invite.used_at) return jsonResponse({ valid: false, error: 'This invitation has already been used' }, 400, request)
      if (invite.expires_at < now) return jsonResponse({ valid: false, error: 'This invitation has expired' }, 400, request)

      return jsonResponse({ valid: true, email: invite.email, invite_id: invite.id }, 200, request)
    } catch (err) {
      logSafetyEvent({ level: 'error', event: 'invite_redeem_failed', request, error_type: 'system', error: err })
      return jsonResponse({ error: 'Internal error' }, 500, request)
    }
  })

  // GET /api/invite/list — admin only
  router.get('/api/invite/list', async (request: Request) => {
    const env = getEnv()
    try {
      const user = await getAuthUser(request, env.DB)
      if (!user) return jsonResponse({ error: 'Unauthorized' }, 401, request)
      if (user.role !== 'admin' && user.role !== 'owner') return jsonResponse({ error: 'Admin required' }, 403, request)

      const invites = await env.DB.prepare(
        'SELECT id, email, created_by, expires_at, used_at, used_by, created_at FROM invite_tokens ORDER BY created_at DESC LIMIT 50'
      ).all()

      return jsonResponse({ success: true, invites: invites.results }, 200, request)
    } catch (err) {
      logSafetyEvent({ level: 'error', event: 'invite_list_failed', request, error_type: 'system', error: err })
      return jsonResponse({ error: 'Internal error' }, 500, request)
    }
  })
}