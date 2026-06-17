import type { Metadata } from 'next'
import Link from 'next/link'
import CoastFIRECalculator from '@/components/calculators/CoastFIRECalculator'

export const metadata: Metadata = {
  title: 'CoastFIRE Calculator 2026 | BridgeToRetired',
  description: 'Calculate your CoastFIRE number — how much you need saved today so compounding alone reaches your FIRE target. See when you can stop contributing and start coasting.',
  alternates: { canonical: 'https://bridgetoretired.com/tools/coast-fire-calculator' },
}

export default function CoastFIREPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="bg-navy border-b border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-5 pt-12 pb-10">
          <Link href="/tools" className="font-mono text-[10px] tracking-widest uppercase text-white/30 hover:text-gold transition-colors flex items-center gap-2 mb-6">
            ← All Tools
          </Link>
          <div className="font-mono text-[9px] tracking-widest uppercase text-gold mb-3">FIRE Planning</div>
          <h1 className="font-syne font-bold text-[clamp(26px,4vw,46px)] tracking-tight text-white leading-tight mb-3">
            CoastFIRE Calculator
          </h1>
          <p className="text-white/50 text-[15px] leading-relaxed max-w-xl">
            Find the exact amount you need saved today so that compounding alone — with zero additional contributions — gets you to your FIRE number by retirement age.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 py-12">
        <CoastFIRECalculator />

        <div className="max-w-3xl mt-8">
          <h2 className="font-syne font-bold text-[22px] tracking-tight text-white mb-4">
            What Is CoastFIRE?
          </h2>
          <div className="space-y-4 text-white/55 text-[14px] leading-[1.8] mb-8">
            <p>
              CoastFIRE is the point at which you have enough invested that — assuming a reasonable growth rate — your portfolio will grow to your full FIRE number by your target retirement age without any additional contributions. You can "coast" to retirement.
            </p>
            <p>
              The name comes from the idea of coasting on a bike: you've done the hard work of climbing the hill, and now you can just let momentum carry you to the finish. Once you've hit your CoastFIRE number, you only need to earn enough to cover your current living expenses — not save for retirement on top of that.
            </p>
            <p>
              This makes CoastFIRE an attractive milestone for people who want to downshift before full retirement — switching to part-time work, a lower-stress job, or taking a sabbatical — knowing that their retirement is already mathematically funded.
            </p>
          </div>

          <h2 className="font-syne font-bold text-[22px] tracking-tight text-white mb-4">
            How the CoastFIRE Number Is Calculated
          </h2>
          <div className="space-y-4 text-white/55 text-[14px] leading-[1.8] mb-8">
            <p>
              The CoastFIRE number is your full FIRE number discounted back to today using your expected growth rate. If you need $2M to retire at 55, and you have 20 years at 7% growth, your CoastFIRE number is $2M ÷ (1.07)²⁰ = $517,000. Put another way: $517K growing at 7% for 20 years becomes $2M.
            </p>
            <p>
              The full FIRE number itself depends on your annual spending and a safe withdrawal rate. For early retirements spanning 35-40 years, most researchers recommend a 3.0-3.3% withdrawal rate rather than the traditional 4% rule, which was designed for 30-year retirements. This calculator adjusts the withdrawal rate based on your retirement age.
            </p>
          </div>

          <h2 className="font-syne font-bold text-[22px] tracking-tight text-white mb-4">
            CoastFIRE vs BaristaFIRE vs Full FIRE
          </h2>
          <div className="space-y-4 text-white/55 text-[14px] leading-[1.8] mb-8">
            <p>
              <strong className="text-white/80">CoastFIRE</strong> — You've saved enough that compounding handles the rest. You still need to work to cover current expenses, but you're not saving for retirement anymore.
            </p>
            <p>
              <strong className="text-white/80">BaristaFIRE</strong> — You've partially funded retirement and work part-time (traditionally at a job with benefits like a coffee shop) to cover the gap between your partial portfolio income and your full spending needs.
            </p>
            <p>
              <strong className="text-white/80">Full FIRE</strong> — Your portfolio is large enough to fund all expenses indefinitely at a safe withdrawal rate. No work required.
            </p>
            <p>
              CoastFIRE is typically achieved years before full FIRE, making it an important intermediate milestone. Many people find that hitting CoastFIRE reduces financial anxiety significantly — the retirement math is already solved, and any additional savings are a bonus.
            </p>
          </div>

          <h2 className="font-syne font-bold text-[22px] tracking-tight text-white mb-4">
            What to Do After You Hit CoastFIRE
          </h2>
          <div className="space-y-4 text-white/55 text-[14px] leading-[1.8] mb-8">
            <p>
              Hitting CoastFIRE changes the financial planning problem. Instead of "how do I accumulate enough?", the question becomes "how do I access my money before 59½?" Most early retirees have the majority of their savings in tax-deferred accounts — 401(k)s and IRAs — with early withdrawal penalties until age 59½.
            </p>
            <p>
              This is where bridge planning becomes critical. A taxable brokerage account, Roth conversion ladder, or 72(t) SEPP arrangement can provide penalty-free income during the years between when you stop working and when you can access retirement accounts freely.
            </p>
            <p>
              Use the <Link href="/tools/bridge-strategy-calculator" className="text-gold hover:text-gold/80 transition-colors">Bridge Strategy Calculator</Link> to model your full withdrawal plan, the <Link href="/tools/roth-conversion-ladder-calculator" className="text-gold hover:text-gold/80 transition-colors">Roth Conversion Ladder Calculator</Link> for tax-efficient access, or the <Link href="/tools/72t-sepp-calculator" className="text-gold hover:text-gold/80 transition-colors">72(t) SEPP Calculator</Link> for immediate penalty-free distributions.
            </p>
          </div>

          <h2 className="font-syne font-bold text-[22px] tracking-tight text-white mb-4">
            Frequently Asked Questions
          </h2>
          <div className="space-y-5 mb-10">
            {[
              {
                q: 'What growth rate should I use for CoastFIRE?',
                a: '7% is a common real (inflation-adjusted) return assumption for a diversified stock portfolio, based on historical US market averages. Some planners use 6% for conservatism. Using a lower growth rate increases your CoastFIRE number; higher rates decrease it. The calculator defaults to 7% but you can adjust the slider.',
              },
              {
                q: 'Does CoastFIRE account for inflation?',
                a: 'If you use a real (inflation-adjusted) growth rate like 7%, then your CoastFIRE number is already in today\'s dollars. If you use a nominal rate like 10%, you\'d need to inflate both your future spending and FIRE number. The simplest approach is to use real rates throughout, which is what this calculator does.',
              },
              {
                q: 'Can I hit CoastFIRE in a 401(k) or does it need to be in taxable accounts?',
                a: 'CoastFIRE just refers to the total portfolio value — it can be in any account type. However, if your CoastFIRE savings are all in tax-deferred accounts like a 401(k), you\'ll still need a plan to access them before 59½ without penalties. This is why bridge planning matters even after reaching CoastFIRE.',
              },
              {
                q: 'What is the difference between CoastFIRE and LeanFIRE?',
                a: 'CoastFIRE is about when you can stop contributing to retirement savings. LeanFIRE is about achieving full retirement on a very lean budget (typically under $40,000/year). They\'re independent concepts — you can be pursuing LeanFIRE while on a CoastFIRE path, or targeting a higher spend in full FIRE while coasting.',
              },
              {
                q: 'What if the market drops right after I reach CoastFIRE?',
                a: 'A significant market drop could push you below your CoastFIRE number, requiring more contributions to get back on track. This is sequence of returns risk applied to the accumulation phase. Building in a buffer — targeting slightly above the minimum CoastFIRE number — provides protection against this.',
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
              { href: '/tools/fire-number-calculator',              label: 'FIRE Number Calculator' },
              { href: '/tools/bridge-strategy-calculator',          label: 'Bridge Strategy Calculator' },
              { href: '/tools/roth-conversion-ladder-calculator',   label: 'Roth Conversion Ladder' },
              { href: '/tools/72t-sepp-calculator',                 label: '72(t) SEPP Calculator' },
              { href: '/blog/roth-conversion-ladder-guide',         label: 'Roth Conversion Ladder Guide' },
              { href: '/blog/how-much-taxable-brokerage-to-retire-early', label: 'How Much Taxable Do I Need?' },
            ].map(({ href, label }) => (
              <Link key={href} href={href}
                className="flex items-center gap-3 bg-ink border border-white/[0.07] rounded-lg px-4 py-3 hover:border-gold/20 transition-colors group">
                <span className="font-mono text-[11px] text-white/50 group-hover:text-gold/80 transition-colors">{label} →</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}