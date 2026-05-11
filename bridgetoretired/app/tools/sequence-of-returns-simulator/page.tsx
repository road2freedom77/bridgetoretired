import type { Metadata } from 'next'
import Link from 'next/link'
import SequenceOfReturnsSimulator from '@/components/SequenceOfReturnsSimulator'

export const metadata: Metadata = {
  title: 'Sequence of Returns Risk Simulator | BridgeToRetired',
  description: 'See how the timing of market crashes permanently affects your retirement portfolio. Same average returns, completely different outcomes — model sequence risk before you retire.',
  alternates: { canonical: 'https://bridgetoretired.com/tools/sequence-of-returns-simulator' },
}

export default function SequenceOfReturnsPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-navy border-b border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-5 pt-12 pb-10">
          <Link href="/tools" className="font-mono text-[10px] tracking-widest uppercase text-white/30 hover:text-gold transition-colors flex items-center gap-2 mb-6">
            ← All Tools
          </Link>
          <div className="font-mono text-[9px] tracking-widest uppercase text-gold mb-3">Risk Planning</div>
          <h1 className="font-syne font-bold text-[clamp(26px,4vw,46px)] tracking-tight text-white leading-tight mb-3">
            Sequence of Returns Risk Simulator
          </h1>
          <p className="text-white/50 text-[15px] leading-relaxed max-w-xl">
            See how a market crash in year one destroys portfolios that a crash in year twenty would survive. Same returns. Same portfolio. Completely different outcomes.
          </p>
        </div>
      </div>

      {/* Calculator */}
      <div className="max-w-4xl mx-auto px-5 py-12">
        <SequenceOfReturnsSimulator />

        {/* SEO content */}
        <div className="mt-8 max-w-3xl">
          <h2 className="font-syne font-bold text-[22px] tracking-tight text-white mb-4">
            What Is Sequence of Returns Risk?
          </h2>
          <div className="space-y-4 text-white/55 text-[14px] leading-[1.8] mb-8">
            <p>
              Sequence of returns risk is the danger that the timing of investment losses — not just the magnitude — permanently damages your retirement. Two retirees can experience the identical average annual return over 30 years and end up with dramatically different outcomes, simply because one experienced the bad years early and the other experienced them late.
            </p>
            <p>
              The reason is withdrawal math. When you withdraw money from a declining portfolio, you sell more shares to generate the same income. Those shares are then gone — they cannot participate in the recovery. A 30% crash in year one of retirement, combined with continued withdrawals, can permanently impair a portfolio that would have easily survived the same crash in year twenty.
            </p>
            <p>
              This is the most underestimated risk in early retirement planning, and it's especially acute during the bridge years — the period before age 59½ when you're drawing from taxable accounts and haven't yet unlocked retirement account access.
            </p>
          </div>

          <h2 className="font-syne font-bold text-[22px] tracking-tight text-white mb-4">
            Why Early Retirees Face Higher Sequence Risk
          </h2>
          <div className="space-y-4 text-white/55 text-[14px] leading-[1.8] mb-8">
            <p>
              Early retirees face sequence risk for a longer period than traditional retirees. A person who retires at 50 has a potential 40-year retirement horizon — far more years during which a bad early sequence can compound into permanent damage. Traditional retirement planning assumes a 30-year horizon; the math changes materially at 35-40 years.
            </p>
            <p>
              Early retirees also typically have fewer income sources to absorb early losses. No Social Security until at least 62, no pension in most cases, and limited ability to return to a high-income career after an extended break. This makes the portfolio the primary — often only — income source during the vulnerable early years.
            </p>
            <p>
              The bridge strategy addresses this directly. By keeping 2-3 years of spending in stable taxable assets and drawing from those first during a market downturn, you avoid selling equities at depressed prices. The portfolio can recover before you need to sell long-term investments. See the full guide to <Link href="/blog/sequence-of-returns-risk" className="text-gold hover:text-gold/80 transition-colors">sequence of returns risk</Link> for a complete breakdown of protective strategies.
            </p>
          </div>

          <h2 className="font-syne font-bold text-[22px] tracking-tight text-white mb-4">
            How to Protect Against Sequence Risk
          </h2>
          <div className="space-y-4 text-white/55 text-[14px] leading-[1.8] mb-8">
            <p>
              <strong className="text-white/80">Cash buffer strategy:</strong> Keep 1-3 years of spending in cash or short-term bonds. During a market decline, draw from this buffer rather than selling equities at depressed prices. Replenish the buffer when markets recover.
            </p>
            <p>
              <strong className="text-white/80">Flexible spending:</strong> Build the ability to reduce spending by 10-20% during bad market years. This significantly reduces the number of shares that must be sold during a downturn, giving the portfolio time to recover.
            </p>
            <p>
              <strong className="text-white/80">Bucket strategy:</strong> Divide your portfolio into short-term (cash/bonds, 1-3 years), medium-term (balanced, 4-7 years), and long-term (equities, 7+ years) buckets. Draw from the short-term bucket first, refilling from the medium bucket periodically.
            </p>
            <p>
              <strong className="text-white/80">Lower withdrawal rate:</strong> The 4% rule was designed for a 30-year retirement with historical US market returns. For early retirement at 50-55 with a 35-40 year horizon, a 3.3-3.5% withdrawal rate provides significantly better sequence-of-returns protection.
            </p>
            <p>
              <strong className="text-white/80">Delay Social Security:</strong> A larger Social Security benefit starting at 67 or 70 reduces your portfolio withdrawal requirement in later years, decreasing your exposure to sequence risk over the full retirement horizon.
            </p>
          </div>

          <h2 className="font-syne font-bold text-[22px] tracking-tight text-white mb-4">
            Frequently Asked Questions
          </h2>
          <div className="space-y-5 mb-10">
            {[
              {
                q: 'What is the 4% rule and does it protect against sequence risk?',
                a: 'The 4% rule states that withdrawing 4% of your initial portfolio balance annually (adjusted for inflation) has historically survived 30-year retirements in most market conditions. It was derived from historical US market data by William Bengen in 1994. However, it was designed for 30-year retirements starting around age 65. For early retirement with a 35-40 year horizon, a more conservative 3.3-3.5% rate provides better sequence-of-returns protection.'
              },
              {
                q: 'How bad was sequence risk in real historical crashes?',
                a: 'The 2000-2002 dot-com crash and 2008-2009 financial crisis were severe tests of sequence risk. A retiree who retired in 2000 with a 5% withdrawal rate and a 60/40 portfolio saw their portfolio depleted within 15-20 years in some scenarios. A retiree who retired in 1995 with the same parameters survived comfortably because the bad years came later.'
              },
              {
                q: 'Does sequence risk apply to the accumulation phase?',
                a: 'Sequence risk is primarily a decumulation (withdrawal) phenomenon. During accumulation, a market crash is actually beneficial if you are still contributing — you buy more shares at lower prices. The risk reverses when you stop contributing and start withdrawing.'
              },
              {
                q: 'What withdrawal rate is safe for a 40-year retirement?',
                a: 'Research suggests a 3.3-3.5% initial withdrawal rate provides good safety for a 40-year retirement horizon with a diversified portfolio. Some research supports rates as low as 3.0% for maximum safety. The exact safe rate depends on asset allocation, flexibility to reduce spending, and other income sources like Social Security.'
              },
              {
                q: 'How does the bridge strategy protect against sequence risk?',
                a: 'The bridge strategy — keeping liquid taxable assets to fund the gap before retirement account access — provides a natural cash buffer. During a market crash, you draw from taxable accounts (which hold stable assets) rather than selling equities at depressed prices. This gives your growth portfolio time to recover before you need to sell, directly mitigating sequence risk during the most vulnerable early retirement years.'
              },
            ].map(({ q, a }) => (
              <div key={q} className="border-b border-white/[0.06] pb-5">
                <h3 className="font-syne font-semibold text-[15px] text-white mb-2">{q}</h3>
                <p className="text-white/50 text-[13px] leading-relaxed">{a}</p>
              </div>
            ))}
          </div>

          {/* Related tools */}
          <h2 className="font-syne font-bold text-[22px] tracking-tight text-white mb-4">Related Tools & Guides</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { href: '/tools/bridge-strategy-calculator',               label: 'Bridge Strategy Calculator' },
              { href: '/tools/withdrawal-order-optimizer',               label: 'Withdrawal Order Optimizer' },
              { href: '/tools/social-security-calculator',               label: 'Social Security Timing Calculator' },
              { href: '/blog/sequence-of-returns-risk',                  label: 'Sequence of Returns Risk Guide' },
              { href: '/blog/what-is-retirement-bridge-strategy',        label: 'Bridge Strategy Guide' },
              { href: '/blog/how-much-taxable-brokerage-to-retire-early', label: 'How Much Taxable Do I Need?' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 bg-ink border border-white/[0.07] rounded-lg px-4 py-3 hover:border-gold/20 transition-colors group"
              >
                <span className="font-mono text-[11px] text-white/50 group-hover:text-gold/80 transition-colors">{label} →</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}