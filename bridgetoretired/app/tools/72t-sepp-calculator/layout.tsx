import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SEPP Calculator — All 3 IRS Methods Compared (2026)',
  description: 'Calculate your 72(t) SEPP distributions using all three IRS-approved methods: RMD, Fixed Amortization, and Fixed Annuitization. Compare payments side-by-side.',
  keywords: 'sepp calculator, 72t calculator, substantially equal periodic payments calculator, fixed amortization sepp, fixed annuitization sepp, rmd sepp method',
  alternates: {
    canonical: 'https://bridgetoretired.com/tools/72t-sepp-calculator',
  },
  openGraph: {
    url: 'https://bridgetoretired.com/tools/72t-sepp-calculator',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}