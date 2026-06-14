'use client'

import { PlannerResults } from '@/lib/planner/types'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface Props {
  results: PlannerResults
}

function fmt(n: number) {
  if (n >= 1000000) return '$' + (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return '$' + (n / 1000).toFixed(0) + 'K'
  return '$' + Math.round(n).toLocaleString()
}

export default function MonteCarloTab({ results }: Props) {
  const { monteCarlo } = results
  const successPct = Math.round(monteCarlo.successRate * 100)
  const failPct = 100 - successPct

  const successColor = successPct >= 90 ? '#4ADE80' : successPct >= 75 ? '#E8B84B' : '#F87171'
  const statusLabel = successPct >= 90 ? 'Robust' : successPct >= 75 ? 'Acceptable' : 'Fragile'
  const statusDesc = successPct >= 90
    ? 'Plan succeeds across randomized return sequences.'
    : successPct >= 75
    ? 'Acceptable — needs spending flexibility in bad markets.'
    : 'Fragile — plan fails too often under sequence risk. Revisit spending or retirement age.'

  const chartData = [
    { label: 'Success', value: successPct, color: successColor },
    { label: 'Failure', value: failPct, color: '#374151' },
  ]

  return (
    <div>
      {/* Success rate hero */}
      <div className="flex items-center gap-8 mb-8">
        <div className="relative w-32 h-32 shrink-0">
          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1f2937" strokeWidth="3" />
            <circle
              cx="18" cy="18" r="15.9" fill="none"
              stroke={successColor}
              strokeWidth="3"
              strokeDasharray={`${successPct} ${100 - successPct}`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="font-syne font-bold text-[28px] leading-none" style={{ color: successColor }}>
              {successPct}%
            </div>
            <div className="font-mono text-[8px] text-white/30 tracking-widest uppercase">success</div>
          </div>
        </div>
        <div>
          <div className="font-syne font-bold text-[20px] mb-1" style={{ color: successColor }}>
            {statusLabel}
          </div>
          <div className="text-white/45 text-[13px] leading-relaxed max-w-xs mb-3">
            {statusDesc}
          </div>
          <div className="font-mono text-[9px] text-white/20">
            200 randomized return sequences · Press recalculate to re-run
          </div>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Median Balance at 90', value: fmt(monteCarlo.median), color: 'text-white' },
          { label: '10th Percentile (bad luck)', value: fmt(monteCarlo.p10), color: 'text-red-400' },
          { label: '90th Percentile (good luck)', value: fmt(monteCarlo.p90), color: 'text-green-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-navy/50 rounded-xl p-4 border border-white/[0.06]">
            <div className="font-mono text-[8px] tracking-widest uppercase text-white/25 mb-2">{label}</div>
            <div className={`font-syne font-bold text-[20px] ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      {/* Success/failure bar */}
      <div className="mb-6">
        <div className="font-mono text-[9px] tracking-widest uppercase text-white/25 mb-3">
          Outcome Distribution (200 simulations)
        </div>
        <div className="h-12 flex rounded-lg overflow-hidden">
          <div
            className="flex items-center justify-center font-mono text-[10px] font-bold text-black transition-all"
            style={{ width: `${successPct}%`, backgroundColor: successColor }}
          >
            {successPct >= 20 && `${successPct}% funded`}
          </div>
          <div
            className="flex items-center justify-center font-mono text-[10px] text-white/40 transition-all"
            style={{ width: `${failPct}%`, backgroundColor: '#1f2937' }}
          >
            {failPct >= 15 && `${failPct}% depleted`}
          </div>
        </div>
      </div>

      {/* Guide */}
      <div className="bg-navy/30 border border-white/[0.06] rounded-xl p-4">
        <div className="font-mono text-[9px] tracking-widest uppercase text-white/25 mb-3">
          How to read this
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { range: '90%+', label: 'Robust', color: 'text-green-400', desc: 'Retire with confidence' },
            { range: '75–90%', label: 'Acceptable', color: 'text-amber-400', desc: 'Needs spending flexibility' },
            { range: 'Below 75%', label: 'Fragile', color: 'text-red-400', desc: 'Revisit the plan' },
          ].map(({ range, label, color, desc }) => (
            <div key={range} className="text-center">
              <div className={`font-mono text-[9px] ${color} mb-0.5`}>{range}</div>
              <div className={`font-syne font-semibold text-[12px] ${color} mb-0.5`}>{label}</div>
              <div className="text-white/30 text-[10px]">{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}