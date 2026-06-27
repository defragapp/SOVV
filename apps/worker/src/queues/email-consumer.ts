// @ts-nocheck
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
  type:
    | "welcome"
    | "payment_success"
    | "payment_failed"
    | "canceled"
    | "inbound_email";
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
const opts = {
    ...(env.EMAIL ? { emailBinding: env.EMAIL } : {}),
    ...(env.RESEND_API_KEY ? { resendApiKey: env.RESEND_API_KEY } : {}),
  };

  const hasEmailProvider =
    Boolean(opts.emailBinding) || Boolean(opts.resendApiKey);

  switch (job.type) {
    case "welcome":
      if (!job.to) {
        console.warn("[email-consumer] welcome job missing 'to':", {
          from: job.from,
        });
        return;
      }
      await sendWelcomeEmail(job.to, opts);
      return;

    case "payment_success":
      if (!job.to) {
        console.warn("[email-consumer] payment_success job missing 'to':", {
          from: job.from,
        });
        return;
      }
      await sendPaymentSucceededEmail(job.to, opts);
      return;

    case "payment_failed":
      if (!job.to) {
        console.warn("[email-consumer] payment_failed job missing 'to':", {
          from: job.from,
        });
        return;
      }
      await sendPaymentFailedEmail(job.to, opts);
      return;

    case "canceled":
      if (!job.to) {
        console.warn("[email-consumer] canceled job missing 'to':", {
          from: job.from,
        });
        return;
      }
      await sendCancellationEmail(job.to, opts);
      return;

    case "inbound_email":
      // Internal notification only — no outbound send.
      // Log for operator awareness. Future: create support ticket in D1.
      console.log(
        "[inbound_email] from=%s to=%s size=%s",
        job.from,
        job.to,
        job.size,
      );
      return;

    default: {
      // Defensive: avoid `as any` at boundaries.
      console.warn("[email-consumer] Unknown job type:", {
        type: (job as unknown as { type?: unknown }).type,
      });
      return;
    }
  }
}
