// app/robots.ts
// Serves /robots.txt — replaces having none at all.
// Disallows admin and API paths from crawlers, points to the sitemap.

import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/pro/', '/pro-welcome', '/xls-download', '/auth-callback', '/unsubscribe'],
      },
    ],
    sitemap: 'https://bridgetoretired.com/sitemap.xml',
  }
}