// Branded lifecycle email sender via Resend
// Requires RESEND_API_KEY in Worker environment secrets

const FROM = "DEFRAG <info@defrag.app>";
const SUPPORT = "info@defrag.app";
const APP_URL = "https://app.defrag.app";

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

async function sendEmail(apiKey: string, payload: EmailPayload): Promise<void> {
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM,
      to: [payload.to],
      subject: payload.subject,
      html: payload.html,
    }),
  });
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
  <div class="wordmark">Sovereign OS / DEFRAG</div>
  ${content}
  <hr class="divider">
  <div class="footer">
    <p style="color:rgba(246,245,243,0.15);font-size:9px;">
      DEFRAG is a reflection tool — not therapy, diagnosis, or professional advice.<br>
      Questions? <a href="mailto:${SUPPORT}">${SUPPORT}</a>
    </p>
  </div>
</div>
</body>
</html>`;
}

export async function sendWelcomeEmail(apiKey: string, to: string): Promise<void> {
  const html = baseTemplate(`
    <p class="label">Welcome</p>
    <p style="color:#F6F5F3;font-size:18px;font-weight:300;margin-bottom:24px;">
      Pro is active.
    </p>
    <p>Your baseline is set. The thread is grounded. You now have access to the full pattern.</p>
    <p>What unlocked:</p>
    <p style="color:rgba(246,245,243,0.4);">
      Unlimited sessions &nbsp;·&nbsp; Your Story &nbsp;·&nbsp; Compare With Someone &nbsp;·&nbsp; Try It Out &nbsp;·&nbsp; Full history
    </p>
    <a href="${APP_URL}" class="cta">Go to Workspace</a>
  `);

  await sendEmail(apiKey, {
    to,
    subject: "Pro is active — DEFRAG",
    html,
  });
}

export async function sendPaymentSucceededEmail(apiKey: string, to: string): Promise<void> {
  const html = baseTemplate(`
    <p class="label">Payment confirmed</p>
    <p style="color:#F6F5F3;font-size:18px;font-weight:300;margin-bottom:24px;">
      Your subscription renewed.
    </p>
    <p>Your Pro access continues. The thread stays grounded.</p>
    <a href="${APP_URL}" class="cta">Go to Workspace</a>
  `);

  await sendEmail(apiKey, {
    to,
    subject: "Subscription renewed — DEFRAG",
    html,
  });
}

export async function sendPaymentFailedEmail(apiKey: string, to: string): Promise<void> {
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

  await sendEmail(apiKey, {
    to,
    subject: "Payment failed — action required — DEFRAG",
    html,
  });
}

export async function sendCancellationEmail(apiKey: string, to: string): Promise<void> {
  const html = baseTemplate(`
    <p class="label">Subscription ended</p>
    <p style="color:#F6F5F3;font-size:18px;font-weight:300;margin-bottom:24px;">
      Your Pro subscription has been canceled.
    </p>
    <p>Your account has returned to the free tier. Your baseline and saved history remain available.</p>
    <p>You can resubscribe at any time.</p>
    <a href="${APP_URL}" class="cta">Return to Workspace</a>
    <p style="margin-top:24px;">Questions? <a href="mailto:${SUPPORT}" style="color:rgba(246,245,243,0.4);">${SUPPORT}</a></p>
  `);

  await sendEmail(apiKey, {
    to,
    subject: "Subscription canceled — DEFRAG",
    html,
  });
}