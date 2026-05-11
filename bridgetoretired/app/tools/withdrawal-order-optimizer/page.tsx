import type { Metadata } from 'next'
import Link from 'next/link'
import WithdrawalOrderOptimizer from '@/components/WithdrawalOrderOptimizer'

export const metadata: Metadata = {
  title: 'Withdrawal Order Optimizer — Tax-Optimal Retirement Withdrawals | BridgeToRetired',
  description: 'See how withdrawal order affects your lifetime wealth in early retirement. Compare optimal vs wrong order and find the tax-efficient sequence for taxable, 401(k), and Roth accounts.',
  alternates: { canonical: 'https://bridgetoretired.com/tools/withdrawal-order-optimizer' },
}

export default function WithdrawalOrderOptimizerPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-navy border-b border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-5 pt-12 pb-10">
          <Link href="/tools" className="font-mono text-[10px] tracking-widest uppercase text-white/30 hover:text-gold transition-colors flex items-center gap-2 mb-6">
            ← All Tools
          </Link>
          <div className="font-mono text-[9px] tracking-widest uppercase text-gold mb-3">Tax Strategy</div>
          <h1 className="font-syne font-bold text-[clamp(26px,4vw,46px)] tracking-tight text-white leading-tight mb-3">
            Withdrawal Order Optimizer
          </h1>
          <p className="text-white/50 text-[15px] leading-relaxed max-w-xl">
            Find the tax-optimal order to draw from taxable, 401(k), and Roth accounts in early retirement. See exactly how much the wrong order costs you over a lifetime.
          </p>
        </div>
      </div>

      {/* Calculator */}
      <div className="max-w-4xl mx-auto px-5 py-12">
        <WithdrawalOrderOptimizer />

        {/* SEO content */}
        <div className="mt-8 max-w-3xl">
          <h2 className="font-syne font-bold text-[22px] tracking-tight text-white mb-4">
            Why Withdrawal Order Matters in Early Retirement
          </h2>
          <div className="space-y-4 text-white/55 text-[14px] leading-[1.8] mb-8">
            <p>
              Most people focus on how much they need to retire. Far fewer focus on which account to draw from first — and in early retirement, that sequencing decision can be worth hundreds of thousands of dollars over a lifetime.
            </p>
            <p>
              The core problem is the <strong className="text-white/80">bridge years</strong> — the gap between your retirement date and age 59½ when retirement accounts become fully accessible without penalty. During this window, drawing from the wrong account triggers a 10% early withdrawal penalty on top of ordinary income tax. At a 22% income tax rate, that's a 32% total cost on every dollar withdrawn from a 401(k) or IRA early.
            </p>
            <p>
              Drawing from a taxable brokerage account instead — where long-term capital gains are taxed at 0% to 15% depending on your income — can reduce the effective tax rate on those same dollars to near zero for early retirees with carefully managed income.
            </p>
          </div>

          <h2 className="font-syne font-bold text-[22px] tracking-tight text-white mb-4">
            The Optimal Withdrawal Sequence
          </h2>
          <div className="space-y-4 text-white/55 text-[14px] leading-[1.8] mb-8">
            <p>
              <strong className="text-white/80">During bridge years (before 59½):</strong> Draw from taxable brokerage first. Long-term capital gains rates are low — often 0% if your income is managed below the 15% LTCG threshold. After taxable, use Roth contributions (not earnings), which are always accessible penalty-free. Use 72(t) SEPP from a 401(k) only as a last resort.
            </p>
            <p>
              <strong className="text-white/80">After 59½ (401k unlocked):</strong> Flip the order. Draw from your 401(k) or traditional IRA first to reduce the balance that will be subject to Required Minimum Distributions at age 73. Let taxable accounts recover and compound. Draw from Roth last — it has no RMDs, grows tax-free, and passes to heirs tax-free.
            </p>
            <p>
              This two-phase approach minimizes penalty exposure during the bridge, reduces future RMD burden, and maximizes the Roth's tax-free compounding over the longest possible horizon.
            </p>
            <p>
              For the full explanation of how these accounts work together, see the <Link href="/blog/withdrawal-order-taxable-roth-401k" className="text-gold hover:text-gold/80 transition-colors">withdrawal order guide</Link> and the <Link href="/blog/what-is-retirement-bridge-strategy" className="text-gold hover:text-gold/80 transition-colors">bridge strategy overview</Link>.
            </p>
          </div>

          <h2 className="font-syne font-bold text-[22px] tracking-tight text-white mb-4">
            Frequently Asked Questions
          </h2>
          <div className="space-y-5 mb-10">
            {[
              {
                q: 'Should I always draw from taxable accounts first in retirement?',
                a: 'During the bridge years before 59½, yes — taxable accounts avoid the 10% early withdrawal penalty. After 59½, the optimal order often flips: draw from your 401(k) first to reduce future RMDs, then taxable, then Roth last.'
              },
              {
                q: 'What is the tax cost of drawing from a 401(k) before 59½?',
                a: 'A 10% early withdrawal penalty plus ordinary income tax — typically 22-24% for middle-income earners, giving a combined cost of 32-34% on every dollar withdrawn. On a $50,000 withdrawal that\'s $16,000-$17,000 in tax and penalties.'
              },
              {
                q: 'Can I draw from my Roth IRA early without penalty?',
                a: 'You can always withdraw your Roth contributions (not earnings) tax-free and penalty-free at any age. Roth earnings require age 59½ and a 5-year seasoning period. Roth conversions have their own 5-year clock per conversion.'
              },
              {
                q: 'What are Required Minimum Distributions and why do they matter?',
                a: 'RMDs are mandatory annual withdrawals from traditional 401(k)s and IRAs starting at age 73. The IRS requires these to collect the deferred taxes. If your 401(k) balance is very large at 73, RMDs can push you into higher tax brackets. Drawing from the 401(k) earlier — after 59½ — reduces this forced future income.'
              },
              {
                q: 'Does Roth IRA have RMDs?',
                a: 'No. Roth IRAs have no RMDs during the owner\'s lifetime, which is one reason to preserve them as long as possible. Roth 401(k)s do have RMDs, but you can roll a Roth 401(k) into a Roth IRA to eliminate this requirement.'
              },
              {
                q: 'How does Social Security affect withdrawal order?',
                a: 'Once Social Security begins (typically 62-70), it reduces the amount you need to withdraw from your portfolio each year. This can lower your taxable income enough to keep 401(k) withdrawals in a lower bracket — another reason to coordinate SS timing with your withdrawal strategy.'
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
              { href: '/tools/72t-sepp-calculator',                      label: '72(t) SEPP Calculator' },
              { href: '/blog/withdrawal-order-taxable-roth-401k',        label: 'Withdrawal Order Guide' },
              { href: '/blog/what-is-retirement-bridge-strategy',        label: 'Bridge Strategy Guide' },
              { href: '/blog/roth-conversion-ladder-guide',              label: 'Roth Conversion Ladder Guide' },
              { href: '/blog/zero-tax-early-retirement',                 label: 'Zero Tax Early Retirement' },
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