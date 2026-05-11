import type { Metadata } from 'next'
import Link from 'next/link'
import SocialSecurityCalculator from '@/components/SocialSecurityCalculator'

export const metadata: Metadata = {
  title: 'Social Security Timing Calculator — 62 vs 67 vs 70 | BridgeToRetired',
  description: 'Compare claiming Social Security at 62, 67, or 70. See the break-even age, lifetime benefit totals, and how your claiming age affects portfolio longevity in early retirement.',
  alternates: { canonical: 'https://bridgetoretired.com/tools/social-security-calculator' },
}

export default function SocialSecurityCalculatorPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="bg-navy border-b border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-5 pt-12 pb-10">
          <Link href="/tools" className="font-mono text-[10px] tracking-widest uppercase text-white/30 hover:text-gold transition-colors flex items-center gap-2 mb-6">
            ← All Tools
          </Link>
          <div className="font-mono text-[9px] tracking-widest uppercase text-gold mb-3">Social Security</div>
          <h1 className="font-syne font-bold text-[clamp(26px,4vw,46px)] tracking-tight text-white leading-tight mb-3">
            Social Security Timing Calculator
          </h1>
          <p className="text-white/50 text-[15px] leading-relaxed max-w-xl">
            Compare claiming at 62, 67, or 70. See your break-even age, lifetime benefit totals, and how each choice affects your portfolio over a 30-year retirement.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 py-12">
        <SocialSecurityCalculator />

        {/* Tool-specific CTA */}
        <div className="my-10 bg-ink border border-sage/20 rounded-xl p-6 flex items-start gap-5">
          <div className="text-3xl shrink-0">🌉</div>
          <div className="flex-1">
            <div className="font-mono text-[9px] tracking-widest uppercase text-sage mb-2">Layer Into Your Plan</div>
            <h3 className="font-syne font-semibold text-[16px] text-white mb-2">
              See how your claiming age affects your full bridge projection
            </h3>
            <p className="text-white/45 text-[13px] leading-relaxed mb-4">
              Delaying Social Security to 70 means drawing more from your portfolio for 5-8 extra years. The Bridge Strategy Calculator lets you test both scenarios side by side — showing exactly how your portfolio balance changes at 90 depending on when SS starts.
            </p>
            <Link
              href="/tools/bridge-strategy-calculator"
              className="inline-block font-syne font-semibold text-[12px] bg-gold text-black px-5 py-2.5 rounded hover:opacity-85 transition-opacity"
            >
              Model Both SS Scenarios →
            </Link>
          </div>
        </div>

        <div className="max-w-3xl">
          <h2 className="font-syne font-bold text-[22px] tracking-tight text-white mb-4">
            When Should You Claim Social Security?
          </h2>
          <div className="space-y-4 text-white/55 text-[14px] leading-[1.8] mb-8">
            <p>
              Social Security claiming age is one of the highest-leverage financial decisions in retirement planning. Claiming at 62 gives you payments 5 years earlier, but at a permanently reduced amount — typically 70-75% of your full retirement age (FRA) benefit. Waiting until 70 increases your benefit by 8% per year past FRA, giving you roughly 124% of the FRA amount for the rest of your life.
            </p>
            <p>
              For early retirees, the decision is more nuanced than for traditional retirees. If you retire at 50 or 55, you have a 7-17 year gap before Social Security becomes available at all. During that gap, your portfolio does all the heavy lifting. The question becomes: should you claim early at 62 to reduce portfolio withdrawals sooner, or delay to 67 or 70 for a larger permanent income floor later?
            </p>
            <p>
              The answer depends on your health, portfolio size, spending needs, and whether your portfolio can survive the additional draw-down years before a delayed SS benefit kicks in.
            </p>
          </div>

          <h2 className="font-syne font-bold text-[22px] tracking-tight text-white mb-4">
            Understanding the Break-Even Age
          </h2>
          <div className="space-y-4 text-white/55 text-[14px] leading-[1.8] mb-8">
            <p>
              The break-even age is the point at which cumulative lifetime benefits from a later claiming strategy surpass those from an earlier one. For most people, claiming at 67 beats claiming at 62 somewhere between ages 77 and 80. Claiming at 70 beats claiming at 67 between ages 81 and 84.
            </p>
            <p>
              If you expect to live past the break-even age — and the average 62-year-old today has a life expectancy well into their 80s — delaying Social Security is usually the mathematically superior choice. The problem is uncertainty: you don't know how long you'll live, and claiming early has real value if your health or family history suggests a shorter horizon.
            </p>
            <p>
              For early retirees with a strong portfolio, delaying to 70 is often the right move. A $2,400/month FRA benefit becomes $3,000/month at 70 — a $600/month permanent increase that's the equivalent of having an extra $180,000 in your portfolio at a 4% withdrawal rate. That's hard to beat.
            </p>
          </div>

          <h2 className="font-syne font-bold text-[22px] tracking-tight text-white mb-4">
            Social Security and Early Retirement
          </h2>
          <div className="space-y-4 text-white/55 text-[14px] leading-[1.8] mb-8">
            <p>
              If you retire at 50 or 55, Social Security won't start for at least 7-12 years. During that gap, your portfolio funds 100% of your spending. Once SS starts — especially at 70 — it dramatically reduces your required portfolio withdrawal rate, which is one of the most powerful ways to improve portfolio longevity.
            </p>
            <p>
              The <Link href="/tools/bridge-strategy-calculator" className="text-gold hover:text-gold/80 transition-colors">Bridge Strategy Calculator</Link> models this directly: enter your SS claim age and see how much the reduced withdrawal requirement extends your portfolio's life. For many early retirees, the difference between claiming at 62 vs 70 is the difference between a solvent portfolio at 90 and a depleted one.
            </p>
            <p>
              Also worth noting: Social Security benefits are adjusted for inflation each year via COLA adjustments. This makes delayed benefits even more valuable as a hedge against long-term inflation risk in retirement.
            </p>
          </div>

          <h2 className="font-syne font-bold text-[22px] tracking-tight text-white mb-4">
            Frequently Asked Questions
          </h2>
          <div className="space-y-5 mb-10">
            {[
              {
                q: 'What is full retirement age (FRA) for Social Security?',
                a: 'For anyone born in 1960 or later, full retirement age is 67. For those born between 1955 and 1959, FRA is between 66 and 67. Claiming before FRA permanently reduces your benefit; claiming after FRA permanently increases it by 8% per year up to age 70.'
              },
              {
                q: 'How much is Social Security reduced if I claim at 62?',
                a: 'Claiming at 62 reduces your benefit by approximately 30% from the FRA amount for those with a FRA of 67. If your FRA benefit is $2,000/month, claiming at 62 gives you roughly $1,400/month — permanently, for life.'
              },
              {
                q: 'How much does waiting until 70 increase Social Security?',
                a: 'Waiting past FRA increases your benefit by 8% per year. From FRA of 67 to age 70 is 3 years, giving a 24% increase. A $2,000/month FRA benefit becomes $2,480/month at 70 — permanently, adjusted for inflation each year.'
              },
              {
                q: 'Can I work and collect Social Security before full retirement age?',
                a: 'Yes, but there are earnings limits before FRA. In 2024, the annual earnings limit was $22,320. If you earn more than that before FRA, $1 of benefits is withheld for every $2 you earn above the limit. After FRA, you can earn any amount without reduction.'
              },
              {
                q: 'Does Social Security have a cost-of-living adjustment?',
                a: 'Yes. Social Security benefits are adjusted annually via COLA based on the Consumer Price Index. This inflation protection is one of the most valuable features of delaying SS — a larger base benefit gets a larger dollar COLA each year.'
              },
              {
                q: 'How does spousal Social Security work?',
                a: 'A spouse can claim up to 50% of the higher-earning spouse\'s FRA benefit. Spousal benefits are not increased by delaying past FRA, but they are reduced by claiming early. Coordinating claiming ages between spouses is an important optimization — generally the higher earner should delay to maximize the survivor benefit.'
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
              { href: '/tools/bridge-strategy-calculator',         label: 'Bridge Strategy Calculator' },
              { href: '/tools/withdrawal-order-optimizer',         label: 'Withdrawal Order Optimizer' },
              { href: '/blog/social-security-timing-62-vs-70',    label: 'Social Security Timing Guide' },
              { href: '/blog/what-is-retirement-bridge-strategy',  label: 'Bridge Strategy Guide' },
              { href: '/blog/can-i-retire-at-55-with-750k',       label: 'Can I Retire at 55 With $750K?' },
              { href: '/blog/sequence-of-returns-risk',           label: 'Sequence of Returns Risk' },
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