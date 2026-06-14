'use client'

import { PlannerResults } from '@/lib/planner/types'

interface Props {
  results: PlannerResults
}

const STATUS_STYLES = {
  ok:       { bg: 'bg-green-950/40',  border: 'border-green-500/20',  text: 'text-green-400',  badge: 'bg-green-500/10 border-green-500/20' },
  warning:  { bg: 'bg-amber-950/40',  border: 'border-amber-500/20',  text: 'text-amber-400',  badge: 'bg-amber-500/10 border-amber-500/20' },
  danger:   { bg: 'bg-red-950/40',    border: 'border-red-500/20',    text: 'text-red-400',    badge: 'bg-red-500/10 border-red-500/20' },
  advisory: { bg: 'bg-yellow-950/40', border: 'border-yellow-500/20', text: 'text-yellow-400', badge: 'bg-yellow-500/10 border-yellow-500/20' },
}

export default function RiskFlagsTab({ results }: Props) {
  return (
    <div className="space-y-3">
      <div className="font-mono text-[9px] tracking-widest uppercase text-white/25 mb-4">
        All flags update automatically as inputs change
      </div>
      {results.riskFlags.map((flag, i) => {
        const style = STATUS_STYLES[flag.status]
        return (
          <div
            key={i}
            className={`rounded-xl border p-4 ${style.bg} ${style.border}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="font-mono text-[10px] text-white/50 mb-1">
                  {flag.label}
                </div>
                <div className="text-white/60 text-[12px] leading-relaxed">
                  {flag.detail}
                </div>
              </div>
              <div className={`shrink-0 font-mono text-[10px] font-bold px-3 py-1 rounded-full border ${style.text} ${style.badge}`}>
                {flag.value}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}