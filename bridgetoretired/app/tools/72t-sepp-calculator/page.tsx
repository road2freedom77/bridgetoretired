import type { Metadata } from 'next'
import Link from 'next/link'
import SEPP72tToolkit from '@/components/calculators/SEPP72tToolkit'

export const metadata: Metadata = {
  title: '72t SEPP Calculator — All Three IRS Methods | BridgeToRetired',
  description: 'Calculate penalty-free 72t SEPP distributions from your IRA or 401k before age 59½. Compare RMD, fixed amortization, and fixed annuitization side by side. Includes Notice 2022-6 rate cap and account splitting strategy.',
  alternates: { canonical: 'https://bridgetoretired.com/tools/72t-sepp-calculator' },
}

export default function SEPPCalculatorPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="bg-navy border-b border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-5 pt-12 pb-10">
          <Link href="/tools" className="font-mono text-[10px] tracking-widest uppercase text-white/30 hover:text-gold transition-colors flex items-center gap-2 mb-6">
            ← All Tools
          </Link>
          <div className="font-mono text-[9px] tracking-widest uppercase text-gold mb-3">Rule 72(t) · IRS Notice 2022-6</div>
          <h1 className="font-syne font-bold text-[clamp(26px,4vw,46px)] tracking-tight text-white leading-tight mb-3">
            72t SEPP Calculator
          </h1>
          <p className="text-white/50 text-[15px] leading-relaxed max-w-xl">
            Compare all three IRS-approved methods side by side. Find the highest allowed payment for your situation, see the lock-in timeline, and model the account splitting strategy most calculators don't show.
          </p>
        </div>
      </div>

      {/* Calculator */}
      <SEPP72tToolkit />

      <div className="max-w-4xl mx-auto px-5 pb-16">

        {/* CTA */}
        <div className="my-10 bg-ink border border-teal/20 rounded-xl p-6 flex items-start gap-5">
          <div className="text-3xl shrink-0">📋</div>
          <div className="flex-1">
            <div className="font-mono text-[9px] tracking-widest uppercase text-teal mb-2">Before You Commit</div>
            <h3 className="font-syne font-semibold text-[16px] text-white mb-2">
              Compare 72(t) against your taxable bridge and Roth ladder
            </h3>
            <p className="text-white/45 text-[13px] leading-relaxed mb-4">
              Rule 72(t) locks you into fixed payments for 5+ years. Before committing, model whether a
              taxable brokerage bridge or Roth conversion ladder could cover the same gap with more
              flexibility — and less modification risk.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/tools/bridge-strategy-calculator"
                className="inline-block font-syne font-semibold text-[12px] bg-gold text-black px-5 py-2.5 rounded hover:opacity-85 transition-opacity"
              >
                Model the Full Bridge →
              </Link>
              <Link
                href="/tools/roth-conversion-ladder-calculator"
                className="inline-block font-syne font-semibold text-[12px] border border-white/20 text-white/70 px-5 py-2.5 rounded hover:border-gold/30 hover:text-white transition-all"
              >
                Compare Roth Ladder →
              </Link>
            </div>
          </div>
        </div>

        {/* Educational content */}
        <div className="max-w-3xl">
          <h2 className="font-syne font-bold text-[22px] tracking-tight text-white mb-4">
            What Is a 72(t) SEPP Distribution?
          </h2>
          <div className="space-y-4 text-white/55 text-[14px] leading-[1.8] mb-8">
            <p>
              A 72(t) distribution — formally called a Substantially Equal Periodic Payment (SEPP) — is an
              IRS provision that allows you to take penalty-free withdrawals from your IRA or 401(k) before
              age 59½. Under normal circumstances, early withdrawals trigger a 10% additional tax on top of
              ordinary income tax. The 72(t) exception eliminates that 10% penalty.
            </p>
            <p>
              To qualify, you must take <strong className="text-white/80">substantially equal periodic
              payments</strong> calculated using one of three IRS-approved methods. Payments must continue
              for the longer of five years or until you reach age 59½ — whichever is later. If you start at
              age 52, you must continue until age 59½ (longer than 5 years). If you start at age 56, you
              must continue until age 61 (five years past 59½).
            </p>
            <p>
              The critical risk: if you modify or stop payments before the schedule ends, the IRS
              retroactively applies the 10% penalty to every prior withdrawal, plus interest. This is called
              the modification trap and it's the most common reason 72(t) plans fail.
            </p>
          </div>

          <h2 className="font-syne font-bold text-[22px] tracking-tight text-white mb-4">
            The Three IRS-Approved Methods
          </h2>
          <div className="space-y-4 text-white/55 text-[14px] leading-[1.8] mb-8">
            <p>
              <strong className="text-white/80">Fixed Amortization</strong> — The most commonly used method.
              Calculates a fixed annual payment based on your account balance, life expectancy, and an
              IRS-approved interest rate. Payments stay the same every year. Best for predictable income
              planning. Under Notice 2022-6, you can use any rate up to the greater of 5% or 120% of the
              federal mid-term AFR — higher rate means higher allowed payment.
            </p>
            <p>
              <strong className="text-white/80">Fixed Annuitization</strong> — Similar to amortization but
              uses an annuity factor from IRS mortality tables instead of a direct amortization formula.
              Often produces a payment close to the amortization method. Also fixed each year.
            </p>
            <p>
              <strong className="text-white/80">Required Minimum Distribution (RMD) Method</strong> —
              Divides your account balance by your life expectancy each year. Produces the lowest payment of
              the three methods and recalculates annually as your balance changes. Most flexible after the
              SEPP starts because the payment varies — but you still cannot stop or modify the schedule.
              Useful as an escape valve: you can switch once, irrevocably, from amortization to RMD.
            </p>
          </div>

          <h2 className="font-syne font-bold text-[22px] tracking-tight text-white mb-4">
            The Notice 2022-6 Rate Change
          </h2>
          <div className="space-y-4 text-white/55 text-[14px] leading-[1.8] mb-8">
            <p>
              IRS Notice 2022-6 (effective January 1, 2023) changed the interest rate rules significantly.
              Previously, the maximum allowed rate was 120% of the federal mid-term AFR. Now, the maximum
              is the <strong className="text-white/80">greater of 5% or 120% of the federal mid-term
              AFR</strong> — meaning the floor is 5% regardless of how low rates fall.
            </p>
            <p>
              This matters because most older 72(t) calculators still use the old formula. At today's rates,
              the 5% floor applies — meaning you can use 5% even if 120% of the mid-term AFR is lower. Most
              people should use the maximum allowed rate since higher rate equals higher annual payment.
            </p>
            <p>
              The AFR changes monthly. Check IRS.gov for the current rate before finalizing your plan. You
              can use the rate from either the month of your first distribution or the prior month.
            </p>
          </div>

          <h2 className="font-syne font-bold text-[22px] tracking-tight text-white mb-4">
            When Does 72(t) Make Sense?
          </h2>
          <div className="space-y-4 text-white/55 text-[14px] leading-[1.8] mb-8">
            <p>
              Rule 72(t) is a bridge tool of last resort — not a first choice. Consider it only after
              exhausting more flexible options: taxable brokerage accounts, Roth contribution withdrawals,
              and Rule of 55 (if you left your employer at 55 or older).
            </p>
            <p>
              It makes the most sense when: most of your retirement savings are in an IRA or 401(k), you
              have no taxable brokerage to draw from, you don't qualify for Rule of 55, and your spending
              needs are stable enough to commit to a fixed payment schedule for 5+ years.
            </p>
            <p>
              See the <Link href="/blog/rule-72t-sepp-guide" className="text-gold hover:text-gold/80 transition-colors">
              complete Rule 72(t) SEPP guide</Link> for a full breakdown of when to use it, how to set it
              up, and the most common mistakes to avoid.
            </p>
          </div>

          <h2 className="font-syne font-bold text-[22px] tracking-tight text-white mb-4">
            Frequently Asked Questions
          </h2>
          <div className="space-y-5 mb-10">
            {[
              {
                q: 'What interest rate should I use for the 72(t) calculation?',
                a: 'Under Notice 2022-6, you can use any rate up to the greater of 5% or 120% of the federal mid-term AFR for either of the two months before your first distribution. A higher rate produces a larger payment. Most people should use the maximum allowed rate. Check IRS.gov for the current month\'s AFR.',
              },
              {
                q: 'Can I use 72(t) on a 401(k) or only an IRA?',
                a: 'You can use 72(t) on any qualified retirement account including IRAs, 401(k)s, 403(b)s, and SEP-IRAs. However, most people roll a 401(k) into an IRA first for more control over which balance to apply the SEPP to, since the rule applies to one account at a time.',
              },
              {
                q: 'What happens if I miss a payment?',
                a: 'Missing a payment or taking the wrong amount counts as a modification. The IRS would retroactively apply the 10% penalty to all prior withdrawals plus interest. Work with a CPA to set up automatic distributions so this does not happen accidentally.',
              },
              {
                q: 'Can I do 72(t) on just part of my IRA?',
                a: 'Yes. You can split your IRA into two accounts — apply SEPP to one account and leave the other untouched. This is called IRA segmentation or account splitting. Use the account splitting calculator above (Pro feature) to find exactly how much to put in each account.',
              },
              {
                q: 'Is 72(t) income taxable?',
                a: 'Yes. SEPP distributions avoid the 10% early withdrawal penalty but are still subject to ordinary income tax. Plan for estimated quarterly tax payments if you do not have withholding set up on the distributions.',
              },
              {
                q: 'How does 72(t) compare to Rule of 55?',
                a: 'Rule of 55 is simpler — no fixed payment schedule, no modification risk, and no IRS approval process. But it only works if you left your employer in the year you turned 55 or later, and only applies to that employer\'s 401(k). If you retired earlier or rolled your 401(k) into an IRA, Rule of 55 does not apply.',
              },
              {
                q: 'What is the one-time switch to RMD method?',
                a: 'If you started a SEPP using the amortization or annuitization method, you are allowed to switch once — irrevocably — to the RMD method. This reduces your annual payment but gives you more flexibility if your balance drops significantly. You cannot switch back.',
              },
            ].map(({ q, a }) => (
              <div key={q} className="border-b border-white/[0.06] pb-5">
                <h3 className="font-syne font-semibold text-[15px] text-white mb-2">{q}</h3>
                <p className="text-white/50 text-[13px] leading-relaxed">{a}</p>
              </div>
            ))}
          </div>

          <h2 className="font-syne font-bold text-[22px] tracking-tight text-white mb-4">
            Related Tools & Guides
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { href: '/tools/bridge-strategy-calculator',                label: 'Bridge Strategy Calculator' },
              { href: '/tools/withdrawal-order-optimizer',                label: 'Withdrawal Order Optimizer' },
              { href: '/tools/roth-conversion-ladder-calculator',         label: 'Roth Conversion Ladder Calculator' },
              { href: '/blog/rule-72t-sepp-guide',                       label: 'Rule 72(t) SEPP Guide' },
              { href: '/blog/roth-ladder-vs-72t',                        label: 'Roth Ladder vs 72(t)' },
              { href: '/blog/how-much-taxable-brokerage-to-retire-early', label: 'How Much Taxable Do I Need?' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 bg-ink border border-white/[0.07] rounded-lg px-4 py-3 hover:border-gold/20 transition-colors group"
              >
                <span className="font-mono text-[11px] text-white/50 group-hover:text-gold/80 transition-colors">
                  {label} →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}