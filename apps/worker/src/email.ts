// @ts-nocheck
/**
 * Transactional email — Sovereign.os
 *
 * Delivery path (in priority order):
 *   1. Cloudflare send_email binding (env.EMAIL) — preferred once Email Routing is configured
 *   2. Resend API (env.RESEND_API_KEY) — current fallback
 *
 * From:     Sovereign.os <info@defrag.app>
 * Reply-To: info@defrag.app
 * Contact:  info@defrag.app
 *
 * See docs/email-routing-standard.md for Email Routing setup steps.
 * See docs/contact-and-email-standard.md for contact address policy.
 */

import type { SendEmail } from "@cloudflare/workers-types";

const FROM = "Sovereign.os <info@defrag.app>";
const REPLY_TO = "info@defrag.app";
const SUPPORT = "info@defrag.app";
const APP_URL = "https://app.defrag.app";

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send via Cloudflare send_email binding (preferred).
 * Requires Email Routing destination to be verified in Cloudflare dashboard.
 * Binding name: EMAIL (declared in wrangler.toml [[send_email]] once configured).
 */
async function sendViaBinding(
  emailBinding: SendEmail,
  payload: EmailPayload,
): Promise<void> {
  // Build a minimal message payload compatible with the Cloudflare send_email binding.
  const message = {
    from: FROM,
    to: payload.to,
    headers: {
      Subject: payload.subject,
      "Reply-To": REPLY_TO,
      "Content-Type": "text/html; charset=utf-8",
    },
    body: payload.html,
  } as any;

  await emailBinding.send(message);
}

/**
 * Send via Resend API (fallback).
 * Requires RESEND_API_KEY in Worker secrets.
 */
async function sendViaResend(
  apiKey: string,
  payload: EmailPayload,
): Promise<void> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM,
      reply_to: REPLY_TO,
      to: [payload.to],
      subject: payload.subject,
      html: payload.html,
    }),
  });

  if (!response.ok) {
    const bodyText = await response.text().catch(() => "");
    throw new Error(
      `[email] Resend rejected request: ${response.status} ${response.statusText} — ${bodyText.slice(0, 500)}`,
    );
  }
}

/**
 * Primary send function — tries send_email binding first, falls back to Resend.
 */
async function sendEmail(
  payload: EmailPayload,
  opts: { emailBinding?: SendEmail; resendApiKey?: string },
): Promise<void> {
  const hasBinding = Boolean(opts.emailBinding);
  const hasResend = Boolean(opts.resendApiKey);

  if (!hasBinding && !hasResend) {
    // Fail loudly so missing bindings are visible immediately.
    throw new Error(
      "[email] No provider configured: both EMAIL binding and RESEND_API_KEY are missing",
    );
  }

  if (opts.emailBinding) {
    try {
      await sendViaBinding(opts.emailBinding, payload);
      return;
    } catch (err) {
      // Fall through to Resend if binding fails, but log the underlying error.
      console.warn(
        "[email] EMAIL binding failed; falling back to Resend:",
        err,
      );
    }
  }

  if (opts.resendApiKey) {
    await sendViaResend(opts.resendApiKey, payload);
    return;
  }

  // Defensive: should be unreachable due to the hasBinding/hasResend guard.
  throw new Error("[email] No email provider available after fallback");
}

function baseTemplate(content: string): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  body { background: #05070B; color: #F6F5F3; font-family: Inter, system-ui, sans-serif; margin: 0; padding: 0; }
  .wrap { max-width: 520px; margin: 0 auto; padding: 48px 32px; }
  .wordmark { font-family: monospace; font-size: 10px; letter-spacing: 0.3em; text-transform: uppercase; color: rgba(246,245,243,0.3); margin-bottom: 40px; }
  .divider { border: none; border-top: 1px solid rgba(246,245,243,0.08); margin: 32px 0; }
  p { font-size: 14px; line-height: 1.7; color: rgba(246,245,243,0.6); margin: 0 0 16px; }
  .label { font-family: monospace; font-size: 9px; letter-spacing: 0.3em; text-transform: uppercase; color: rgba(246,245,243,0.25); }
  .cta { display: inline-block; border: 1px solid rgba(246,245,243,0.2); padding: 12px 24px; font-family: monospace; font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: #F6F5F3; text-decoration: none; margin-top: 8px; }
  .footer { margin-top: 48px; font-family: monospace; font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(246,245,243,0.15); }
  .footer a { color: rgba(246,245,243,0.25); text-decoration: none; }
</style>
</head>
<body>
<div class="wrap">
  <div class="wordmark">Sovereign.os</div>
  ${content}
  <hr class="divider">
  <div class="footer">
    <p style="color:rgba(246,245,243,0.15);font-size:9px;">
      Sovereign.os is a reflection space — not therapy, diagnosis, or professional advice.<br>
      Questions? <a href="mailto:${SUPPORT}">${SUPPORT}</a>
    </p>
  </div>
</div>
</body>
</html>`;
}

export async function sendWelcomeEmail(
  to: string,
  opts: { emailBinding?: SendEmail; resendApiKey?: string },
): Promise<void> {
  const html = baseTemplate(`
    <p class="label">Welcome to Sovereign.os</p>
    <p style="color:#F6F5F3;font-size:18px;font-weight:300;margin-bottom:24px;">
      Your space is ready.
    </p>
    <p>The next step is your Baseline Design — the starting map. It shows how you tend to process, respond, connect, protect, communicate, and return to center.</p>
    <p>It is private, never exposed in outputs, and active beneath every thread.</p>
    <p style="color:rgba(246,245,243,0.4);">
      Set your Baseline Design to begin. Then enter the Defrag space and start understanding what is active in the moment.
    </p>
    <a href="${APP_URL}" class="cta">Enter your space</a>
  `);

  await sendEmail({ to, subject: "Your space is ready — Sovereign.os", html }, opts);
}

export async function sendPaymentSucceededEmail(
  to: string,
  opts: { emailBinding?: SendEmail; resendApiKey?: string },
): Promise<void> {
  const html = baseTemplate(`
    <p class="label">Payment confirmed</p>
    <p style="color:#F6F5F3;font-size:18px;font-weight:300;margin-bottom:24px;">
      Your subscription renewed.
    </p>
    <p>Your Pro access continues. The thread stays grounded.</p>
    <a href="${APP_URL}" class="cta">Enter your space</a>
  `);

  await sendEmail(
    { to, subject: "Subscription renewed — Sovereign.os", html },
    opts,
  );
}

export async function sendPaymentFailedEmail(
  to: string,
  opts: { emailBinding?: SendEmail; resendApiKey?: string },
): Promise<void> {
  const html = baseTemplate(`
    <p class="label">Action required</p>
    <p style="color:#F6F5F3;font-size:18px;font-weight:300;margin-bottom:24px;">
      Payment did not go through.
    </p>
    <p>We were unable to process your subscription payment. Your access continues while we retry.</p>
    <p>To keep Pro active, update your payment method.</p>
    <a href="https://billing.stripe.com/p/login" class="cta">Update Payment Method</a>
    <p style="margin-top:24px;">If you have questions, reach us at <a href="mailto:${SUPPORT}" style="color:rgba(246,245,243,0.4);">${SUPPORT}</a>.</p>
  `);

  await sendEmail(
    { to, subject: "Payment failed — action required — Sovereign.os", html },
    opts,
  );
}

export async function sendCancellationEmail(
  to: string,
  opts: { emailBinding?: SendEmail; resendApiKey?: string },
): Promise<void> {
  const html = baseTemplate(`
    <p class="label">Subscription ended</p>
    <p style="color:#F6F5F3;font-size:18px;font-weight:300;margin-bottom:24px;">
      Your Pro subscription has been canceled.
    </p>
    <p>Your account has returned to the free tier. Your Baseline Design and saved history remain available.</p>
    <p>You can resubscribe at any time.</p>
    <a href="${APP_URL}" class="cta">Return to your space</a>
    <p style="margin-top:24px;">Questions? <a href="mailto:${SUPPORT}" style="color:rgba(246,245,243,0.4);">${SUPPORT}</a></p>
  `);

  await sendEmail(
    { to, subject: "Subscription canceled — Sovereign.os", html },
    opts,
  );
}

/**
 * Legacy compatibility shims — these maintain the old (apiKey: string, to: string) signature
 * used by billing.ts callers. Update callers to use the new opts pattern when convenient.
 */
export async function sendWelcomeEmailLegacy(
  apiKey: string,
  to: string,
): Promise<void> {
  await sendWelcomeEmail(to, { resendApiKey: apiKey });
}
export async function sendPaymentSucceededEmailLegacy(
  apiKey: string,
  to: string,
): Promise<void> {
  await sendPaymentSucceededEmail(to, { resendApiKey: apiKey });
}
export async function sendPaymentFailedEmailLegacy(
  apiKey: string,
  to: string,
): Promise<void> {
  await sendPaymentFailedEmail(to, { resendApiKey: apiKey });
}
export async function sendCancellationEmailLegacy(
  apiKey: string,
  to: string,
): Promise<void> {
  await sendCancellationEmail(to, { resendApiKey: apiKey });
}
