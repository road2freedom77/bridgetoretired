import type { Metadata } from 'next'
import { Syne } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { dark } from '@clerk/themes'
import './globals.css'

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'BridgeToRetired — Retire Before 59½',
  description: 'The retirement bridge strategy for early retirees. Tools, calculators, and guides to fund your gap years before Social Security and 401k access.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary:          '#E8B84B',
          colorBackground:       '#0D1420',
          colorInputBackground:  '#141C28',
          colorText:             '#ffffff',
          borderRadius:          '0.75rem',
        },
        elements: {
          formButtonPrimary:           'bg-[#E8B84B] text-black font-bold hover:opacity-90',
          socialButtonsBlockButton:    'border border-white/10 bg-[#1E2A3A] text-white',
          footerActionLink:            'text-[#E8B84B]',
        }
      }}
    >
      <html lang="en" className={syne.variable}>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
