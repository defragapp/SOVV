/**
 * Email inbound route handler
 *
 * Handles inbound email received via Cloudflare Email Routing → Email Worker.
 *
 * Cloudflare Email Routing constraints:
 * - This handler receives inbound messages forwarded by Email Routing.
 * - It can forward messages, reject them, or queue a job.
 * - Outbound auto-reply requires a verified send_email binding (env.EMAIL).
 * - The send_email binding sender must be from the Email Routing-active domain (defrag.app).
 * - Do not attempt outbound send until Email Routing is enabled and destination is verified.
 *
 * See docs/email-routing-standard.md for setup steps.
 */

import type { Env } from "../types-env.js";

export interface InboundEmailMessage {
  from: string;
  to: string;
  headers: Headers;
  raw: ReadableStream;
  rawSize: number;
  forward(rcptTo: string, headers?: Headers): Promise<void>;
  reject(reason: "spam" | "no-mailbox" | "policy"): void;
}

/**
 * Handle inbound email to info@defrag.app
 *
 * Current behavior:
 * 1. Forward to verified destination (configured in Email Routing dashboard)
 * 2. Queue an internal notification job for operator awareness
 *
 * Future behavior (after send_email binding is configured):
 * 3. Send acknowledgement reply via env.EMAIL send_email binding
 */
export async function handleInboundEmail(
  message: InboundEmailMessage,
  env: Env
): Promise<void> {
  const to = message.to.toLowerCase();

  // Only handle info@defrag.app — reject anything else
  if (!to.includes("info@defrag.app")) {
    message.reject("no-mailbox");
    return;
  }

  // Step 1: Forward to verified destination
  // The destination is configured in Cloudflare Email Routing dashboard.
  // Do not hardcode the private forwarding address here.
  // Forwarding is handled by the Email Routing rule, not this Worker,
  // unless this Worker is set as the routing action.
  // If this Worker IS the routing action, forward explicitly:
  //
  // const FORWARD_TO = env.EMAIL_FORWARD_ADDRESS;
  // if (FORWARD_TO) {
  //   await message.forward(FORWARD_TO);
  // }

  // Step 2: Queue internal notification
  // This allows operators to track inbound contact volume without
  // requiring the send_email binding to be active.
  if (env.PATTERN_QUEUE) {
    try {
      await env.PATTERN_QUEUE.send({
        type: "inbound_email",
        from: message.from,
        to: message.to,
        size: message.rawSize,
        timestamp: Date.now(),
      });
    } catch {
      // Queue failure is non-fatal — do not reject the message
    }
  }

  // Step 3: Auto-reply (BLOCKED until send_email binding is configured)
  //
  // Cloudflare constraint: send_email binding requires:
  // - Email Routing enabled on defrag.app
  // - Destination address verified
  // - [[send_email]] binding in wrangler.toml
  //
  //
}
