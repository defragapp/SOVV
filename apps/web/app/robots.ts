import { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/app/", "/apps/", "/api/", "/hub/", "/admin/", "/settings", "/invite/", "/studio/", "/tool/", "/workspace/", "/campaign/"],
      },
    ],
    sitemap: "https://defrag.app/sitemap.xml",
    host: "https://defrag.app",
  }
}
