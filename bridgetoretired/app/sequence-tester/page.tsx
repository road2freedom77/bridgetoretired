'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ProNav } from '@/components/ProNav'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend, BarChart, Bar
} from 'recharts'

const GOLD   = '#E8B84B'
const SAGE   = '#4ADE80'
const RED    = '#F87171'
const TEAL   = '#2DD4BF'
const BLUE   = '#60A5FA'
const PURPLE = '#A78BFA'
const ORANGE = '#FB923C'

// Historical market sequences (annual real returns)
const HISTORICAL_SEQUENCES: Record<string, { label: string; color: string; returns: number[] }> = {
  normal: {
    label: 'Average Market',
    color: GOLD,
    returns: Array(30).fill(0.065),
  },
  great: {
    label: '1990s Bull Run',
    color: SAGE,
    returns: [0.31, 0.07, 0.10, 0.23, 0.33, 0.28, 0.21, 0.33, 0.28, 0.21,
              0.065, 0.065, 0.065, 0.065, 0.065, 0.065, 0.065, 0.065, 0.065, 0.065,
              0.065, 0.065, 0.065, 0.065, 0.065, 0.065, 0.065, 0.065, 0.065, 0.065],
  },
  dotcom: {
    label: '2000 Dot-Com Crash',
    color: RED,
    returns: [-0.09, -0.12, -0.22, 0.29, 0.11, 0.16, 0.05, -0.37, 0.26, 0.15,
               0.02, 0.16, 0.32, 0.14, 0.01, 0.12, 0.22, 0.065, 0.065, 0.065,
               0.065, 0.065, 0.065, 0.065, 0.065, 0.065, 0.065, 0.065, 0.065, 0.065],
  },
  gfc: {
    label: '2008 Financial Crisis',
    color: ORANGE,
    returns: [-0.37, 0.26, 0.15, 0.02, 0.16, 0.32, 0.14, 0.01, 0.12, 0.22,
               0.31, 0.18, 0.065, 0.065, 0.065, 0.065, 0.065, 0.065, 0.065, 0.065,
               0.065, 0.065, 0.065, 0.065, 0.065, 0.065, 0.065, 0.065, 0.065, 0.065],
  },
  reversed: {
    label: 'Best Years First',
    color: TEAL,
    returns: [0.37, 0.33, 0.31, 0.28, 0.26, 0.22, 0.21, 0.18, 0.16, 0.15,
              0.065, 0.065, 0.065, 0.065, 0.065, 0.065, 0.065, 0.065, 0.065, 0.065,
              0.065, 0.065, 0.065, 0.065, 0.065, 0.065, 0.065, 0.065, 0.065, 0.065],
  },
  worst: {
    label: 'Worst Case (1965)',
    color: PURPLE,
    returns: [-0.10, 0.24, 0.11, -0.09, 0.04, 0.15, -0.26, -0.15, 0.23, 0.18,
               0.32, -0.05, 0.22, 0.065, 0.065, 0.065, 0.065, 0.065, 0.065, 0.065,
               0.065, 0.065, 0.065, 0.065, 0.065, 0.065, 0.065, 0.065, 0.065, 0.065],
  },
}

interface Inputs {
  portfolio:      number
  annualSpending: number
  inflationRate:  number
  cashBuffer:     number
  ssIncome:       number
  ssStartYear:    number
  partTimeIncome: number
  partTimeYears:  number
}

interface YearResult {
  year:      number
  portfolio: number
  return:    number
  spending:  number
  income:    number
  withdrawal:number
}

interface ScenarioResult {
  key:       string
  label:     string
  color:     string
  data:      YearResult[]
  depleted:  number | null
  finalValue:number
  lowestYear:number
  lowestVal: number
}

function runScenario(
  inputs: Inputs,
  returns: number[],
  label: string,
  color: string,
  key: string
): ScenarioResult {
  let portfolio = inputs.portfolio
  let cashBuffer = inputs.cashBuffer
  let depleted: number | null = null
  let lowestVal = Infinity
  let lowestYear = 0
  const data: YearResult[] = []

  for (let i = 0; i < 30; i++) {
    const year    = i + 1
    const ret     = returns[i] ?? 0.065
    const spending = inputs.annualSpending * Math.pow(1 + inputs.inflationRate / 100, i)
    let income    = 0
    if (i < inputs.partTimeYears) income += inputs.partTimeIncome
    if (year >= inputs.ssStartYear) income += inputs.ssIncome * Math.pow(1 + inputs.inflationRate / 100, i)
    const needed  = Math.max(0, spending - income)

    // Use cash buffer first in bad years
    let fromCash  = 0
    let withdrawal = 0
    if (ret < 0 && cashBuffer > 0) {
      fromCash   = Math.min(needed, cashBuffer)
      cashBuffer = Math.max(0, cashBuffer - fromCash)
      withdrawal = Math.max(0, needed - fromCash)
    } else {
      withdrawal = needed
      // Refill cash buffer in good years
      if (ret > 0.10 && cashBuffer < inputs.cashBuffer) {
        const refill = Math.min(inputs.cashBuffer - cashBuffer, portfolio * 0.05)
        cashBuffer  += refill
        withdrawal  += refill
      }
    }

    portfolio = Math.max(0, portfolio * (1 + ret) - withdrawal)

    if (portfolio <= 0 && depleted === null) depleted = year
    if (portfolio < lowestVal && portfolio > 0) { lowestVal = portfolio; lowestYear = year }

    data.push({
      year,
      portfolio: Math.round(Math.max(0, portfolio)),
      return:    Math.round(ret * 1000) / 10,
      spending:  Math.round(spending),
      income:    Math.round(income),
      withdrawal: Math.round(withdrawal),
    })
  }

  return {
    key, label, color, data, depleted,
    finalValue: data[data.length - 1]?.portfolio ?? 0,
    lowestYear,
    lowestVal: lowestVal === Infinity ? 0 : Math.round(lowestVal),
  }
}

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000)     return `$${Math.round(n / 1000)}k`
  return `$${Math.round(n)}`
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#141C28] border border-white/10 rounded-lg p-3 text-xs min-w-[140px]">
      <div className="font-mono text-white/40 mb-2 text-[9px]">Year {label}</div>
      {payload.map((p: any) => (
        <div key={p.name} className="flex justify-between gap-4 mb-0.5" style={{ color: p.color }}>
          <span className="text-[10px]">{p.name}</span>
          <span className="font-mono text-[10px]">{typeof p.value === 'number' && p.value > 1000 ? fmt(p.value) : p.value + (p.name.includes('Return') ? '%' : '')}</span>
        </div>
      ))}
    </div>
  )
}

export default function SequenceTesterPage() {
  const [inputs, setInputs] = useState<Inputs>({
    portfolio:       1_150_000,
    annualSpending:    55_000,
    inflationRate:       2.5,
    cashBuffer:        75_000,
    ssIncome:          24_000,
    ssStartYear:           13,
    partTimeIncome:         0,
    partTimeYears:          0,
  })

  const [activeScenarios, setActiveScenarios] = useState<string[]>(['normal', 'dotcom', 'gfc', 'reversed'])
  const [activeTab, setActiveTab]             = useState<'portfolio' | 'returns' | 'table'>('portfolio')
  const [selectedDetail, setSelectedDetail]   = useState<string>('dotcom')

  const set = (key: keyof Inputs) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputs(prev => ({ ...prev, [key]: parseFloat(e.target.value) || 0 }))
  }

  const toggleScenario = (key: string) => {
    setActiveScenarios(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  const results = useMemo(() =>
    Object.entries(HISTORICAL_SEQUENCES).map(([key, seq]) =>
      runScenario(inputs, seq.returns, seq.label, seq.color, key)
    ), [inputs])

  const activeResults = results.filter(r => activeScenarios.includes(r.key))

  // Merged chart data
  const portfolioChartData = Array.from({ length: 30 }, (_, i) => {
    const obj: Record<string, any> = { year: i + 1 }
    activeResults.forEach(r => { obj[r.label] = r.data[i]?.portfolio ?? 0 })
    return obj
  })

  const returnsChartData = Object.entries(HISTORICAL_SEQUENCES)
    .filter(([k]) => activeScenarios.includes(k))
    .flatMap(([key, seq]) =>
      seq.returns.slice(0, 15).map((ret, i) => ({ year: i + 1, key, label: seq.label, return: Math.round(ret * 1000) / 10 }))
    )

  const returnsBarData = Array.from({ length: 15 }, (_, i) => {
    const obj: Record<string, any> = { year: i + 1 }
    Object.entries(HISTORICAL_SEQUENCES).forEach(([key, seq]) => {
      if (activeScenarios.includes(key)) obj[seq.label] = Math.round(seq.returns[i] * 1000) / 10
    })
    return obj
  })

  const detailResult = results.find(r => r.key === selectedDetail) ?? results[0]

  const withdrawalRate = inputs.annualSpending / inputs.portfolio * 100

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="border-b border-white/[0.06] bg-[#0D1420]">
        <div className="max-w-7xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link href="/pro-welcome" className="font-mono text-[11px] tracking-widest uppercase text-white/40 hover:text-[#E8B84B] transition-colors">
            ← Pro Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-[#E8B84B]" />
            <span className="font-mono text-[9px] tracking-widest uppercase text-[#E8B84B]">Pro Feature</span>
          </div>
        </div>
      </div>

      <div className="bg-[#0D1420] border-b border-white/[0.06] px-5 py-10">
        <div className="max-w-7xl mx-auto">
          <div className="font-mono text-[9px] tracking-widest uppercase text-[#E8B84B] mb-3">Stress Tester</div>
          <h1 className="font-syne font-bold text-[clamp(24px,3vw,40px)] text-white tracking-tight mb-2">
            Sequence-of-Returns Stress Test
          </h1>
          <p className="text-white/45 text-[14px] max-w-2xl">
            The order of market returns matters more than the average. A crash in year 1 of retirement is far more damaging than one in year 15. See how your bridge survives every scenario.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-8">

          {/* LEFT — Inputs */}
          <div className="space-y-5">

            {/* Key stats */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Withdrawal Rate', value: withdrawalRate.toFixed(1) + '%', color: withdrawalRate > 4 ? RED : SAGE },
                { label: 'Cash Buffer',     value: fmt(inputs.cashBuffer),          color: inputs.cashBuffer > inputs.annualSpending ? SAGE : RED },
              ].map(m => (
                <div key={m.label} className="bg-[#141C28] border border-white/[0.07] rounded-xl p-3 text-center">
                  <div className="font-mono font-bold text-[16px] mb-1" style={{ color: m.color }}>{m.value}</div>
                  <div className="font-mono text-[8px] tracking-widest uppercase text-white/30">{m.label}</div>
                </div>
              ))}
            </div>

            {/* Inputs */}
            {[
              {
                title: 'Your Portfolio',
                fields: [
                  { label: 'Total Portfolio',    key: 'portfolio',       min: 100000, max: 5000000, step: 50000,  prefix: '$' },
                  { label: 'Annual Spending',    key: 'annualSpending',  min: 20000,  max: 300000,  step: 1000,   prefix: '$' },
                  { label: 'Cash Buffer',        key: 'cashBuffer',      min: 0,      max: 500000,  step: 5000,   prefix: '$', note: 'Used first in down years' },
                  { label: 'Inflation Rate %',   key: 'inflationRate',   min: 1,      max: 8,       step: 0.1     },
                ]
              },
              {
                title: 'Income Sources',
                fields: [
                  { label: 'SS Annual Benefit',  key: 'ssIncome',        min: 0,      max: 60000,   step: 500,    prefix: '$' },
                  { label: 'SS Starts (Year #)', key: 'ssStartYear',     min: 1,      max: 20,      step: 1,      note: 'e.g. Year 13 = age 67 if retire 54' },
                  { label: 'Part-Time Income',   key: 'partTimeIncome',  min: 0,      max: 100000,  step: 1000,   prefix: '$' },
                  { label: 'Part-Time Years',    key: 'partTimeYears',   min: 0,      max: 20,      step: 1       },
                ]
              },
            ].map(section => (
              <div key={section.title} className="bg-[#141C28] border border-white/[0.07] rounded-xl overflow-hidden">
                <div className="bg-[#1E2A3A] px-4 py-2.5">
                  <span className="font-mono text-[9px] tracking-widest uppercase text-white/40">{section.title}</span>
                </div>
                <div className="p-4 space-y-1">
                  {section.fields.map(f => (
                    <div key={f.key}>
                      <div className="flex items-center justify-between py-2 border-b border-white/[0.04]">
                        <span className="text-white/50 text-[12px]">{f.label}</span>
                        <div className="flex items-center gap-1">
                          {(f as any).prefix && <span className="text-white/25 text-[10px]">{(f as any).prefix}</span>}
                          <input
                            type="number"
                            min={(f as any).min} max={(f as any).max} step={(f as any).step}
                            value={(inputs as any)[f.key]}
                            onChange={set(f.key as keyof Inputs)}
                            className="w-24 bg-[#0D1420] border border-white/[0.1] rounded px-2 py-1.5 text-[#E8B84B] font-mono text-[12px] text-right focus:outline-none focus:border-[#E8B84B]/50"
                          />
                        </div>
                      </div>
                      {(f as any).note && (
                        <div className="text-white/20 text-[9px] italic pb-1">{(f as any).note}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Scenario toggles */}
            <div className="bg-[#141C28] border border-white/[0.07] rounded-xl overflow-hidden">
              <div className="bg-[#1E2A3A] px-4 py-2.5">
                <span className="font-mono text-[9px] tracking-widest uppercase text-white/40">Scenarios to Show</span>
              </div>
              <div className="p-4 space-y-2">
                {Object.entries(HISTORICAL_SEQUENCES).map(([key, seq]) => {
                  const r = results.find(r => r.key === key)!
                  const isActive = activeScenarios.includes(key)
                  return (
                    <button
                      key={key}
                      onClick={() => toggleScenario(key)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all ${
                        isActive ? 'border-opacity-50' : 'border-white/[0.06] opacity-40'
                      }`}
                      style={isActive ? { borderColor: seq.color + '50', background: seq.color + '10' } : {}}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: isActive ? seq.color : '#ffffff20' }} />
                        <span className="text-white text-[12px] font-medium text-left">{seq.label}</span>
                      </div>
                      <div className="text-right">
                        {r.depleted ? (
                          <span className="font-mono text-[9px]" style={{ color: RED }}>Depletes yr {r.depleted}</span>
                        ) : (
                          <span className="font-mono text-[9px]" style={{ color: SAGE }}>{fmt(r.finalValue)}</span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* RIGHT — Charts */}
          <div className="space-y-6">

            {/* Summary scorecards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {activeResults.map(r => (
                <div
                  key={r.key}
                  className="bg-[#141C28] border border-white/[0.07] rounded-xl p-4 cursor-pointer transition-all"
                  style={{ borderTopColor: r.color, borderTopWidth: 2 }}
                  onClick={() => setSelectedDetail(r.key)}
                >
                  <div className="font-mono text-[8px] tracking-widest uppercase mb-2" style={{ color: r.color }}>{r.label}</div>
                  <div className="font-syne font-bold text-lg text-white mb-1">{fmt(r.finalValue)}</div>
                  <div className="text-white/35 text-[10px] mb-2">at year 30</div>
                  {r.depleted ? (
                    <div className="bg-red-500/10 border border-red-500/20 rounded px-2 py-1">
                      <span className="font-mono text-[8px]" style={{ color: RED }}>⚠ Depletes yr {r.depleted}</span>
                    </div>
                  ) : (
                    <div className="bg-green-500/10 border border-green-500/20 rounded px-2 py-1">
                      <span className="font-mono text-[8px]" style={{ color: SAGE }}>✓ Survives 30 yrs</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Chart tabs */}
            <div className="bg-[#141C28] border border-white/[0.07] rounded-xl overflow-hidden">
              <div className="flex border-b border-white/[0.07]">
                {[
                  { key: 'portfolio', label: 'Portfolio Value' },
                  { key: 'returns',   label: 'Return Sequence' },
                  { key: 'table',     label: 'Year-by-Year' },
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`flex-1 py-3 font-mono text-[10px] tracking-widest uppercase transition-colors ${
                      activeTab === tab.key
                        ? 'bg-[#1E2A3A] text-[#E8B84B] border-b-2 border-[#E8B84B]'
                        : 'text-white/30 hover:text-white/60'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-5">
                {activeTab === 'portfolio' && (
                  <>
                    <div className="font-mono text-[9px] tracking-widest uppercase text-white/30 mb-1">Portfolio Balance Over 30 Years</div>
                    <div className="text-white/25 text-[10px] mb-4">Same average return (~6.5%), different sequence. Notice the gap.</div>
                    <ResponsiveContainer width="100%" height={340}>
                      <LineChart data={portfolioChartData} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="year" stroke="#ffffff30" tick={{ fontSize: 10, fill: '#ffffff50' }} label={{ value: 'Year', position: 'insideBottom', offset: -2, fill: '#ffffff30', fontSize: 10 }} />
                        <YAxis stroke="#ffffff30" tick={{ fontSize: 10, fill: '#ffffff50' }} tickFormatter={v => fmt(v)} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 10, color: '#ffffff60' }} />
                        <ReferenceLine y={0} stroke={RED} strokeDasharray="4 4" />
                        {activeResults.map(r => (
                          <Line key={r.key} type="monotone" dataKey={r.label} stroke={r.color} strokeWidth={2} dot={false} />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </>
                )}

                {activeTab === 'returns' && (
                  <>
                    <div className="font-mono text-[9px] tracking-widest uppercase text-white/30 mb-1">Annual Return Sequence (First 15 Years)</div>
                    <div className="text-white/25 text-[10px] mb-4">Early negative returns are devastated by withdrawals — they never recover.</div>
                    <ResponsiveContainer width="100%" height={340}>
                      <BarChart data={returnsBarData} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="year" stroke="#ffffff30" tick={{ fontSize: 10, fill: '#ffffff50' }} label={{ value: 'Year', position: 'insideBottom', offset: -2, fill: '#ffffff30', fontSize: 10 }} />
                        <YAxis stroke="#ffffff30" tick={{ fontSize: 10, fill: '#ffffff50' }} tickFormatter={v => v + '%'} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 10, color: '#ffffff60' }} />
                        <ReferenceLine y={0} stroke="rgba(255,255,255,0.2)" />
                        {activeResults.map(r => (
                          <Bar key={r.key} dataKey={r.label} fill={r.color} opacity={0.8} />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  </>
                )}

                {activeTab === 'table' && (
                  <>
                    <div className="flex gap-3 mb-4 flex-wrap">
                      {activeResults.map(r => (
                        <button
                          key={r.key}
                          onClick={() => setSelectedDetail(r.key)}
                          className="font-mono text-[9px] tracking-widest uppercase px-3 py-1.5 rounded-lg border transition-all"
                          style={selectedDetail === r.key
                            ? { borderColor: r.color, color: r.color, background: r.color + '15' }
                            : { borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)' }
                          }
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-[11px]">
                        <thead>
                          <tr className="border-b border-white/[0.07]">
                            {['Year', 'Return', 'Spending', 'Income', 'Withdrawal', 'Portfolio'].map(h => (
                              <th key={h} className="px-3 py-2 text-left font-mono text-[9px] tracking-widest uppercase text-white/30">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {detailResult.data.map((row, i) => (
                            <tr key={row.year} className={`border-b border-white/[0.03] ${i % 2 === 0 ? '' : 'bg-white/[0.02]'} ${row.return < 0 ? 'bg-red-500/5' : ''}`}>
                              <td className="px-3 py-2 font-mono text-white/60">{row.year}</td>
                              <td className="px-3 py-2 font-mono" style={{ color: row.return < 0 ? RED : SAGE }}>{row.return > 0 ? '+' : ''}{row.return}%</td>
                              <td className="px-3 py-2 font-mono text-white/50">{fmt(row.spending)}</td>
                              <td className="px-3 py-2 font-mono" style={{ color: TEAL }}>{row.income > 0 ? fmt(row.income) : '—'}</td>
                              <td className="px-3 py-2 font-mono" style={{ color: RED }}>{fmt(row.withdrawal)}</td>
                              <td className="px-3 py-2 font-mono font-bold" style={{ color: row.portfolio < inputs.portfolio * 0.4 ? RED : GOLD }}>{fmt(row.portfolio)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Key insight box */}
            <div className="bg-[#141C28] border border-[#E8B84B]/15 rounded-xl p-6">
              <div className="font-mono text-[9px] tracking-widest uppercase text-[#E8B84B] mb-3">Why This Matters for Your Bridge</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[12px] text-white/50 leading-relaxed">
                <div className="bg-black/30 rounded-lg p-4">
                  <div className="text-white font-semibold mb-2">🔴 Bad Years First</div>
                  Early losses force large withdrawals when the portfolio is already down. The portfolio never recovers — even if later years are excellent.
                </div>
                <div className="bg-black/30 rounded-lg p-4">
                  <div className="text-white font-semibold mb-2">🟡 Cash Buffer Defense</div>
                  Your <span style={{ color: GOLD }}>{fmt(inputs.cashBuffer)}</span> cash buffer is drawn first in down years — protecting your invested portfolio from forced selling at the worst time.
                </div>
                <div className="bg-black/30 rounded-lg p-4">
                  <div className="text-white font-semibold mb-2">🟢 The Fix</div>
                  Maintain 2-3 years of spending in cash/bonds. Withdraw from equities only in up years. This single strategy dramatically improves all bad-sequence outcomes.
                </div>
              </div>
            </div>

           </div>
        </div>
      </div>
      <ProNav />
    </div>
  )
}
