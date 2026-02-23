import Link from 'next/link'

export function Footer() {
  const columns = [
    {
      title: 'Topics',
      links: [
        { label: 'Bridge Strategy',  href: '/blog/what-is-retirement-bridge-strategy' },
        { label: 'Roth Conversions', href: '/blog/roth-conversion-ladder-guide' },
        { label: 'Tax Planning',     href: '/blog/withdrawal-order-taxable-roth-401k' },
        { label: 'Healthcare',       href: '/blog/health-insurance-before-medicare' },
        { label: 'Social Security',  href: '/blog/social-security-timing-62-vs-70' },
        { label: 'Sequence Risk',    href: '/blog/sequence-of-returns-risk' },
      ],
    },
    {
      title: 'Tools',
      links: [
        { label: 'Bridge Planner',  href: '/#download'   },
        { label: 'FIRE Calculator', href: '/#calculator' },
      ],
    },
    {
      title: 'Site',
      links: [
        { label: 'About',       href: '/about'     },
        { label: 'Blog',        href: '/blog'      },
        { label: 'Newsletter',  href: '/#download' },
        { label: 'X / Twitter', href: 'https://x.com/BridgeToRetired' },
      ],
    },
  ]

  return (
    <footer className="bg-navy border-t border-white/[0.06] px-5 pt-16 pb-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-12 mb-14">

          {/* Brand */}
          <div>
            <Link href="/" className="font-syne font-bold text-[18px] text-white tracking-tight mb-4 block">
              Bridge<span className="text-gold">ToRetired</span>
            </Link>
            <p className="text-[12px] text-white/30 leading-[1.8] max-w-[280px]">
              Free tools, guides, and calculators for people planning early retirement.
              We help you build the bridge between today and financial freedom.
            </p>
            <a
              href="https://x.com/BridgeToRetired"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-5 font-mono text-[10px] tracking-widest uppercase text-white/25 hover:text-gold transition-colors"
            >
              𝕏 @BridgeToRetired
            </a>
          </div>

          {/* Link columns */}
          {columns.map(col => (
            <div key={col.title}>
              <h4 className="font-syne font-semibold text-[11px] tracking-widest uppercase text-white/40 mb-4">
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map(({ label, href }) => (
                  <li key={label}>
                    {href.startsWith('http') ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-[11px] text-white/25 hover:text-white/55 transition-colors tracking-wide"
                      >
                        {label}
                      </a>
                    ) : (
                      <Link
                        href={href}
                        className="font-mono text-[11px] text-white/25 hover:text-white/55 transition-colors tracking-wide"
                      >
                        {label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/[0.05] pt-6 flex flex-col sm:flex-row justify-between items-start gap-4">
          <p className="font-mono text-[10px] text-white/20 leading-[1.8] max-w-[600px]">
            © 2026 BridgeToRetired. All rights reserved.{' '}
            <strong className="font-medium">Affiliate Disclosure:</strong> This site may contain
            affiliate links. We may earn a commission at no cost to you. Content is for
            educational purposes only and does not constitute financial, tax, or legal advice.
            Always consult a qualified financial advisor before making retirement decisions.
          </p>
          <div className="flex gap-5 shrink-0">
            {[
              { label: 'Privacy',     href: '/privacy'     },
              { label: 'Terms',       href: '/terms'       },
              { label: 'Disclosures', href: '/disclosures' },
            ].map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="font-mono text-[10px] text-white/20 hover:text-white/40 transition-colors tracking-wide"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
