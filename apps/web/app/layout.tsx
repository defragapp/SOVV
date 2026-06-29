import type { Metadata, Viewport } from "next"
import localFont from "next/font/local"
import { GeistSans } from "geist/font/sans"
import "./globals.css"

const jetBrainsMono = localFont({
  src: "../public/fonts/JetBrainsMono-VariableFont.woff2",
  variable: "--font-jetbrains-mono",
})


export const metadata: Metadata = {
  metadataBase: new URL("https://defrag.app"),
  title: {
    default: "Sovereign.os — Understand the patterns beneath the moment",
    template: "%s — Sovereign.os",
  },
  description:
    "Sovereign.os is a private AI notebook for understanding the patterns that keep showing up in your relationships, family, messages, grief, and decisions. Describe the moment. See what's actually active. Find the clearest way through.",
  keywords: [
    "relationship patterns",
    "emotional intelligence",
    "personal growth",
    "self awareness",
    "relational dynamics",
    "family patterns",
    "grief support",
    "boundary setting",
    "AI personal notebook",
    "private AI journal",
    "pattern recognition",
    "human design",
    "astrology insights",
    "faith reflection",
    "biblical wisdom",
    "alignment",
    "defrag",
    "sovereign os",
    "baseline design",
    "emotional clarity",
    "next response",
    "conflict resolution",
    "personal AI assistant",
  ],
  authors: [{ name: "Sovereign.os", url: "https://defrag.app" }],
  creator: "Sovereign.os",
  publisher: "Sovereign.os",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://defrag.app",
    siteName: "Sovereign.os",
    title: "Sovereign.os — Understand the patterns beneath the moment",
    description:
      "A private AI notebook for the patterns that keep showing up. Describe the moment. See what's actually active. Find the clearest way through.",
    images: [
      {
        url: "/social-card.png",
        width: 1200,
        height: 630,
        alt: "Sovereign.os — Private AI notebook for relational patterns",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@sovereignos",
    creator: "@sovereignos",
    title: "Sovereign.os — Understand the patterns beneath the moment",
    description:
      "A private AI notebook for the patterns that keep showing up in your relationships, family, messages, and grief.",
    images: ["/social-card.png"],
  },
  icons: {
    icon: ["/favicon.ico", "/favicon.png", "/brand-mark.svg"],
    apple: ["/apple-touch-icon.png", "/brand-mark.svg"],
    shortcut: "/favicon.ico",
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: "https://defrag.app",
  },
  category: "productivity",
  classification: "Personal Development, Mental Wellness, AI Tools",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#08070a",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`antialiased ${jetBrainsMono.variable} ${GeistSans.variable}`}
    >
      <head>
        {/* Structured data — Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Sovereign.os",
              "applicationCategory": "LifestyleApplication",
              "operatingSystem": "Web",
              "url": "https://defrag.app",
              "description": "A private AI notebook for understanding the patterns that keep showing up in your relationships, family, messages, grief, and decisions.",
              "offers": [
                {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "USD",
                  "name": "Free",
                  "description": "Defrag space with Baseline Design — free forever"
                },
                {
                  "@type": "Offer",
                  "price": "20",
                  "priceCurrency": "USD",
                  "billingIncrement": "P1M",
                  "name": "Pro",
                  "description": "Unlimited sessions, Covenant, Alignment, Library, Audio Overview"
                }
              ],
              "featureList": [
                "Baseline Design — personal pattern map",
                "Defrag — relational pattern analysis",
                "Covenant — faith-context reflection",
                "Alignment — response integration",
                "Sovereign.os Library — private saved results",
                "Audio Overview",
                "Invite Privately"
              ]
            })
          }}
        />
      </head>
      <body className="min-h-screen overflow-x-hidden bg-[#08070a] text-[#f4efe9] overscroll-none selection:bg-white/20 selection:text-white">
        {children}
      </body>
    </html>
  )
}
