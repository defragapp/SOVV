/**
 * browserSession.ts
 * Captures a screenshot of a URL using Cloudflare Browser Rendering API.
 * Requires CF_API_TOKEN and CF_ACCOUNT_ID in env.
 */

import type { Env } from "../../types.js"

export interface ScreenshotResult {
  success: boolean
  url: string
  screenshotBase64?: string
  error?: string
}

export async function captureScreenshot(
  env: Env,
  payload: { url: string }
): Promise<ScreenshotResult> {
  const { url } = payload

  if (!url) {
    return { success: false, url: "", error: "url is required" }
  }

  if (!env.CF_API_TOKEN || !env.CF_ACCOUNT_ID) {
    return { success: false, url, error: "CF_API_TOKEN and CF_ACCOUNT_ID are required" }
  }

  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/browser-rendering/screenshot`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.CF_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      }
    )

    if (!response.ok) {
      return { success: false, url, error: `Browser Rendering API returned ${response.status}` }
    }

    const buffer = await response.arrayBuffer()
    const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)))

    return { success: true, url, screenshotBase64: base64 }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    return { success: false, url, error: message }
  }
}
