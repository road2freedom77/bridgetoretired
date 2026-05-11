import type { Metadata } from 'next'
import Link from 'next/link'
import RothLadderBuilder from '@/components/RothLadderBuilder'

export const metadata: Metadata = {
  title: 'Roth Conversion Ladder Calculator 2026 | BridgeToRetired',
  description: 'Plan your Roth conversion ladder for early retirement. Model annual conversions, tax cost, unlock schedule, and estimated tax savings vs your working years rate.',
  alternates: { canonical: 'https://bridgetoretired.com/tools/roth-conversion-ladder-calculator' },
}

export default function RothConversionLadderPage() {
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
            Roth Conversion Ladder Calculator
          </h1>
          <p className="text-white/50 text-[15px] leading-relaxed max-w-xl">
            Model your annual Roth conversions, see the tax cost at each income level, and track when each rung of the ladder unlocks penalty-free access.
          </p>
        </div>
      </div>

      {/* Calculator */}
      <div className="max-w-4xl mx-auto px-5 py-12">
        <RothLadderBuilder />

        {/* SEO content */}
        <div className="mt-8 max-w-3xl">
          <h2 className="font-syne font-bold text-[22px] tracking-tight text-white mb-4">
            What Is a Roth Conversion Ladder?
          </h2>
          <div className="space-y-4 text-white/55 text-[14px] leading-[1.8] mb-8">
            <p>
              A Roth conversion ladder is a strategy for building penalty-free access to retirement funds before age 59½. It works by converting money from a traditional IRA or 401(k) into a Roth IRA each year, paying ordinary income tax at conversion, and then waiting five years for each converted amount to become accessible without penalty.
            </p>
            <p>
              The strategy is especially powerful for early retirees because it lets you move money from a tax-deferred account into a tax-free account during years when your income is low — often at 10-12% effective tax rates — rather than paying 22-24%+ while working. Once in Roth, the money grows and withdraws completely tax-free for the rest of your life.
            </p>
            <p>
              The ladder structure comes from starting conversions 5 years before you need the money, so that each annual conversion "rung" unlocks just as you need it for spending. A retiree at age 50 who starts converting immediately can access the first rung penalty-free at age 55.
            </p>
          </div>

          <h2 className="font-syne font-bold text-[22px] tracking-tight text-white mb-4">
            The 5-Year Seasoning Rule
          </h2>
          <div className="space-y-4 text-white/55 text-[14px] leading-[1.8] mb-8">
            <p>
              Each Roth conversion has its own 5-year clock. Money converted in 2026 becomes accessible without the 10% early withdrawal penalty in 2031. Money converted in 2027 unlocks in 2032, and so on. This is separate from the 5-year rule for Roth IRA earnings, which requires the account to be at least 5 years old.
            </p>
            <p>
              The critical implication: the ladder requires you to plan 5 years ahead. If you retire at 50 and haven't started converting, you cannot access any converted Roth funds until age 55 at the earliest. You need enough in taxable brokerage accounts or Roth contributions to fund the first 5 years of retirement while the ladder seasons.
            </p>
            <p>
              See the <Link href="/blog/roth-conversion-ladder-guide" className="text-gold hover:text-gold/80 transition-colors">complete Roth conversion ladder guide</Link> for a step-by-step breakdown of how to set up the strategy and avoid common mistakes.
            </p>
          </div>

          <h2 className="font-syne font-bold text-[22px] tracking-tight text-white mb-4">
            How Much to Convert Each Year
          </h2>
          <div className="space-y-4 text-white/55 text-[14px] leading-[1.8] mb-8">
            <p>
              The optimal annual conversion amount fills your lowest available tax brackets without pushing into higher ones. In 2026, a married couple filing jointly has a standard deduction of $30,000, meaning the first $30,000 of income is tax-free. The 10% bracket covers the next $23,850, and the 12% bracket covers up to about $97,000 of taxable income.
            </p>
            <p>
              Many early retirees target conversions that fill the 12% bracket — roughly $50,000-$80,000 per year depending on other income sources. This locks in a low effective tax rate (often 8-12%) on money that would otherwise be taxed at 22-24%+ when withdrawn in retirement.
            </p>
            <p>
              However, conversions also count as MAGI for ACA subsidy purposes. If healthcare subsidies are important to your plan, you may need to limit conversions to stay below the 400% FPL threshold. Use the <Link href="/tools/aca-subsidy-estimator" className="text-gold hover:text-gold/80 transition-colors">ACA Subsidy Estimator</Link> alongside this calculator to find the optimal balance.
            </p>
          </div>

          <h2 className="font-syne font-bold text-[22px] tracking-tight text-white mb-4">
            Frequently Asked Questions
          </h2>
          <div className="space-y-5 mb-10">
            {[
              {
                q: 'What is the difference between Roth contributions and Roth conversions?',
                a: 'Roth contributions are after-tax dollars you put directly into a Roth IRA each year (subject to income limits and contribution limits). Roth conversions are transfers from a traditional IRA or 401(k) to a Roth IRA — you pay ordinary income tax on the converted amount. Contributions are always accessible penalty-free; conversions have a 5-year seasoning period per conversion.'
              },
              {
                q: 'Can I do a Roth conversion if I have no earned income in retirement?',
                a: 'Yes. Unlike regular Roth contributions, Roth conversions have no earned income requirement. You can convert any amount from a traditional IRA or 401(k) regardless of whether you are working. You simply pay ordinary income tax on the converted amount in the year of conversion.'
              },
              {
                q: 'Do Roth conversions affect ACA health insurance subsidies?',
                a: 'Yes. Roth conversions count as taxable income and are included in MAGI for ACA purposes. If your conversions push your income above 400% FPL, you lose your ACA premium tax credits entirely. Plan conversions carefully to balance the tax savings against subsidy eligibility.'
              },
              {
                q: 'What happens to Roth conversions if I need the money before 5 years?',
                a: 'If you withdraw a Roth conversion within 5 years of the conversion date and are under 59½, the 10% early withdrawal penalty applies to the converted amount. The tax was already paid at conversion, but the penalty still applies. This is why the ladder strategy requires taxable or Roth contribution funds to cover the first 5 years.'
              },
              {
                q: 'Is the Roth conversion ladder better than 72(t) SEPP?',
                a: 'They solve different problems and are often used together. The Roth ladder is better for flexibility — once you have the ladder running, each rung is fully accessible without any ongoing commitment. SEPP is better for immediate access to a specific account before conversions have seasoned. SEPP requires a fixed payment schedule for 5 years; the Roth ladder requires no fixed schedule after setup.'
              },
              {
                q: 'Can I do a Roth conversion from a 401(k) directly?',
                a: 'Many 401(k) plans allow in-plan Roth conversions, but not all. If your plan doesn\'t allow it, you can roll the 401(k) to a traditional IRA first and then convert from the IRA. Be cautious: rolling a current-employer 401(k) into an IRA eliminates your ability to use Rule of 55 for penalty-free access.'
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
              { href: '/tools/aca-subsidy-estimator',                    label: 'ACA Subsidy Estimator' },
              { href: '/tools/72t-sepp-calculator',                      label: '72(t) SEPP Calculator' },
              { href: '/blog/roth-conversion-ladder-guide',              label: 'Roth Conversion Ladder Guide' },
              { href: '/blog/withdrawal-order-taxable-roth-401k',        label: 'Withdrawal Order Guide' },
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