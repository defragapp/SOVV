import type { Env } from '../types-env.js'
import { hashPassword } from '../auth.js'
import { getCorsHeaders } from '../cors.js'

const APP_URL = 'https://app.defrag.app'

async function sha256hex(input: string): Promise<string> {
  const buf = new TextEncoder().encode(input)
  const hash = await crypto.subtle.digest('SHA-256', buf)
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
}

function generateToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32))
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}

function jsonResponse(data: unknown, status = 200, request?: Request): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...(request ? getCorsHeaders(request) : {}) },
  })
}

async function sendResetEmail(to: string, resetUrl: string, env: Env): Promise<void> {
  if (!env.RESEND_API_KEY) return
  const html = `<div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;padding:48px 32px;background:#08070a;color:#f4efe9;"><p style="font-family:monospace;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:rgba(244,239,233,0.3);margin-bottom:32px;">Sovereign.os</p><h1 style="font-size:24px;font-weight:300;margin-bottom:16px;">Reset your password.</h1><p style="color:rgba(244,239,233,0.6);font-size:14px;line-height:1.7;margin-bottom:24px;">Someone requested a password reset for your Sovereign.os account. If this was you, click the link below.</p><a href="${resetUrl}" style="display:inline-block;border:1px solid rgba(244,239,233,0.2);padding:12px 24px;font-family:monospace;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#f4efe9;text-decoration:none;margin-bottom:24px;">Reset Password</a><p style="color:rgba(244,239,233,0.3);font-size:12px;">This link expires in 1 hour. If you did not request this, ignore this email.</p></div>`
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: 'Sovereign.os <info@defrag.app>', reply_to: 'info@defrag.app', to: [to], subject: 'Reset your password — Sovereign.os', html }),
  }).catch(err => console.warn('[auth] Reset email failed:', err))
}

async function sendVerifyEmail(to: string, verifyUrl: string, env: Env): Promise<void> {
  if (!env.RESEND_API_KEY) return
  const html = `<div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;padding:48px 32px;background:#08070a;color:#f4efe9;"><p style="font-family:monospace;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:rgba(244,239,233,0.3);margin-bottom:32px;">Sovereign.os</p><h1 style="font-size:24px;font-weight:300;margin-bottom:16px;">Verify your email.</h1><p style="color:rgba(244,239,233,0.6);font-size:14px;line-height:1.7;margin-bottom:24px;">Click the link below to verify your email address and activate your Sovereign.os space.</p><a href="${verifyUrl}" style="display:inline-block;border:1px solid rgba(244,239,233,0.2);padding:12px 24px;font-family:monospace;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#f4efe9;text-decoration:none;margin-bottom:24px;">Verify Email</a><p style="color:rgba(244,239,233,0.3);font-size:12px;">This link expires in 24 hours.</p></div>`
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: 'Sovereign.os <info@defrag.app>', reply_to: 'info@defrag.app', to: [to], subject: 'Verify your email — Sovereign.os', html }),
  }).catch(err => console.warn('[auth] Verify email failed:', err))
}

export function registerAuthExtendedRoutes(router: any, getEnv: () => Env) {

  // POST /api/auth/forgot-password
  router.post('/api/auth/forgot-password', async (request: Request) => {
    const env = getEnv()
    try {
      const { email } = await request.json() as { email?: string }
      if (!email) return jsonResponse({ error: 'Email required' }, 400, request)

      const user = await env.DB.prepare('SELECT id, email FROM users WHERE email = ?')
        .bind(email.toLowerCase().trim()).first<{ id: string; email: string }>()

      if (!user) return jsonResponse({ success: true, message: 'If that email exists, a reset link has been sent.' }, 200, request)

      const token = generateToken()
      const tokenHash = await sha256hex(token)
      const expiresAt = Math.floor(Date.now() / 1000) + 3600
      await env.DB.prepare('INSERT INTO password_reset_tokens (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)')
        .bind(crypto.randomUUID(), user.id, tokenHash, expiresAt).run()

      await sendResetEmail(user.email, `${APP_URL}/app/reset-password?token=${token}`, env)
      return jsonResponse({ success: true, message: 'If that email exists, a reset link has been sent.' }, 200, request)
    } catch (err) {
      console.error('[auth] Forgot password:', err)
      return jsonResponse({ error: 'Internal error' }, 500, request)
    }
  })

  // POST /api/auth/reset-password
  router.post('/api/auth/reset-password', async (request: Request) => {
    const env = getEnv()
    try {
      const { token, password } = await request.json() as { token?: string; password?: string }
      if (!token || !password) return jsonResponse({ error: 'Token and password required' }, 400, request)
      if (password.length < 8) return jsonResponse({ error: 'Password must be at least 8 characters' }, 400, request)

      const tokenHash = await sha256hex(token)
      const now = Math.floor(Date.now() / 1000)
      const resetToken = await env.DB.prepare('SELECT id, user_id, expires_at, used_at FROM password_reset_tokens WHERE token_hash = ?')
        .bind(tokenHash).first<{ id: string; user_id: string; expires_at: number; used_at: number | null }>()

      if (!resetToken) return jsonResponse({ error: 'Invalid or expired reset link' }, 400, request)
      if (resetToken.used_at) return jsonResponse({ error: 'This reset link has already been used' }, 400, request)
      if (resetToken.expires_at < now) return jsonResponse({ error: 'This reset link has expired' }, 400, request)

      const password_hash = await hashPassword(password)
      await env.DB.batch([
        env.DB.prepare('UPDATE users SET password_hash = ? WHERE id = ?').bind(password_hash, resetToken.user_id) as any,
        env.DB.prepare('UPDATE password_reset_tokens SET used_at = ? WHERE id = ?').bind(now, resetToken.id) as any,
        env.DB.prepare('DELETE FROM sessions WHERE user_id = ?').bind(resetToken.user_id) as any
      ])

      return jsonResponse({ success: true, message: 'Password updated. Please sign in.' }, 200, request)
    } catch (err) {
      console.error('[auth] Reset password:', err)
      return jsonResponse({ error: 'Internal error' }, 500, request)
    }
  })

  // POST /api/auth/send-verification
  router.post('/api/auth/send-verification', async (request: Request) => {
    const env = getEnv()
    try {
      const cookie = request.headers.get('Cookie') || ''
      const match = cookie.match(/__sov_session=([^;]+)/)
      if (!match) return jsonResponse({ error: 'Unauthorized' }, 401, request)

      const session = await env.DB.prepare(
        'SELECT u.id, u.email, u.email_verified FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.token = ? AND s.expires > ?'
      ).bind(match[1], Date.now()).first<{ id: string; email: string; email_verified: number }>()

      if (!session) return jsonResponse({ error: 'Unauthorized' }, 401, request)
      if (session.email_verified) return jsonResponse({ success: true, message: 'Email already verified' }, 200, request)

      const token = generateToken()
      const tokenHash = await sha256hex(token)
      const expiresAt = Math.floor(Date.now() / 1000) + 86400
      await env.DB.prepare('INSERT INTO email_verification_tokens (id, user_id, email, token_hash, expires_at) VALUES (?, ?, ?, ?, ?)')
        .bind(crypto.randomUUID(), session.id, session.email, tokenHash, expiresAt).run()

      await sendVerifyEmail(session.email, `${APP_URL}/app/verify-email?token=${token}`, env)
      return jsonResponse({ success: true, message: 'Verification email sent.' }, 200, request)
    } catch (err) {
      console.error('[auth] Send verification:', err)
      return jsonResponse({ error: 'Internal error' }, 500, request)
    }
  })

  // POST /api/auth/verify-email
  router.post('/api/auth/verify-email', async (request: Request) => {
    const env = getEnv()
    try {
      const { token } = await request.json() as { token?: string }
      if (!token) return jsonResponse({ error: 'Token required' }, 400, request)

      const tokenHash = await sha256hex(token)
      const now = Math.floor(Date.now() / 1000)
      const verifyToken = await env.DB.prepare('SELECT id, user_id, expires_at, verified_at FROM email_verification_tokens WHERE token_hash = ?')
        .bind(tokenHash).first<{ id: string; user_id: string; expires_at: number; verified_at: number | null }>()

      if (!verifyToken) return jsonResponse({ error: 'Invalid verification link' }, 400, request)
      if (verifyToken.verified_at) return jsonResponse({ success: true, message: 'Email already verified' }, 200, request)
      if (verifyToken.expires_at < now) return jsonResponse({ error: 'Verification link expired' }, 400, request)

      await env.DB.batch([
        env.DB.prepare('UPDATE users SET email_verified = 1 WHERE id = ?').bind(verifyToken.user_id) as any,
        env.DB.prepare('UPDATE email_verification_tokens SET verified_at = ? WHERE id = ?').bind(now, verifyToken.id) as any
      ])

      return jsonResponse({ success: true, message: 'Email verified. Your space is ready.' }, 200, request)
    } catch (err) {
      console.error('[auth] Verify email:', err)
      return jsonResponse({ error: 'Internal error' }, 500, request)
    }
  })
}
