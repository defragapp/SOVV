/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/hub/:path*',
        destination: '/apps/defrag',
        permanent: true,
      },
      {
        source: '/tool/:path*',
        destination: '/apps/defrag',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
