'use client'

import { PlannerInputs, PlannerResults } from '@/lib/planner/types'
import { useState } from 'react'

interface Props {
  results: PlannerResults
  inputs: PlannerInputs
}

interface AssetClass {
  name: string
  target: number
  key: 'stocks_us' | 'stocks_intl' | 'bonds' | 'cash' | 'reits' | 'other'
}

const DEFAULT_ALLOCATION: AssetClass[] = [
  { name: 'US Total Market',      key: 'stocks_us',   target: 40 },
  { name: 'International',        key: 'stocks_intl', target: 15 },
  { name: 'Bonds (Total)',        key: 'bonds',       target: 25 },
  { name: 'Cash / MM',            key: 'cash',        target: 10 },
  { name: 'Real Estate (REIT)',   key: 'reits',       target: 5  },
  { name: 'Small Cap Value',      key: 'other',       target: 5  },
]

function fmt(n: number) {
  return '$' + Math.round(n).toLocaleString()
}

function fmtPct(n: number) {
  return (n >= 0 ? '+' : '') + n.toFixed(1) + '%'
}

export default function RebalanceTab({ results, inputs }: Props) {
  const totalPortfolio = inputs.taxable + inputs.k401 + inputs.roth + inputs.cash

  const [allocation, setAllocation] = useState<AssetClass[]>(DEFAULT_ALLOCATION)

  const totalTarget = allocation.reduce((s, a) => s + a.target, 0)

  const setTarget = (key: string, value: number) => {
    setAllocation(prev => prev.map(a => a.key === key ? { ...a, target: value } : a))
  }

  // Derive current value from portfolio split heuristic
  // Taxable+cash = liquid, 401k = mostly bonds+stocks, Roth = stocks
  const currentValues: Record<string, number> = {
    stocks_us:   (inputs.taxable * 0.5) + (inputs.k401 * 0.4) + (inputs.roth * 0.7),
    stocks_intl: (inputs.taxable * 0.15) + (inputs.k401 * 0.15) + (inputs.roth * 0.15),
    bonds:       (inputs.k401 * 0.3) + (inputs.taxable * 0.1),
    cash:        inputs.cash + (inputs.taxable * 0.05),
    reits:       (inputs.taxable * 0.1) + (inputs.roth * 0.1),
    other:       (inputs.taxable * 0.1) + (inputs.roth * 0.05),
  }

  return (
    <div>
      <div className="font-mono text-[9px] tracking-widest uppercase text-white/25 mb-1">
        Target vs estimated current allocation · Update targets to match your actual holdings
      </div>
      <div className="font-mono text-[9px] tracking-widest uppercase text-white/20 mb-6">
        Current values estimated from portfolio split — overwrite targets to reflect your actual allocation
      </div>

      {/* Total portfolio */}
      <div className="bg-navy/50 border border-gold/20 rounded-xl px-5 py-4 mb-6 flex items-center justify-between">
        <div>
          <div className="font-mono text-[8px] tracking-widest uppercase text-white/25 mb-1">Total Portfolio</div>
          <div className="font-syne font-bold text-[24px] text-gold">{fmt(totalPortfolio)}</div>
        </div>
        <div className="text-right">
          <div className="font-mono text-[8px] tracking-widest uppercase text-white/25 mb-1">Target Total</div>
          <div className={`font-syne font-bold text-[18px] ${totalTarget === 100 ? 'text-green-400' : 'text-red-400'}`}>
            {totalTarget}%
            {totalTarget !== 100 && <span className="font-mono text-[10px] ml-2">({totalTarget > 100 ? 'over' : 'under'} by {Math.abs(totalTarget - 100)}%)</span>}
          </div>
        </div>
      </div>

      {/* Allocation table */}
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-[11px]">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {['Asset Class', 'Target %', 'Current Value', 'Current %', 'Drift', 'Action'].map(h => (
                <th key={h} className="font-mono text-[9px] tracking-widest uppercase text-gold/70 text-right first:text-left py-2 px-3 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allocation.map((asset, i) => {
              const currentValue = currentValues[asset.key] || 0
              const currentPct = totalPortfolio > 0 ? (currentValue / totalPortfolio) * 100 : 0
              const drift = currentPct - asset.target
              const isOver = drift > 5
              const isUnder = drift < -5
              const action = isOver ? 'TRIM — overweight' : isUnder ? 'ADD — underweight' : 'Hold'
              const actionColor = isOver ? 'text-red-400' : isUnder ? 'text-green-400' : 'text-white/30'

              return (
                <tr key={asset.key} className={`border-b border-white/[0.04] ${i % 2 === 0 ? 'bg-white/[0.01]' : ''}`}>
                  <td className="py-2 px-3 font-mono text-white/70">{asset.name}</td>
                  <td className="py-2 px-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={asset.target}
                        onChange={e => {
                          const v = parseFloat(e.target.value)
                          if (!isNaN(v)) setTarget(asset.key, v)
                        }}
                        className="w-14 bg-gold/10 border border-gold/20 rounded px-2 py-0.5 font-mono text-[11px] text-blue-400 font-bold text-right outline-none focus:border-gold/40"
                      />
                      <span className="font-mono text-[10px] text-white/30">%</span>
                    </div>
                  </td>
                  <td className="py-2 px-3 font-mono text-white/60 text-right">{fmt(currentValue)}</td>
                  <td className="py-2 px-3 font-mono text-white/60 text-right">{currentPct.toFixed(1)}%</td>
                  <td className={`py-2 px-3 font-mono font-bold text-right ${
                    Math.abs(drift) > 5 ? (drift > 0 ? 'text-red-400' : 'text-green-400') : 'text-white/30'
                  }`}>
                    {fmtPct(drift)}
                  </td>
                  <td className={`py-2 px-3 font-mono text-right text-[10px] font-bold ${actionColor}`}>
                    {action}
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr className="border-t border-gold/20 bg-gold/5">
              <td className="py-2 px-3 font-mono text-[9px] tracking-widest uppercase text-gold">TOTAL</td>
              <td className={`py-2 px-3 font-mono font-bold text-right ${totalTarget === 100 ? 'text-gold' : 'text-red-400'}`}>
                {totalTarget}%
              </td>
              <td className="py-2 px-3 font-mono text-gold font-bold text-right">{fmt(totalPortfolio)}</td>
              <td className="py-2 px-3 font-mono text-gold font-bold text-right">100%</td>
              <td colSpan={2} />
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Visual allocation bars */}
      <div className="bg-navy/30 border border-white/[0.06] rounded-xl p-5 mb-4">
        <div className="font-mono text-[9px] tracking-widest uppercase text-white/25 mb-4">
          Allocation Overview
        </div>
        <div className="space-y-3">
          {allocation.map(asset => {
            const currentValue = currentValues[asset.key] || 0
            const currentPct = totalPortfolio > 0 ? (currentValue / totalPortfolio) * 100 : 0
            const colors: Record<string, string> = {
              stocks_us: '#2DD4BF', stocks_intl: '#818CF8',
              bonds: '#4ADE80', cash: '#E8B84B',
              reits: '#F87171', other: '#FB923C',
            }
            const color = colors[asset.key]
            return (
              <div key={asset.key}>
                <div className="flex justify-between font-mono text-[9px] mb-1">
                  <span style={{ color }}>{asset.name}</span>
                  <span className="text-white/40">
                    Target {asset.target}% · Current {currentPct.toFixed(1)}%
                  </span>
                </div>
                <div className="relative h-2 bg-white/[0.05] rounded-full overflow-hidden">
                  {/* Current */}
                  <div
                    className="absolute h-full rounded-full opacity-40 transition-all"
                    style={{ width: `${Math.min(currentPct, 100)}%`, backgroundColor: color }}
                  />
                  {/* Target marker */}
                  <div
                    className="absolute h-full w-0.5 bg-white/60"
                    style={{ left: `${Math.min(asset.target, 100)}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
        <div className="flex items-center gap-4 mt-3 font-mono text-[9px] text-white/25">
          <span>░ Current allocation</span>
          <span>| Target</span>
        </div>
      </div>

      <div className="font-mono text-[9px] text-white/20 leading-relaxed">
        Current values are estimated from your portfolio inputs using a default split. For accurate drift alerts,
        enter your actual holdings by asset class. Target % must sum to 100%.
        Drift alerts fire when current allocation deviates more than 5% from target.
      </div>
    </div>
  )
}