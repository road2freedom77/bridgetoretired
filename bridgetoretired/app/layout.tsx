import type { Metadata } from 'next'
import { Syne, Lora, IBM_Plex_Mono } from 'next/font/google'
import './globals.css'
import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import { GoogleAnalytics } from '@/components/GoogleAnalytics'

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  display: 'swap',
})

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
  display: 'swap',
})

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['300', '400'],
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bridgetoretired.com'),
  title: {
    default: 'BridgeToRetired – Early Retirement Bridge Planning',
    template: '%s | BridgeToRetired',
  },
  description:
    'Free early retirement bridge planner for people retiring before 59½. Model your taxable, 401k, and Roth withdrawal strategy year by year.',
  keywords: [
    'early retirement bridge',
    'retire before 59',
    'FIRE retirement planning',
    'bridge years retirement',
    '72t rule',
    'Roth conversion ladder',
    'retire at 50',
    'early retirement calculator',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://bridgetoretired.com',
    siteName: 'BridgeToRetired',
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${lora.variable} ${mono.variable}`}>
      <body className="bg-black text-white antialiased">
        <GoogleAnalytics />
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
