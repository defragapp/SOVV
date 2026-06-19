/**
 * Browser Run integration — prepared but not yet wired.
 * Cloudflare Browser Run provides CDP-based browser automation.
 * Wire this when the BROWSER binding is added to wrangler.toml.
 */
export async function captureScreenshot(
  _params: { url: string; width?: number; height?: number }
): Promise<unknown> {
  // TODO: Wire Cloudflare Browser Run binding
  // const browser = await puppeteer.launch(env.BROWSER)
  // const page = await browser.newPage()
  // await page.goto(params.url)
  // const screenshot = await page.screenshot()
  return {
    status: "not_enabled",
    message: "Browser Run not yet configured. Add BROWSER binding to wrangler.toml.",
  }
}

export async function inspectRenderedUi(
  _params: { url: string }
): Promise<unknown> {
  return {
    status: "not_enabled",
    message: "Browser Run not yet configured.",
  }
}
