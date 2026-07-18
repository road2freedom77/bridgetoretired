import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SEPP Calculator — All 3 IRS Methods Compared (2026) | BridgeToRetired',
  description: 'Calculate your 72(t) SEPP distributions using all three IRS-approved methods: RMD, Fixed Amortization, and Fixed Annuitization. Compare payments side-by-side.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}