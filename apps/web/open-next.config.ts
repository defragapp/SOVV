import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

export default defineCloudflareConfig({
  // Serve pre-rendered pages from the Workers Assets binding.
  // No external KV or R2 binding required - assets are bundled at build time.
  // This eliminates always-MISS ISR behavior for static marketing pages.
  incrementalCache: staticAssetsIncrementalCache,
  enableCacheInterception: true,
});
