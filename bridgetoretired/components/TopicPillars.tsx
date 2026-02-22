import Link from 'next/link'

const topics = [
  {
    icon:  '🌉',
    title: 'What Is a Retirement Bridge Strategy?',
    kw:    'retirement bridge · bridge years',
    href:  '/blog/what-is-retirement-bridge-strategy',
  },
  {
    icon:  '🔄',
    title: 'Roth Conversion Ladder: The Complete Guide',
    kw:    'roth conversion ladder · FIRE',
    href:  '/blog/roth-conversion-ladder-guide',
  },
  {
    icon:  '📐',
    title: 'Rule 72(t): Access 401k Early, Penalty-Free',
    kw:    'rule 72t · SEPP payments',
    href:  '/blog/rule-72t-sepp-guide',
  },
  {
    icon:  '💵',
    title: 'How Much Do I Need to Retire at 50?',
    kw:    'retire at 50 · FIRE number',
    href:  '/blog/how-much-to-retire-at-50',
  },
  {
    icon:  '📊',
    title: 'Taxable vs Roth vs 401k: Withdrawal Order',
    kw:    'withdrawal order · tax-efficient',
    href:  '/blog/withdrawal-order-taxable-roth-401k',
  },
  {
    icon:  '🏥',
    title: 'Health Insurance Before Medicare: Options',
    kw:    'early retirement health insurance',
    href:  '/blog/health-insurance-before-medicare',
  },
  {
    icon:  '📅',
    title: 'Social Security Timing: Age 62 vs 67 vs 70',
    kw:    'social security timing · claim age',
    href:  '/blog/social-security-timing-62-vs-70',
  },
  {
    icon:  '⚠️',
    title: 'Sequence of Returns Risk: Protect Your Portfolio',
    kw:    'sequence of returns risk',
    href:  '/blog/sequence-of-returns-risk',
  },
]

export function TopicPillars() {
  return (
    <section className="py-24 px-5 bg-navy border-y border-white/[0.05]">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 font-mono text-[10px] tracking-[0.24em] uppercase text-gold mb-4">
          <span className="block w-6 h-px bg-gold" />
          Explore Topics
        </div>
        <h2 className="font-syne font-bold text-[clamp(28px,3.5vw,44px)] tracking-tight text-white mb-10">
          Everything on Early Retirement
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {topics.map(t => (
            <Link
              key={t.href}
              href={t.href}
              className="bg-ink border border-white/[0.07] rounded-lg p-5 hover:border-gold/20 hover:-translate-y-1 transition-all duration-200 group"
            >
              <span className="text-xl mb-3 block">{t.icon}</span>
              <div className="font-syne font-semibold text-[13px] tracking-tight text-white mb-2 leading-snug group-hover:text-gold/90 transition-colors">
                {t.title}
              </div>
              <div className="font-mono text-[9px] text-white/25 leading-relaxed">
                {t.kw}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
