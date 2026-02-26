'use client'

import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { ProNav } from '@/components/ProNav'

export default function ProWelcomePage() {
  const { user } = useUser()
  const firstName = user?.firstName || null

  const PRO_TOOLS = [
    {
      icon: '🛡️',
      title: 'Bridge Risk Score™',
      badge: 'Signature Feature',
      badgeColor: 'gold',
      description: 'Get your personalized retirement bridge score in 60 seconds.',
      href: '/bridge-risk-score',
      cta: 'Calculate My Score →',
      primary: true,
      download: false,
    },
    {
      icon: '📊',
      title: 'Advanced Bridge Calculator',
      badge: 'Pro',
      badgeColor: 'gold',
      description: 'All variables unlocked. Three SS scenarios side-by-side. Full withdrawal order control. Dynamic spending mode.',
      href: '/advanced-calculator',
      cta: 'Open Calculator →',
      primary: true,
      download: false,
    },
    {
      icon: '📉',
      title: 'Sequence-of-Returns Stress Tester',
      badge: 'Pro',
      badgeColor: 'gold',
      description: 'See how your bridge survives the 2000 dot-com crash, 2008 financial crisis, and worst historical sequences.',
      href: '/sequence-tester',
      cta: 'Run Stress Test →',
      primary: true,
      download: false,
    },
    {
      icon: '💾',
      title: 'Scenario Save + Compare',
      badge: 'Pro',
      badgeColor: 'gold',
      description: '"Retire at 50 aggressive" vs "Retire at 53 conservative." Save up to 5 scenarios and compare side-by-side.',
      href: '/scenario-compare',
      cta: 'Compare Scenarios →',
      primary: true,
      download: false,
    },
    {
      icon: '📄',
      title: 'PDF Report Export',
      badge: 'Pro',
      badgeColor: 'gold',
      description: 'One-click export of your complete retirement plan. Branded, shareable, and CPA-ready.',
      href: '/pdf-report',
      cta: 'Generate Report →',
      primary: true,
      download: false,
    },
    {
      icon: '📋',
      title: 'Premium Excel Planner',
      badge: 'Download',
      badgeColor: 'sage',
      description: 'Full planner with tax estimate tab, withdrawal tracking, Roth ladder, risk flags, and annual rebalance tracker.',
      href: '/downloads/bridge-planner-pro-v1.xlsx',
      cta: 'Download Pro Planner ↓',
      primary: false,
      download: true,
    },
  ]

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-100" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gold/[0.05] blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-5 py-20">

        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-sage/10 border border-sage/25 mb-8">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div className="font-mono text-[9px] tracking-widest uppercase text-gold mb-4">Pro Membership Active</div>
          <h1 className="font-syne font-bold text-[clamp(28px,4vw,46px)] tracking-tight text-white leading-tight mb-5">
            {firstName ? (
              <>Welcome back, <span className="text-gold">{firstName}.</span></>
            ) : (
              <>Welcome to<br /><span className="text-gold">BridgeToRetired Pro.</span></>
            )}
          </h1>
          <p className="text-white/50 text-[15px] leading-relaxed max-w-lg mx-auto">
            Your membership is active. Here's everything you have access to — bookmark this page.
          </p>
        </div>

        {/* 2-col tool grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {PRO_TOOLS.map(tool => (
            <div key={tool.title} className={`bg-ink rounded-xl p-5 flex items-start gap-4 border ${tool.primary ? 'border-gold/20' : 'border-white/[0.07]'}`}>
              <div className="text-2xl flex-shrink-0">{tool.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-syne font-semibold text-white text-[14px]">{tool.title}</span>
                  <span className={`font-mono text-[7px] tracking-widest uppercase px-2 py-0.5 rounded-full border ${
                    tool.badgeColor === 'gold'
                      ? 'bg-gold/10 text-gold border-gold/20'
                      : 'bg-sage/10 text-sage border-sage/20'
                  }`}>{tool.badge}</span>
                </div>
                <p className="text-white/40 text-[12px] leading-relaxed mb-3">{tool.description}</p>
                {tool.download ? (
                  <a href={tool.href} className="inline-block border border-white/[0.12] text-white/60 font-mono text-[10px] tracking-widest uppercase px-4 py-2 rounded hover:border-white/25 hover:text-white/80 transition-all">
                    {tool.cta}
                  </a>
                ) : (
                  <Link href={tool.href} className="inline-block bg-gold text-black font-syne font-semibold text-[11px] tracking-wide px-4 py-2 rounded hover:opacity-85 transition-opacity">
                    {tool.cta}
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-ink border border-white/[0.07] rounded-xl p-5 flex items-start gap-4">
            <div className="text-2xl flex-shrink-0">🧮</div>
            <div className="flex-1">
              <div className="font-syne font-semibold text-white text-[14px] mb-1">All 10 Interactive Calculators</div>
              <p className="text-white/40 text-[12px] leading-relaxed mb-3">Roth ladder, ACA subsidies, SEPP/72(t), Social Security break-even, and more.</p>
              <Link href="/blog" className="inline-block border border-white/[0.12] text-white/60 font-mono text-[10px] tracking-widest uppercase px-4 py-2 rounded hover:border-white/25 hover:text-white/80 transition-all">
                Browse All Guides →
              </Link>
            </div>
          </div>
          <div className="bg-ink border border-white/[0.07] rounded-xl p-5 flex items-start gap-4">
            <div className="text-2xl flex-shrink-0">✉️</div>
            <div className="flex-1">
              <div className="font-syne font-semibold text-white text-[14px] mb-1">Pro Support</div>
              <p className="text-white/40 text-[12px] leading-relaxed mb-3">Questions about your numbers? Reach out directly — we respond same day.</p>
              <a href="mailto:support@bridgetoretired.com" className="inline-block border border-white/[0.12] text-white/60 font-mono text-[10px] tracking-widest uppercase px-4 py-2 rounded hover:border-white/25 hover:text-white/80 transition-all">
                Email Support →
              </a>
            </div>
          </div>
        </div>

        {/* Manage subscription */}
        <div className="bg-ink border border-white/[0.06] rounded-xl p-5">
          <div className="font-mono text-[9px] tracking-widest uppercase text-white/25 mb-2">Manage Subscription</div>
          <p className="text-white/35 text-[12px] leading-relaxed">
            To cancel or update billing, reply to your Stripe receipt email or contact us at{' '}
            <a href="mailto:support@bridgetoretired.com" className="text-white/50 hover:text-white/70 transition-colors underline underline-offset-2">
              support@bridgetoretired.com
            </a>{' '}
            — we'll handle it same day.
          </p>
        </div>
      </div>

      <ProNav />
    </div>
  )
}
