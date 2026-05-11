import type { Metadata } from 'next'
import Link from 'next/link'
import FIRENumberCalculator from '@/components/FIRENumberCalculator'

export const metadata: Metadata = {
  title: 'FIRE Number Calculator — How Much Do I Need to Retire Early? | BridgeToRetired',
  description: 'Calculate your real FIRE number for early retirement. Goes beyond the 4% rule to include bridge years, healthcare costs, Social Security, and sequence risk buffer.',
  alternates: { canonical: 'https://bridgetoretired.com/tools/fire-number-calculator' },
}

export default function FIRENumberCalculatorPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="bg-navy border-b border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-5 pt-12 pb-10">
          <Link href="/tools" className="font-mono text-[10px] tracking-widest uppercase text-white/30 hover:text-gold transition-colors flex items-center gap-2 mb-6">
            ← All Tools
          </Link>
          <div className="font-mono text-[9px] tracking-widest uppercase text-gold mb-3">FIRE Planning</div>
          <h1 className="font-syne font-bold text-[clamp(26px,4vw,46px)] tracking-tight text-white leading-tight mb-3">
            FIRE Number Calculator
          </h1>
          <p className="text-white/50 text-[15px] leading-relaxed max-w-xl">
            Find out exactly how much you need to retire early — with bridge years, healthcare costs, and Social Security built in. Goes beyond the simple 25x rule.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 py-12">
        <FIRENumberCalculator />

        {/* Tool-specific CTA */}
        <div className="my-10 bg-ink border border-gold/20 rounded-xl p-6 flex items-start gap-5">
          <div className="text-3xl shrink-0">🌉</div>
          <div className="flex-1">
            <div className="font-mono text-[9px] tracking-widest uppercase text-gold mb-2">Next Step</div>
            <h3 className="font-syne font-semibold text-[16px] text-white mb-2">
              Now check if your bridge years are funded
            </h3>
            <p className="text-white/45 text-[13px] leading-relaxed mb-4">
              Your FIRE number shows the total target. The Bridge Strategy Calculator shows whether your taxable, 401(k), and Roth accounts are structured to actually get you there — year by year from retirement to age 90.
            </p>
            <Link
              href="/tools/bridge-strategy-calculator"
              className="inline-block font-syne font-semibold text-[12px] bg-gold text-black px-5 py-2.5 rounded hover:opacity-85 transition-opacity"
            >
              Model Your Bridge Plan →
            </Link>
          </div>
        </div>

        <div className="max-w-3xl">
          <h2 className="font-syne font-bold text-[22px] tracking-tight text-white mb-4">
            What Is a FIRE Number?
          </h2>
          <div className="space-y-4 text-white/55 text-[14px] leading-[1.8] mb-8">
            <p>
              A FIRE number is the total portfolio size needed to sustain your lifestyle without working — the point at which your investments generate enough returns to cover your spending indefinitely. FIRE stands for Financial Independence, Retire Early, and the number is the central target of the movement.
            </p>
            <p>
              The most common starting point is the <strong className="text-white/80">25x rule</strong>: multiply your annual spending by 25 to get your FIRE number. This is derived from the 4% rule — the idea that withdrawing 4% of a diversified portfolio annually has historically lasted 30 years in most market conditions.
            </p>
            <p>
              However, for early retirement at 50, 52, or 55, the simple 25x rule significantly underestimates what you actually need. The calculator above accounts for the real complexity of early retirement: a longer retirement horizon, bridge years before retirement account access, healthcare before Medicare, Social Security timing, and a sequence of returns buffer.
            </p>
          </div>

          <h2 className="font-syne font-bold text-[22px] tracking-tight text-white mb-4">
            Why the 4% Rule Underestimates for Early Retirement
          </h2>
          <div className="space-y-4 text-white/55 text-[14px] leading-[1.8] mb-8">
            <p>
              The 4% rule was designed by financial planner William Bengen in 1994 for a <strong className="text-white/80">30-year retirement</strong> starting around age 65. It was never intended for 35-40 year retirements starting at 50-55. Research supports lower withdrawal rates for longer horizons:
            </p>
            <p>
              At a 35-year horizon, a 3.7% withdrawal rate is more appropriate. At 40 years, 3.3%. At 45-50 years, 3.0-3.3%. These lower rates require significantly larger portfolios — a $60,000/year spender needs $1.5M at 4%, but $1.82M at 3.3%. That $320,000 difference is the cost of retiring 10-15 years early that the simple rule misses.
            </p>
            <p>
              The calculator above uses research-adjusted withdrawal rates based on your target retirement age, automatically applying the correct rate for your retirement horizon.
            </p>
          </div>

          <h2 className="font-syne font-bold text-[22px] tracking-tight text-white mb-4">
            The Four Components of a Real Early Retirement FIRE Number
          </h2>
          <div className="space-y-4 text-white/55 text-[14px] leading-[1.8] mb-8">
            <p>
              <strong className="text-white/80">1. Bridge account (taxable/Roth):</strong> The money needed to fund spending from retirement until age 59½, when retirement accounts become fully accessible. A 50-year-old needs 9.5 years of bridge funding; a 55-year-old needs 4.5 years. This bucket lives in taxable brokerage accounts and Roth contributions.
            </p>
            <p>
              <strong className="text-white/80">2. Retirement account balance (401k/IRA):</strong> The amount needed in tax-deferred accounts to fund spending after 59½, reduced by Social Security income. This is calculated using the adjusted withdrawal rate for your retirement horizon.
            </p>
            <p>
              <strong className="text-white/80">3. Healthcare buffer:</strong> The cost of health insurance before Medicare at age 65. A 50-year-old needs 15 years of coverage; a 55-year-old needs 10 years. Even with ACA subsidies, this is a significant cost that the simple 25x rule ignores entirely.
            </p>
            <p>
              <strong className="text-white/80">4. Sequence of returns buffer:</strong> An additional 1-2 years of spending as a cushion against a market crash in the first few years of retirement. Without this buffer, a bad early sequence can permanently impair the portfolio. See the <Link href="/tools/sequence-of-returns-simulator" className="text-gold hover:text-gold/80 transition-colors">Sequence of Returns Simulator</Link> to understand why this matters.
            </p>
          </div>

          <h2 className="font-syne font-bold text-[22px] tracking-tight text-white mb-4">
            Frequently Asked Questions
          </h2>
          <div className="space-y-5 mb-10">
            {[
              {
                q: 'What is the FIRE number for someone spending $50,000 per year?',
                a: 'At the simple 4% rule: $1,250,000. For early retirement at 50 (40-year horizon) with a 3.3% rate: $1,515,000 for the retirement account portion alone, plus bridge funding of roughly $220,000 (4.5 years at $50K), plus healthcare. Total real number for a 50-year-old spending $50K is typically $1.8M-$2.2M depending on healthcare and Social Security assumptions.'
              },
              {
                q: 'What is the difference between FIRE, lean FIRE, and fat FIRE?',
                a: 'FIRE (Financial Independence, Retire Early) is the general concept of building enough wealth to live without working. Lean FIRE targets a minimal budget, typically under $40,000/year. Fat FIRE targets a comfortable or affluent lifestyle, typically $80,000-$120,000+ per year. Coast FIRE means you have enough saved that it will grow to your FIRE number by traditional retirement age without additional contributions.'
              },
              {
                q: 'Does Social Security count toward my FIRE number?',
                a: 'Social Security reduces how much your portfolio needs to generate after it begins. A $24,000/year SS benefit at 67 reduces your required annual portfolio withdrawal by that amount. The calculator accounts for this by calculating the 401k/IRA portion based on spending minus SS income — reducing the total portfolio needed.'
              },
              {
                q: 'How does the bridge account fit into my FIRE number?',
                a: 'The bridge account is the taxable brokerage and Roth contribution portion of your portfolio that funds spending before age 59½. It is separate from your retirement account because it serves a different purpose — providing liquidity without penalty during the bridge years. Your total FIRE number includes both the bridge account and the retirement account balance.'
              },
              {
                q: 'Should I include my home equity in my FIRE number?',
                a: 'Generally no — home equity is illiquid and your primary residence doesn\'t generate income. Include only investable assets: taxable brokerage, IRAs, 401(k)s, and Roth accounts. A paid-off home can reduce your spending needs (no rent or mortgage), which indirectly lowers your FIRE number by reducing the annual spending figure.'
              },
              {
                q: 'What is the Coast FIRE number?',
                a: 'Coast FIRE is the amount you need saved today so that it will grow to your full FIRE number by traditional retirement age (65) without any additional contributions, assuming a historical market return of around 7% real. If you have reached your Coast FIRE number, you only need to earn enough to cover current expenses — your investments do the rest.'
              },
            ].map(({ q, a }) => (
              <div key={q} className="border-b border-white/[0.06] pb-5">
                <h3 className="font-syne font-semibold text-[15px] text-white mb-2">{q}</h3>
                <p className="text-white/50 text-[13px] leading-relaxed">{a}</p>
              </div>
            ))}
          </div>

          <h2 className="font-syne font-bold text-[22px] tracking-tight text-white mb-4">Related Tools & Guides</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { href: '/tools/bridge-strategy-calculator',               label: 'Bridge Strategy Calculator' },
              { href: '/tools/sequence-of-returns-simulator',            label: 'Sequence of Returns Simulator' },
              { href: '/tools/aca-subsidy-estimator',                    label: 'ACA Subsidy Estimator' },
              { href: '/blog/can-i-retire-at-55-with-750k',             label: 'Can I Retire at 55 With $750K?' },
              { href: '/blog/how-much-taxable-brokerage-to-retire-early', label: 'How Much Taxable Do I Need?' },
              { href: '/blog/what-is-retirement-bridge-strategy',        label: 'Bridge Strategy Guide' },
            ].map(({ href, label }) => (
              <Link key={href} href={href} className="flex items-center gap-3 bg-ink border border-white/[0.07] rounded-lg px-4 py-3 hover:border-gold/20 transition-colors group">
                <span className="font-mono text-[11px] text-white/50 group-hover:text-gold/80 transition-colors">{label} →</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}