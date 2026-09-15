const { withContentlayer } = require('next-contentlayer2')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Bundle private files that are served by API routes (not in /public)
  outputFileTracingIncludes: {
    '/api/xls-download': ['./private_files/**/*'],
  },

  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.bridgetoretired.com' }],
        destination: 'https://bridgetoretired.com/:path*',
        permanent: true,
      },
      {
        source: '/blog/what-is-a-retirement-bridge-account',
        destination: '/blog/what-is-retirement-bridge-strategy',
        permanent: true,
      },
    ]
  },
}

module.exports = withContentlayer(nextConfig)