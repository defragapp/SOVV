/**
 * inspectLiveUrl.ts
 * Fetches a live URL and returns status, headers, and a content preview.
 */

export interface InspectLiveUrlResult {
  url: string
  status: number
  ok: boolean
  contentType: string | null
  preview: string
  error?: string
}

export async function inspectLiveUrl(payload: { url: string }): Promise<InspectLiveUrlResult> {
  const { url } = payload

  if (!url) {
    return { url: "", status: 0, ok: false, contentType: null, preview: "", error: "url is required" }
  }

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { "User-Agent": "sovereign-control/1.0 (inspector)" },
      redirect: "follow",
    })

    const contentType = response.headers.get("content-type")
    const text = await response.text()
    const preview = text.slice(0, 2000)

    return {
      url,
      status: response.status,
      ok: response.ok,
      contentType,
      preview,
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    return { url, status: 0, ok: false, contentType: null, preview: "", error: message }
  }
}
