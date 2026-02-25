import type { Metadata } from 'next'
import { Syne } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
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
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <html lang="en" className={syne.variable}>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
