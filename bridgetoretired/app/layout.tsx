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

const clerkAppearance = {
  variables: {
    colorPrimary: '#E8B84B',
    colorBackground: '#0D1420',
    colorInputBackground: '#141C28',
    colorInputText: '#ffffff',
    colorText: '#ffffff',
    colorTextSecondary: 'rgba(255,255,255,0.45)',
    colorDanger: '#F87171',
    colorSuccess: '#4ADE80',
    colorNeutral: '#ffffff',
    borderRadius: '8px',
    fontFamily: 'IBM Plex Mono, monospace',
  },
  elements: {
    card: {
      background: '#0D1420',
      border: '1px solid rgba(232,184,75,0.15)',
      boxShadow: 'none',
    },
    headerTitle: {
      color: '#ffffff',
      fontFamily: 'Georgia, serif',
    },
    headerSubtitle: {
      color: 'rgba(255,255,255,0.4)',
    },
    socialButtonsBlockButton: {
      background: '#141C28',
      border: '1px solid rgba(255,255,255,0.1)',
      color: '#ffffff',
    },
    dividerLine: {
      background: 'rgba(255,255,255,0.08)',
    },
    dividerText: {
      color: 'rgba(255,255,255,0.25)',
    },
    formFieldLabel: {
      color: 'rgba(255,255,255,0.5)',
      fontSize: '11px',
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
    },
    formFieldInput: {
      background: '#141C28',
      border: '1px solid rgba(255,255,255,0.1)',
      color: '#ffffff',
    },
    formButtonPrimary: {
      background: '#E8B84B',
      color: '#0D1420',
      fontWeight: '700',
    },
    footerActionLink: {
      color: '#E8B84B',
    },
    identityPreviewText: {
      color: '#ffffff',
    },
    identityPreviewEditButton: {
      color: '#E8B84B',
    },
    otpCodeFieldInput: {
      background: '#141C28',
      border: '1px solid rgba(255,255,255,0.1)',
      color: '#ffffff',
    },
    alertText: {
      color: 'rgba(255,255,255,0.6)',
    },
  },
}

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
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      appearance={clerkAppearance}
    >
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
