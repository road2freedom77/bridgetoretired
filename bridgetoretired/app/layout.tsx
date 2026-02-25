import type { Metadata } from 'next'
import { Syne, Lora, IBM_Plex_Mono } from 'next/font/google'
import Script from 'next/script'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'
import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'

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

const GA_ID = 'G-47E00D7CN2'

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
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <html lang="en" className={`${syne.variable} ${lora.variable} ${mono.variable}`}>
        <head>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="beforeInteractive"
          />
          <Script id="google-analytics" strategy="beforeInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}');
            `}
          </Script>
        </head>
        <body className="bg-black text-white antialiased">
          <Nav />
          <main>{children}</main>
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  )
}
