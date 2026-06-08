/**
 * Email queue consumer
 *
 * Processes email jobs queued by billing.ts, auth.ts, and the inbound email handler.
 *
 * Queue: pattern-extraction-tasks (current shared queue)
 * Future: dedicated email queue for higher volume
 *
 * Job types:
 *   - "welcome"          → sendWelcomeEmail
 *   - "payment_success"  → sendPaymentSucceededEmail
 *   - "payment_failed"   → sendPaymentFailedEmail
 *   - "canceled"         → sendCancellationEmail
 *   - "inbound_email"    → internal notification (no outbound send)
 *
 * Delivery path:
 *   1. Cloudflare send_email binding (env.EMAIL) — preferred
 *   2. Resend API (env.RESEND_API_KEY) — current fallback
 *
 * See docs/email-routing-standard.md for send_email binding setup.
 * See docs/billing-email-templates.md for template content.
 */

import type { Env } from "../types-env.js";
import {
  sendWelcomeEmail,
  sendPaymentSucceededEmail,
  sendPaymentFailedEmail,
  sendCancellationEmail,
} from "../email.js";

export interface EmailJob {
  type: "welcome" | "payment_success" | "payment_failed" | "canceled" | "inbound_email";
  to?: string;
  from?: string;
  size?: number;
  timestamp?: number;
}

/**
 * Process a single email queue message.
 * Called from the queue handler in apps/worker/src/index.ts.
 */
export async function processEmailJob(job: EmailJob, env: Env): Promise<void> {
  const opts: any = {
    emailBinding: env.EMAIL,
    resendApiKey: env.RESEND_API_KEY,
  };

  switch (job.type) {
    case "welcome":
      if (job.to) await sendWelcomeEmail(job.to, opts);
      break;

    case "payment_success":
      if (job.to) await sendPaymentSucceededEmail(job.to, opts);
      break;

    case "payment_failed":
      if (job.to) await sendPaymentFailedEmail(job.to, opts);
      break;

    case "canceled":
      if (job.to) await sendCancellationEmail(job.to, opts);
      break;

    case "inbound_email":
      // Internal notification only — no outbound send.
      // Log for operator awareness. Future: create support ticket in D1.
      console.log(`[inbound_email] from=${job.from} to=${job.to} size=${job.size}`);
      break;

    default:
      console.warn(`[email-consumer] Unknown job type: ${(job as any).type}`);
  }
}