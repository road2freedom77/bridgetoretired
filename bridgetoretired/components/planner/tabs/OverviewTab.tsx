'use client'

import { PlannerInputs, PlannerResults } from '@/lib/planner/types'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

interface Props {
  results: PlannerResults
  inputs: PlannerInputs
}

function fmt(n: number) {
  if (n >= 1000000) return '$' + (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return '$' + (n / 1000).toFixed(0) + 'K'
  return '$' + Math.round(n).toLocaleString()
}

function fmtPct(n: number) {
  return (n * 100).toFixed(1) + '%'
}

export default function OverviewTab({ results, inputs }: Props) {
  const { bridgeYears, post595Years, monteCarlo, withdrawalRate, portfolioAt90 } = results

  // Build chart data — combine bridge + post595
  const chartData = [
    // Starting point
    {
      age: inputs.retireAge,
      total: inputs.taxable + inputs.cash + inputs.k401 + inputs.roth,
      taxable: inputs.taxable + inputs.cash,
      roth: inputs.roth,
      k401: inputs.k401,
      phase: 'bridge',
    },
    ...bridgeYears.map(y => ({
      age: y.age + 1,
      total: y.totalEnd,
      taxable: y.taxableEnd,
      roth: y.rothEnd,
      k401: y.k401End,
      phase: 'bridge',
    })),
    ...post595Years.map(y => ({
      age: y.age,
      total: y.portfolioBalance + y.rothBalance,
      taxable: 0,
      roth: y.rothBalance,
      k401: y.portfolioBalance,
      phase: y.age >= inputs.ssAge ? 'post-ss' : 'post595',
    })),
  ]

  const successPct = Math.round(monteCarlo.successRate * 100)
  const successColor = successPct >= 90 ? '#4ADE80' : successPct >= 75 ? '#E8B84B' : '#F87171'
  const wrColor = withdrawalRate <= 0.04 ? '#4ADE80' : withdrawalRate <= 0.055 ? '#E8B84B' : '#F87171'
  const at90Color = portfolioAt90 > 0 ? '#4ADE80' : '#F87171'

  const kpis = [
    {
      label: 'Withdrawal Rate',
      value: fmtPct(withdrawalRate),
      sub: withdrawalRate <= 0.033 ? 'Conservative' : withdrawalRate <= 0.04 ? 'Within guideline' : 'Above target',
      color: wrColor,
    },
    {
      label: 'Monte Carlo',
      value: successPct + '%',
      sub: successPct >= 90 ? 'Robust' : successPct >= 75 ? 'Acceptable' : 'Fragile',
      color: successColor,
    },
    {
      label: 'Bridge Length',
      value: results.bridgeLength.toFixed(1) + ' yrs',
      sub: `Age ${inputs.retireAge} → 59.5`,
      color: 'text-white',
    },
    {
      label: 'Portfolio at 90',
      value: fmt(portfolioAt90),
      sub: portfolioAt90 > 0 ? 'Funded to life expectancy' : 'Depletes before 90',
      color: at90Color,
    },
  ]

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-navy border border-white/[0.1] rounded-lg p-3 text-[11px]">
        <div className="font-mono text-white/50 mb-2">Age {label}</div>
        <div className="font-syne font-bold text-white">
          Total: {fmt(payload[0]?.payload?.total || 0)}
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {kpis.map(({ label, value, sub, color }) => (
          <div key={label} className="bg-navy/50 border border-white/[0.06] rounded-xl p-4">
            <div className="font-mono text-[8px] tracking-widest uppercase text-white/25 mb-2">{label}</div>
            <div className="font-syne font-bold text-[22px] mb-1" style={{ color }}>
              {value}
            </div>
            <div className="font-mono text-[9px] text-white/30">{sub}</div>
          </div>
        ))}
      </div>

      {/* Portfolio chart */}
      <div className="mb-6">
        <div className="font-mono text-[9px] tracking-widest uppercase text-white/25 mb-4">
          Portfolio Projection
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
              <defs>
                <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C9A84C" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#C9A84C" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="age"
                tick={{ fill: '#ffffff40', fontSize: 10, fontFamily: 'monospace' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tickFormatter={v => fmt(v)}
                tick={{ fill: '#ffffff40', fontSize: 10, fontFamily: 'monospace' }}
                tickLine={false}
                axisLine={false}
                width={60}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine
                x={59.5}
                stroke="#C9A84C"
                strokeDasharray="4 4"
                label={{ value: '59½', fill: '#C9A84C', fontSize: 9, fontFamily: 'monospace' }}
              />
              {inputs.ssAge && (
                <ReferenceLine
                  x={inputs.ssAge}
                  stroke="#4ADE80"
                  strokeDasharray="4 4"
                  label={{ value: 'SS', fill: '#4ADE80', fontSize: 9, fontFamily: 'monospace' }}
                />
              )}
              <Area
                type="monotone"
                dataKey="total"
                stroke="#C9A84C"
                strokeWidth={2}
                fill="url(#totalGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center gap-6 mt-2 justify-center">
          {[
            { color: '#C9A84C', label: 'Total Portfolio' },
            { color: '#C9A84C', label: '— — 59½ unlock', dashed: true },
            { color: '#4ADE80', label: '— — SS start', dashed: true },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="w-6 h-0.5" style={{ backgroundColor: color }} />
              <span className="font-mono text-[9px] text-white/30">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Account mix at retirement */}
      <div className="bg-navy/30 border border-white/[0.06] rounded-xl p-5">
        <div className="font-mono text-[9px] tracking-widest uppercase text-white/25 mb-4">
          Starting Account Mix
        </div>
        <div className="space-y-2">
          {[
            { label: 'Taxable + Cash', value: inputs.taxable + inputs.cash, color: '#2DD4BF' },
            { label: 'Traditional 401k / IRA', value: inputs.k401, color: '#818CF8' },
            { label: 'Roth IRA / Roth 401k', value: inputs.roth, color: '#4ADE80' },
          ].map(({ label, value, color }) => {
            const total = inputs.taxable + inputs.cash + inputs.k401 + inputs.roth
            const pct = total > 0 ? (value / total) * 100 : 0
            return (
              <div key={label}>
                <div className="flex justify-between font-mono text-[10px] mb-1">
                  <span style={{ color }}>{label}</span>
                  <span className="text-white/50">{fmt(value)} ({pct.toFixed(0)}%)</span>
                </div>
                <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, backgroundColor: color }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}