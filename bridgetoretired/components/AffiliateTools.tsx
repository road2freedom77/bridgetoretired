'use client'
import { AFFILIATE_LINKS, buildAffUrl } from '@/lib/affiliate'

const TOOLS = [
  {
    id:      'empower',
    icon:    '📊',
    type:    'Portfolio Tracker & Planner',
    desc:    'Free net worth tracking, retirement planning, and investment fee analyzer. The gold standard for FIRE community tracking.',
    badge:   'Top Pick',
    cta:     'Try Free →',
  },
  {
    id:      'boldin',
    icon:    '🧮',
    type:    'Retirement Scenario Planner',
    desc:    'The most detailed retirement planning software for early retirees. Models Roth conversions, SS timing, and healthcare costs.',
    badge:   null,
    cta:     'Start Planning →',
  },
  {
    id:      'm1',
    icon:    '📈',
    type:    'Automated Investing',
    desc:    'Build a custom portfolio with automatic rebalancing. Ideal for your taxable bridge account with a low-cost index strategy.',
    badge:   "Editor's Pick",
    cta:     'Open Account →',
  },
  {
    id:      'fidelity',
    icon:    '🏦',
    type:    'Brokerage & Retirement Accounts',
    desc:    'Zero-expense-ratio index funds and excellent Roth IRA tools. The FIRE community\'s favorite brokerage for good reason.',
    badge:   null,
    cta:     'Learn More →',
  },
  {
    id:      'turbotax',
    icon:    '⚖️',
    type:    'Tax Filing & Planning',
    desc:    'Early retirement tax complexity is real. TurboTax Premium handles Roth conversions, capital gains, and multi-account reporting.',
    badge:   null,
    cta:     'File Taxes →',
  },
  {
    id:      'betterment',
    icon:    '🛡️',
    type:    'Robo-Advisor & IRAs',
    desc:    'Automated tax-loss harvesting and smart rebalancing. Perfect for hands-off management of bridge account assets.',
    badge:   null,
    cta:     'Get Started →',
  },
]

function trackClick(id: string) {
  // Fire analytics event — swap for GA4 / Plausible / Fathom
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'affiliate_click', {
      affiliate_id: id,
      page_location: window.location.href,
    })
  }
}

export function AffiliateTools() {
  return (
    <section id="tools" className="py-24 px-5 bg-black">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-12">
          <div>
            <div className="flex items-center gap-3 font-mono text-[10px] tracking-[0.24em] uppercase text-gold mb-4">
              <span className="block w-6 h-px bg-gold" />
              Trusted Partners
            </div>
            <h2 className="font-syne font-bold text-[clamp(28px,3.5vw,44px)] tracking-tight text-white mb-3">
              Tools We Actually Use
            </h2>
            <p className="text-white/55 text-[15px] leading-relaxed max-w-lg">
              Every recommendation is one we'd stake our own retirement on. Vetted for the FIRE community.
            </p>
          </div>
          <div className="font-mono text-[9px] tracking-widest text-white/25 border border-white/[0.07] px-3 py-1.5 rounded shrink-0">
            ⚑ Affiliate links — we may earn a commission
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {TOOLS.map(tool => {
            const link = AFFILIATE_LINKS.find(l => l.id === tool.id)
            const href = link ? buildAffUrl(link) : '#'

            return (
              <div
                key={tool.id}
                className="relative bg-ink border border-white/[0.07] rounded-xl p-6 
                           hover:border-gold/20 hover:-translate-y-1 transition-all duration-300 group
                           before:absolute before:inset-x-0 before:top-0 before:h-[2px] 
                           before:bg-gradient-to-r before:from-transparent before:via-gold before:to-transparent
                           before:opacity-0 before:transition-opacity hover:before:opacity-100"
              >
                {tool.badge && (
                  <div className="absolute top-4 right-4 font-mono text-[8px] tracking-widest uppercase bg-gold/10 text-gold border border-gold/25 px-2 py-1 rounded">
                    {tool.badge}
                  </div>
                )}

                <div className="text-3xl mb-4">{tool.icon}</div>
                <div className="font-syne font-semibold text-[16px] tracking-tight text-white mb-1">
                  {link?.name ?? tool.id}
                </div>
                <div className="font-mono text-[9px] tracking-wider uppercase text-white/30 mb-3">
                  {tool.type}
                </div>
                <p className="text-[13px] text-white/55 leading-[1.7] mb-5">
                  {tool.desc}
                </p>

                <a
                  href={href}
                  target="_blank"
                  rel="sponsored noopener noreferrer"
                  onClick={() => trackClick(tool.id)}
                  className="block bg-white/[0.04] border border-white/[0.08] text-white/75 
                             font-mono text-[10px] tracking-widest uppercase px-4 py-2.5 rounded 
                             text-center hover:bg-gold/10 hover:border-gold/25 hover:text-gold 
                             transition-all duration-200"
                >
                  {tool.cta}
                </a>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
