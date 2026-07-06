import { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://defrag.app"
  const now = new Date()

  const blogPosts = [
    "what-is-pattern-awareness",
    "baseline-design-explained",
    "defrag-vs-journaling",
  ]

  return [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${base}/campaign/sovereign-os`, lastModified: now, changeFrequency: "weekly", priority: 0.95 },
    { url: `${base}/product`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/product/defrag`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/product/covenant`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/product/alignment`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/how-it-works`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/use-cases`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/principles`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.7 },
    ...blogPosts.map(slug => ({
      url: `${base}/blog/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ]
}
