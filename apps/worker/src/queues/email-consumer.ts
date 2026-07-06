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
import { logSafetyEvent } from "../safety.js";
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
        logSafetyEvent({
          level: "warn",
          event: "email_consumer_missing_recipient",
          endpoint: "queue:email",
          requestId: job.from ?? "unknown",
          reason: "unknown_failure",
          error_type: "system",
          details: { jobType: "welcome", from: job.from },
        });
        return;
      }
      await sendWelcomeEmail(job.to, opts);
      return;

    case "payment_success":
      if (!job.to) {
        logSafetyEvent({
          level: "warn",
          event: "email_consumer_missing_recipient",
          endpoint: "queue:email",
          requestId: job.from ?? "unknown",
          reason: "unknown_failure",
          error_type: "system",
          details: { jobType: "payment_success", from: job.from },
        });
        return;
      }
      await sendPaymentSucceededEmail(job.to, opts);
      return;

    case "payment_failed":
      if (!job.to) {
        logSafetyEvent({
          level: "warn",
          event: "email_consumer_missing_recipient",
          endpoint: "queue:email",
          requestId: job.from ?? "unknown",
          reason: "unknown_failure",
          error_type: "system",
          details: { jobType: "payment_failed", from: job.from },
        });
        return;
      }
      await sendPaymentFailedEmail(job.to, opts);
      return;

    case "canceled":
      if (!job.to) {
        logSafetyEvent({
          level: "warn",
          event: "email_consumer_missing_recipient",
          endpoint: "queue:email",
          requestId: job.from ?? "unknown",
          reason: "unknown_failure",
          error_type: "system",
          details: { jobType: "canceled", from: job.from },
        });
        return;
      }
      await sendCancellationEmail(job.to, opts);
      return;

    case "inbound_email":
      // Internal notification only — no outbound send.
      // Log for operator awareness. Future: create support ticket in D1.
      logSafetyEvent({
        event: "email_consumer_inbound_notification",
        endpoint: "queue:email",
        requestId: job.from ?? "unknown",
        details: { from: job.from, to: job.to, size: job.size },
      });
      return;

    default: {
      // Defensive: avoid `as any` at boundaries.
      logSafetyEvent({
        level: "warn",
        event: "email_consumer_unknown_job_type",
        endpoint: "queue:email",
        requestId: "unknown",
        reason: "unknown_failure",
        error_type: "system",
        details: { type: (job as unknown as { type?: unknown }).type },
      });
      return;
    }
  }
}
