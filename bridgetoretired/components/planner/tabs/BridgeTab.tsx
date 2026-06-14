'use client'

import { PlannerResults } from '@/lib/planner/types'

interface Props {
  results: PlannerResults
}

function fmt(n: number) {
  return '$' + Math.round(n).toLocaleString()
}

export default function BridgeTab({ results }: Props) {
  const { bridgeYears } = results

  if (bridgeYears.length === 0) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-center">
          <div className="text-3xl mb-3">✓</div>
          <div className="font-syne font-semibold text-white text-[16px] mb-2">
            No bridge needed
          </div>
          <div className="font-mono text-[11px] text-white/35">
            Retiring at or after age 59½ — all accounts accessible without penalty
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="font-mono text-[9px] tracking-widest uppercase text-white/25 mb-4">
        Withdrawal cascade: Taxable+Cash → Roth → 401k
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[11px]">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {['Year','Age','Spending','Net Needed','From Taxable','From Roth','From 401k','Total End'].map(h => (
                <th key={h} className="font-mono text-[9px] tracking-widest uppercase text-gold/70 text-right first:text-left py-2 px-2">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bridgeYears.map((y, i) => {
              const hasPenalty = y.from401k > 0
              return (
                <tr
                  key={i}
                  className={`border-b border-white/[0.04] ${
                    hasPenalty ? 'bg-red-950/20' : i % 2 === 0 ? 'bg-white/[0.01]' : ''
                  }`}
                >
                  <td className="py-2 px-2 font-mono text-white/50">{y.year}</td>
                  <td className="py-2 px-2 font-mono text-white/50 text-right">{y.age}</td>
                  <td className="py-2 px-2 font-mono text-white/70 text-right">{fmt(y.spending)}</td>
                  <td className="py-2 px-2 font-mono text-white/70 text-right">{fmt(y.netNeeded)}</td>
                  <td className="py-2 px-2 font-mono text-teal-400 text-right">{fmt(y.fromTaxable)}</td>
                  <td className="py-2 px-2 font-mono text-blue-400 text-right">{fmt(y.fromRoth)}</td>
                  <td className={`py-2 px-2 font-mono text-right ${hasPenalty ? 'text-red-400 font-bold' : 'text-white/30'}`}>
                    {fmt(y.from401k)}
                    {hasPenalty && <span className="ml-1 text-[8px]">⚠</span>}
                  </td>
                  <td className="py-2 px-2 font-mono text-white font-bold text-right">{fmt(y.totalEnd)}</td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr className="border-t border-gold/20 bg-gold/5">
              <td colSpan={4} className="py-2 px-2 font-mono text-[9px] tracking-widest uppercase text-gold">
                End of Bridge →
              </td>
              <td className="py-2 px-2 font-mono text-teal-400 font-bold text-right">
                {fmt(bridgeYears[bridgeYears.length-1].taxableEnd)}
              </td>
              <td className="py-2 px-2 font-mono text-blue-400 font-bold text-right">
                {fmt(bridgeYears[bridgeYears.length-1].rothEnd)}
              </td>
              <td className="py-2 px-2 font-mono text-white/50 font-bold text-right">
                {fmt(bridgeYears[bridgeYears.length-1].k401End)}
              </td>
              <td className="py-2 px-2 font-mono text-white font-bold text-right">
                {fmt(bridgeYears[bridgeYears.length-1].totalEnd)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      {bridgeYears.some(y => y.from401k > 0) && (
        <div className="mt-4 bg-red-950/30 border border-red-500/20 rounded-lg px-4 py-3">
          <div className="font-mono text-[9px] tracking-widest uppercase text-red-400 mb-1">
            ⚠ Penalty Risk Detected
          </div>
          <div className="text-white/50 text-[12px]">
            401k draws before age 59½ trigger a 10% early withdrawal penalty unless using Rule 72(t) SEPP.
            Total at-risk amount: {fmt(bridgeYears.reduce((s, y) => s + y.from401k, 0))}
          </div>
        </div>
      )}
    </div>
  )
}