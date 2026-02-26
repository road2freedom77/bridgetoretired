'use client'

import Link from 'next/link'

export function ProNav() {
  return (
    <div className="border-t border-white/[0.06] bg-navy mt-16 py-6">
      <div className="max-w-5xl mx-auto px-5 flex items-center justify-between">
        <Link
          href="/pro-welcome"
          className="font-mono text-[10px] tracking-widest uppercase text-white/30 hover:text-gold transition-colors flex items-center gap-2"
        >
          ← Pro Dashboard
        </Link>
        <div className="flex items-center gap-6">
          {[
            { href: '/bridge-risk-score',  label: 'Risk Score'     },
            { href: '/advanced-calculator', label: 'Calculator'     },
            { href: '/sequence-tester',     label: 'Stress Test'    },
            { href: '/scenario-compare',    label: 'Scenarios'      },
            { href: '/pdf-report',          label: 'PDF Report'     },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="font-mono text-[9px] tracking-widest uppercase text-white/20 hover:text-white/50 transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
