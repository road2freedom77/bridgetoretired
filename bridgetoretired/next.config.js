const { withContentlayer } = require('next-contentlayer2')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.bridgetoretired.com' }],
        destination: 'https://bridgetoretired.com/:path*',
        permanent: true,
      },
    ]
  },
}

module.exports = withContentlayer(nextConfig)