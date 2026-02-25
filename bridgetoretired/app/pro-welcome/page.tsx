import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Welcome to Pro — BridgeToRetired',
  description: 'Your BridgeToRetired Pro membership is active.',
  robots: { index: false },
}

export default function ProWelcomePage() {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-100" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gold/[0.05] blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto px-5 py-20 text-center">

        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-sage/10 border border-sage/25 mb-8">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <div className="font-mono text-[9px] tracking-widest uppercase text-gold mb-4">Pro Membership Active</div>
        <h1 className="font-syne font-bold text-[clamp(28px,4vw,46px)] tracking-tight text-white leading-tight mb-5">
          Welcome to<br /><span className="text-gold">BridgeToRetired Pro.</span>
        </h1>
        <p className="text-white/50 text-[15px] leading-relaxed mb-12 max-w-lg mx-auto">
          Your membership is active. Here's everything you now have access to — bookmark this page.
        </p>

        <div className="space-y-4 mb-12 text-left">

          {/* Bridge Risk Score */}
          <div className="bg-ink border border-gold/20 rounded-xl p-5 flex items-start gap-4">
            <div className="text-2xl flex-shrink-0">🛡️</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-syne font-semibold text-white text-[14px]">Bridge Risk Score™</span>
                <span className="bg-gold/10 text-gold font-mono text-[7px] tracking-widest uppercase px-2 py-0.5 rounded-full border border-gold/20">Signature Feature</span>
              </div>
              <p className="text-white/40 text-[12px] leading-relaxed mb-3">Get your personalized retirement bridge score in 60 seconds.</p>
              <Link href="/bridge-risk-score" className="inline-block bg-gold text-black font-syne font-semibold text-[11px] tracking-wide px-4 py-2 rounded hover:opacity-85 transition-opacity">
                Calculate My Score →
              </Link>
            </div>
          </div>

          {/* Advanced Calculator */}
          <div className="bg-ink border border-gold/20 rounded-xl p-5 flex items-start gap-4">
            <div className="text-2xl flex-shrink-0">📊</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-syne font-semibold text-white text-[14px]">Advanced Bridge Calculator</span>
                <span className="bg-gold/10 text-gold font-mono text-[7px] tracking-widest uppercase px-2 py-0.5 rounded-full border border-gold/20">Pro</span>
              </div>
              <p className="text-white/40 text-[12px] leading-relaxed mb-3">All variables unlocked. Three SS scenarios side-by-side. Full withdrawal order control. Dynamic spending mode.</p>
              <Link href="/advanced-calculator" className="inline-block bg-gold text-black font-syne font-semibold text-[11px] tracking-wide px-4 py-2 rounded hover:opacity-85 transition-opacity">
                Open Calculator →
              </Link>
            </div>
          </div>

          {/* Premium Excel */}
          <div className="bg-ink border border-white/[0.07] rounded-xl p-5 flex items-start gap-4">
            <div className="text-2xl flex-shrink-0">📋</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-syne font-semibold text-white text-[14px]">Premium Excel Planner</span>
                <span className="bg-sage/10 text-sage font-mono text-[7px] tracking-widest uppercase px-2 py-0.5 rounded-full border border-sage/20">Download</span>
              </div>
              <p className="text-white/40 text-[12px] leading-relaxed mb-3">Full planner with tax estimate tab, withdrawal tracking, Roth ladder, risk flags, and annual rebalance tracker.</p>
              <a href="/downloads/bridge-planner-pro-v1.xlsx" className="inline-block border border-white/[0.12] text-white/60 font-mono text-[10px] tracking-widest uppercase px-4 py-2 rounded hover:border-white/25 hover:text-white/80 transition-all">
                Download Pro Planner ↓
              </a>
            </div>
          </div>

          {/* All calculators */}
          <div className="bg-ink border border-white/[0.07] rounded-xl p-5 flex items-start gap-4">
            <div className="text-2xl flex-shrink-0">🧮</div>
            <div className="flex-1">
              <div className="font-syne font-semibold text-white text-[14px] mb-1">All 10 Interactive Calculators</div>
              <p className="text-white/40 text-[12px] leading-relaxed mb-3">Roth ladder, ACA subsidies, SEPP/72(t), sequence of returns, Social Security break-even, and more.</p>
              <Link href="/blog" className="inline-block border border-white/[0.12] text-white/60 font-mono text-[10px] tracking-widest uppercase px-4 py-2 rounded hover:border-white/25 hover:text-white/80 transition-all">
                Browse All Guides →
              </Link>
            </div>
          </div>

          {/* Support */}
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

        <div className="bg-ink border border-white/[0.06] rounded-xl p-5 mb-8">
          <div className="font-mono text-[9px] tracking-widest uppercase text-white/25 mb-2">Manage Subscription</div>
          <p className="text-white/35 text-[12px] leading-relaxed">
            To cancel or update billing, reply to your Stripe receipt email or contact us at support@bridgetoretired.com — we'll handle it same day.
          </p>
        </div>

        <Link href="/" className="font-mono text-[10px] tracking-widest uppercase text-white/25 hover:text-white/50 transition-colors">
          ← Back to BridgeToRetired
        </Link>
      </div>
    </div>
  )
}
