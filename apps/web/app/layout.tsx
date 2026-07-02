import { NoiseLayer } from "@/components/ui/noise-layer"
import type { Metadata, Viewport } from "next"
import localFont from "next/font/local"
import { GeistSans } from "geist/font/sans"
import { Fraunces } from "next/font/google"
import "./globals.css"

const jetBrainsMono = localFont({
  src: "../public/fonts/JetBrainsMono-VariableFont.woff2",
  variable: "--font-jetbrains-mono",
})

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz", "SOFT"],
})


export const metadata: Metadata = {
  metadataBase: new URL("https://defrag.app"),
  title: {
    default: "Sovereign.os — Relational Intelligence for Real Life",
    template: "Sovereign.os — %s",
  },
  description:
    "Sovereign.os helps you see the loop, separate the pattern from the pressure, and start from your baseline.",
  keywords: [
    "relationship patterns",
    "emotional intelligence",
    "personal growth",
    "self awareness",
    "relational dynamics",
    "family patterns",
    "boundary setting",
    "AI personal notebook",
    "private AI journal",
    "pattern recognition",
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
    title: "Sovereign.os — Relational Intelligence for Real Life",
    description:
      "Sovereign.os helps you see the loop, separate the pattern from the pressure, and start from your baseline.",
    images: [
      {
        url: "/social-card.png",
        width: 1200,
        height: 630,
        alt: "Sovereign.os — Relational intelligence for real life",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@sovereignos",
    creator: "@sovereignos",
    title: "Sovereign.os — Relational Intelligence for Real Life",
    description:
      "Sovereign.os helps you see the loop, separate the pattern from the pressure, and start from your baseline.",
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
  classification: "Relational Intelligence, Personal Development, AI Tools",
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
      className={`antialiased ${jetBrainsMono.variable} ${GeistSans.variable} ${fraunces.variable}`}
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
              "description": "Sovereign.os helps you see the loop, separate the pattern from the pressure, and start from your baseline.",
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
                  "price": "12",
                  "priceCurrency": "USD",
                  "billingIncrement": "P1M",
                  "name": "Pro",
                  "description": "Unlimited sessions, Covenant, Alignment, Library, Audio Overview"
                }
              ],
              "featureList": [
                "Baseline Design — personal pattern map",
                "Defrag — relational pattern analysis",
                "Covenant — shared-pattern reflection",
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
        <NoiseLayer />
        {children}
      </body>
    </html>
  )
}
