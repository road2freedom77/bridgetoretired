import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About – BridgeToRetired',
  description: 'Why we built BridgeToRetired and what we are actually trying to do — no fluff, just the mission.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black">

      {/* Header */}
      <div className="bg-navy border-b border-white/[0.06] py-16 px-5">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 font-mono text-[10px] tracking-[0.24em] uppercase text-gold mb-4">
            <span className="block w-6 h-px bg-gold" />
            About
          </div>
          <h1 className="font-syne font-bold text-[clamp(32px,4vw,52px)] tracking-tight text-white mb-4 leading-tight">
            Why BridgeToRetired Exists
          </h1>
          <p className="text-white/50 text-[15px] leading-relaxed max-w-xl">
            No origin story. No "I quit my job and now sip cocktails on a beach" fantasy. Just the real problem — and a free tool to solve it.
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-3xl mx-auto px-5 py-16 space-y-14">

        {/* The problem */}
        <div>
          <div className="flex items-center gap-3 font-mono text-[10px] tracking-[0.24em] uppercase text-gold mb-5">
            <span className="block w-6 h-px bg-gold" />
            The Problem
          </div>
          <h2 className="font-syne font-bold text-[24px] tracking-tight text-white mb-5">
            Most early retirement content skips the hardest part.
          </h2>
          <div className="space-y-4 text-[15px] text-white/60 leading-[1.85]">
            <p>
              There are thousands of FIRE calculators. They'll tell you your "number." They'll tell you when you
              can theoretically retire. What almost none of them tell you is <strong className="text-white">how to
              actually fund the years between retirement and 59½</strong> — without triggering penalties,
              blowing up your tax situation, or running out of money before your accounts unlock.
            </p>
            <p>
              That gap — between when you stop working and when the IRS lets you access your own money
              penalty-free — is the bridge. It's 4 to 12 years for most early retirees. It's the part that
              breaks otherwise solid plans.
            </p>
            <p>
              We built this site and the free planner to map that gap, year by year, account by account.
              Taxable brokerage first. 401(k) untouched and compounding. Roth as the backstop.
              The math isn't complicated — it just wasn't anywhere in one place, laid out clearly, for free.
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/[0.06]" />

        {/* What this site is */}
        <div>
          <div className="flex items-center gap-3 font-mono text-[10px] tracking-[0.24em] uppercase text-gold mb-5">
            <span className="block w-6 h-px bg-gold" />
            What This Site Is
          </div>
          <h2 className="font-syne font-bold text-[24px] tracking-tight text-white mb-5">
            A free planning resource. Nothing more, nothing less.
          </h2>
          <div className="space-y-4 text-[15px] text-white/60 leading-[1.85]">
            <p>
              BridgeToRetired is a content and tools site. The Bridge Planner spreadsheet is free.
              The guides are free. The calculator is free.
            </p>
            <p>
              We make money through <strong className="text-white">affiliate partnerships</strong> — when
              we recommend a tool like Empower or Boldin and you sign up, we may earn a commission.
              This costs you nothing extra, and we only recommend tools that are genuinely useful for
              early retirement planning. Every affiliate link is clearly marked.
            </p>
            <p>
              We are not a financial advisory firm. We are not registered investment advisors.
              Nothing here is personalized financial advice. The planner, calculator, and articles
              are educational tools — a starting point, not a final answer. Always run major
              decisions by a qualified, fee-only financial planner.
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/[0.06]" />

        {/* What this site isn't */}
        <div>
          <div className="flex items-center gap-3 font-mono text-[10px] tracking-[0.24em] uppercase text-gold mb-5">
            <span className="block w-6 h-px bg-gold" />
            Honest Expectations
          </div>
          <h2 className="font-syne font-bold text-[24px] tracking-tight text-white mb-5">
            What we won't pretend.
          </h2>

          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            {[
              {
                icon: '❌',
                title: 'We won\'t guarantee returns',
                desc: 'The calculator uses your assumptions. Real markets don\'t follow spreadsheets. Model conservatively.',
              },
              {
                icon: '❌',
                title: 'We won\'t tell you when to retire',
                desc: 'That depends on your full picture — health, dependents, taxes, risk tolerance. A spreadsheet can\'t weigh all of that.',
              },
              {
                icon: '❌',
                title: 'We aren\'t tax advisors',
                desc: 'Roth conversions, SEPP payments, capital gains harvesting — all highly situation-dependent. Get a CPA.',
              },
              {
                icon: '❌',
                title: 'We aren\'t unbiased on tools',
                desc: 'We earn commissions on some recommendations. We disclose every one. Judge the tools on their merit.',
              },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-ink border border-white/[0.07] rounded-xl p-5">
                <div className="text-xl mb-3">{icon}</div>
                <div className="font-syne font-semibold text-[13px] text-white mb-2">{title}</div>
                <div className="text-[12px] text-white/45 leading-[1.7]">{desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/[0.06]" />

        {/* Mission */}
        <div>
          <div className="flex items-center gap-3 font-mono text-[10px] tracking-[0.24em] uppercase text-gold mb-5">
            <span className="block w-6 h-px bg-gold" />
            The Mission
          </div>
          <div className="bg-ink border border-white/[0.07] rounded-xl p-8">
            <blockquote className="font-lora text-[20px] italic text-white/80 leading-relaxed mb-4">
              "Make the bridge strategy — the single most important and most overlooked part of early
              retirement planning — accessible, free, and actually understandable."
            </blockquote>
            <div className="font-mono text-[10px] tracking-widest uppercase text-white/25">
              — BridgeToRetired
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/[0.06]" />

        {/* CTA */}
        <div className="text-center">
          <div className="font-mono text-[10px] tracking-widest uppercase text-gold mb-4">
            Start Here
          </div>
          <h2 className="font-syne font-bold text-[26px] tracking-tight text-white mb-4">
            Ready to model your bridge?
          </h2>
          <p className="text-white/45 text-[14px] mb-8 max-w-md mx-auto leading-relaxed">
            Download the free planner, run your numbers, and see exactly how the bridge years map out for your situation.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/#download"
              className="bg-gold text-black font-syne font-semibold text-[13px] px-7 py-3.5 rounded hover:opacity-85 transition-opacity"
            >
              Download Free Planner
            </Link>
            <Link
              href="/#calculator"
              className="border border-white/[0.12] text-white/60 font-mono text-[11px] tracking-widest uppercase px-7 py-3.5 rounded hover:border-gold/30 hover:text-white/80 transition-all"
            >
              Try the Calculator
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
