export async function inspectLiveUrl(
  params: { url: string }
): Promise<unknown> {
  try {
    const res = await fetch(params.url, {
      headers: { "User-Agent": "sovereign-control-inspector/1.0" },
      redirect: "follow",
    })
    return {
      url: params.url,
      status: res.status,
      ok: res.ok,
      headers: Object.fromEntries(res.headers.entries()),
      contentType: res.headers.get("content-type"),
    }
  } catch (err) {
    return { url: params.url, status: "error", message: String(err) }
  }
}
