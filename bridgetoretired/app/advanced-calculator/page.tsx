'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, BarChart, Bar } from 'recharts'

const GOLD = '#E8B84B'
const SAGE = '#4ADE80'
const RED  = '#F87171'
const TEAL = '#2DD4BF'
const BLUE = '#60A5FA'

type WithdrawalOrder = 'taxable-first' | 'roth-first' | 'proportional'
type SpendingMode   = 'fixed' | 'dynamic'

interface Inputs {
  currentAge:       number
  retireAge:        number
  lifeExpectancy:   number
  portfolio:        number
  taxable:          number
  rothIRA:          number
  trad401k:         number
  cash:             number
  annualSpending:   number
  inflationRate:    number
  returnRate:       number
  equityPct:        number
  ssAge62:          number
  ssAge67:          number
  ssAge70:          number
  partTimeIncome:   number
  partTimeYears:    number
  healthcareCost:   number
  withdrawalOrder:  WithdrawalOrder
  spendingMode:     SpendingMode
  dynamicCutPct:    number
}

interface YearData {
  year:        number
  age:         number
  spending:    number
  income:      number
  withdrawal:  number
  taxable:     number
  roth:        number
  trad:        number
  total:       number
  phase:       string
}

interface Scenario {
  label:    string
  ssAge:    number
  ssIncome: number
  color:    string
  data:     YearData[]
  depleted: number | null
}

function runProjection(inputs: Inputs, ssAge: number, ssIncome: number): { data: YearData[], depleted: number | null } {
  const bridgeYears = Math.max(0, 59.5 - inputs.retireAge)
  let taxable = inputs.taxable
  let roth    = inputs.rothIRA
  let trad    = inputs.trad401k
  const data: YearData[] = []
  let depleted: number | null = null

  const totalYears = inputs.lifeExpectancy - inputs.retireAge

  for (let i = 0; i < totalYears; i++) {
    const age     = inputs.retireAge + i
    const isBridge = age < 59.5
    const inflFactor = Math.pow(1 + inputs.inflationRate / 100, i)
    let spending  = inputs.annualSpending * inflFactor
    const healthcare = inputs.healthcareCost * inflFactor

    // Dynamic spending — cut 10% if portfolio dropped below starting
    if (inputs.spendingMode === 'dynamic') {
      const total = taxable + roth + trad
      const startTotal = inputs.portfolio
      if (total < startTotal * 0.8) spending *= (1 - inputs.dynamicCutPct / 100)
    }

    const totalSpending = spending + healthcare

    // Income sources
    let income = 0
    if (i < inputs.partTimeYears) income += inputs.partTimeIncome
    if (age >= ssAge) income += ssIncome * Math.pow(1 + inputs.inflationRate / 100, age - ssAge)

    const needed = Math.max(0, totalSpending - income)

    // Withdrawal logic
    let withdrawal = needed
    if (inputs.withdrawalOrder === 'taxable-first' || isBridge) {
      const fromTaxable = Math.min(needed, taxable)
      taxable -= fromTaxable
      const remaining = needed - fromTaxable
      if (remaining > 0 && !isBridge) {
        const fromRoth = Math.min(remaining, roth)
        roth -= fromRoth
        const fromTrad = remaining - fromRoth
        trad = Math.max(0, trad - fromTrad)
      } else if (remaining > 0 && isBridge) {
        // During bridge, use Roth contributions (not earnings) or SEPP
        const fromRoth = Math.min(remaining, roth * 0.3) // simplified
        roth -= fromRoth
      }
    } else if (inputs.withdrawalOrder === 'roth-first') {
      const fromRoth = Math.min(needed, roth)
      roth -= fromRoth
      const remaining = needed - fromRoth
      const fromTaxable = Math.min(remaining, taxable)
      taxable -= fromTaxable
      trad = Math.max(0, trad - (remaining - fromTaxable))
    } else {
      // Proportional
      const total = taxable + roth + trad
      if (total > 0) {
        const pct = needed / total
        taxable = Math.max(0, taxable - taxable * pct)
        roth    = Math.max(0, roth    - roth    * pct)
        trad    = Math.max(0, trad    - trad    * pct)
      }
    }

    // Growth
    taxable = Math.max(0, taxable * (1 + inputs.returnRate / 100))
    roth    = Math.max(0, roth    * (1 + inputs.returnRate / 100))
    if (!isBridge) trad = Math.max(0, trad * (1 + inputs.returnRate / 100))
    else trad = Math.max(0, trad * (1 + inputs.returnRate / 100)) // grows untouched

    const total = taxable + roth + trad

    if (total <= 0 && depleted === null) depleted = age

    data.push({
      year:       i + 1,
      age:        Math.floor(age),
      spending:   Math.round(totalSpending),
      income:     Math.round(income),
      withdrawal: Math.round(withdrawal),
      taxable:    Math.round(Math.max(0, taxable)),
      roth:       Math.round(Math.max(0, roth)),
      trad:       Math.round(Math.max(0, trad)),
      total:      Math.round(Math.max(0, total)),
      phase:      isBridge ? 'Bridge' : age >= ssAge ? 'Full Income' : 'Post-59½',
    })
  }

  return { data, depleted }
}

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000)     return `$${Math.round(n / 1000)}k`
  return `$${n}`
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#141C28] border border-white/10 rounded-lg p-3 text-xs">
      <div className="font-mono text-white/50 mb-2">Age {label}</div>
      {payload.map((p: any) => (
        <div key={p.name} className="flex justify-between gap-4" style={{ color: p.color }}>
          <span>{p.name}</span>
          <span className="font-mono">{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

export default function AdvancedCalculatorPage() {
  const [inputs, setInputs] = useState<Inputs>({
    currentAge:      52,
    retireAge:       55,
    lifeExpectancy:  90,
    portfolio:       1_150_000,
    taxable:         350_000,
    rothIRA:         150_000,
    trad401k:        650_000,
    cash:             75_000,
    annualSpending:   55_000,
    inflationRate:     2.5,
    returnRate:        6.5,
    equityPct:        65,
    ssAge62:          18_000,
    ssAge67:          24_000,
    ssAge70:          30_000,
    partTimeIncome:       0,
    partTimeYears:        0,
    healthcareCost:   8_400,
    withdrawalOrder: 'taxable-first',
    spendingMode:    'fixed',
    dynamicCutPct:   10,
  })

  const [activeTab, setActiveTab] = useState<'portfolio' | 'spending' | 'compare'>('portfolio')

  const set = (key: keyof Inputs) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const val = e.target.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value
    setInputs(prev => ({ ...prev, [key]: val }))
  }

  const scenarios = useMemo((): Scenario[] => [
    { label: 'SS at 62', ssAge: 62, ssIncome: inputs.ssAge62, color: RED,  ...runProjection(inputs, 62, inputs.ssAge62) },
    { label: 'SS at 67', ssAge: 67, ssIncome: inputs.ssAge67, color: GOLD, ...runProjection(inputs, 67, inputs.ssAge67) },
    { label: 'SS at 70', ssAge: 70, ssIncome: inputs.ssAge70, color: SAGE, ...runProjection(inputs, 70, inputs.ssAge70) },
  ], [inputs])

  const primaryScenario = scenarios[1] // SS at 67 default

  const bridgeYears = Math.max(0, 59.5 - inputs.retireAge)
  const withdrawalRate = inputs.annualSpending / inputs.portfolio * 100

  // Chart data — merge all 3 scenarios for compare tab
  const compareData = primaryScenario.data.map((d, i) => ({
    age:   d.age,
    'SS at 62': scenarios[0].data[i]?.total ?? 0,
    'SS at 67': scenarios[1].data[i]?.total ?? 0,
    'SS at 70': scenarios[2].data[i]?.total ?? 0,
  }))

  const spendingData = primaryScenario.data.map(d => ({
    age:        d.age,
    Spending:   d.spending,
    Income:     d.income,
    Withdrawal: d.withdrawal,
  }))

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="border-b border-white/[0.06] bg-[#0D1420]">
        <div className="max-w-7xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link href="/" className="font-mono text-[11px] tracking-widest uppercase text-white/40 hover:text-[#E8B84B] transition-colors">
            ← BridgeToRetired
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-[#E8B84B]" />
            <span className="font-mono text-[9px] tracking-widest uppercase text-[#E8B84B]">Pro Feature</span>
          </div>
        </div>
      </div>

      <div className="bg-[#0D1420] border-b border-white/[0.06] px-5 py-10">
        <div className="max-w-7xl mx-auto">
          <div className="font-mono text-[9px] tracking-widest uppercase text-[#E8B84B] mb-3">Advanced Calculator</div>
          <h1 className="font-syne font-bold text-[clamp(26px,3vw,42px)] text-white tracking-tight mb-2">
            Bridge Retirement Calculator
          </h1>
          <p className="text-white/45 text-[14px]">All variables unlocked. Three SS scenarios side-by-side. Full withdrawal order control.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-8">

          {/* LEFT — Inputs Panel */}
          <div className="space-y-5">

            {/* Key Metrics Bar */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Bridge Years',    value: bridgeYears.toFixed(1),          color: bridgeYears > 10 ? RED : GOLD },
                { label: 'Withdrawal Rate', value: withdrawalRate.toFixed(1) + '%',  color: withdrawalRate > 4 ? RED : SAGE },
                { label: 'Total Portfolio', value: fmt(inputs.portfolio),            color: GOLD },
              ].map(m => (
                <div key={m.label} className="bg-[#141C28] border border-white/[0.07] rounded-xl p-3 text-center">
                  <div className="font-mono font-bold text-[16px] mb-1" style={{ color: m.color }}>{m.value}</div>
                  <div className="font-mono text-[8px] tracking-widest uppercase text-white/30">{m.label}</div>
                </div>
              ))}
            </div>

            {/* Input sections */}
            {[
              {
                title: 'Personal',
                fields: [
                  { label: 'Current Age',        key: 'currentAge',     min: 30, max: 65,  step: 1  },
                  { label: 'Retire Age',          key: 'retireAge',      min: 40, max: 65,  step: 1  },
                  { label: 'Life Expectancy',     key: 'lifeExpectancy', min: 70, max: 100, step: 1  },
                ]
              },
              {
                title: 'Portfolio Balances',
                fields: [
                  { label: 'Taxable Brokerage',  key: 'taxable',        min: 0, max: 5000000, step: 10000, fmt: true },
                  { label: 'Roth IRA',           key: 'rothIRA',        min: 0, max: 2000000, step: 10000, fmt: true },
                  { label: 'Traditional 401k',   key: 'trad401k',       min: 0, max: 5000000, step: 10000, fmt: true },
                  { label: 'Cash / Buffer',       key: 'cash',           min: 0, max: 1000000, step: 5000,  fmt: true },
                ]
              },
              {
                title: 'Spending & Income',
                fields: [
                  { label: 'Annual Spending',    key: 'annualSpending', min: 20000, max: 300000, step: 1000, fmt: true },
                  { label: 'Healthcare/ACA Cost',key: 'healthcareCost', min: 0,     max: 30000,  step: 500,  fmt: true },
                  { label: 'Part-Time Income',   key: 'partTimeIncome', min: 0,     max: 100000, step: 1000, fmt: true },
                  { label: 'Part-Time Years',    key: 'partTimeYears',  min: 0,     max: 20,     step: 1     },
                ]
              },
              {
                title: 'Returns & Inflation',
                fields: [
                  { label: 'Portfolio Return (%)', key: 'returnRate',    min: 1, max: 12, step: 0.1 },
                  { label: 'Inflation Rate (%)',   key: 'inflationRate', min: 1, max: 8,  step: 0.1 },
                  { label: 'Equity Allocation (%)','key': 'equityPct',   min: 0, max: 100, step: 5  },
                ]
              },
              {
                title: 'Social Security',
                fields: [
                  { label: 'SS Benefit at 62',   key: 'ssAge62',        min: 0, max: 60000, step: 500, fmt: true },
                  { label: 'SS Benefit at 67',   key: 'ssAge67',        min: 0, max: 60000, step: 500, fmt: true },
                  { label: 'SS Benefit at 70',   key: 'ssAge70',        min: 0, max: 60000, step: 500, fmt: true },
                ]
              },
            ].map(section => (
              <div key={section.title} className="bg-[#141C28] border border-white/[0.07] rounded-xl overflow-hidden">
                <div className="bg-[#1E2A3A] px-4 py-2.5">
                  <span className="font-mono text-[9px] tracking-widest uppercase text-white/40">{section.title}</span>
                </div>
                <div className="p-4 space-y-3">
                  {section.fields.map(f => (
                    <div key={f.key} className="flex items-center justify-between gap-3">
                      <label className="text-white/55 text-[12px] flex-1">{f.label}</label>
                      <div className="flex items-center gap-2">
                        {(f as any).fmt && <span className="text-white/30 text-[11px]">$</span>}
                        <input
                          type="number"
                          min={(f as any).min}
                          max={(f as any).max}
                          step={(f as any).step}
                          value={(inputs as any)[f.key]}
                          onChange={set(f.key as keyof Inputs)}
                          className="w-24 bg-[#0D1420] border border-white/[0.12] rounded px-2 py-1 text-[#E8B84B] font-mono text-[12px] text-right focus:outline-none focus:border-[#E8B84B]/50"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Withdrawal Order */}
            <div className="bg-[#141C28] border border-white/[0.07] rounded-xl overflow-hidden">
              <div className="bg-[#1E2A3A] px-4 py-2.5">
                <span className="font-mono text-[9px] tracking-widest uppercase text-white/40">Withdrawal Order</span>
              </div>
              <div className="p-4 space-y-2">
                {[
                  { value: 'taxable-first',  label: 'Taxable first (bridge optimal)' },
                  { value: 'roth-first',     label: 'Roth first (tax-free priority)' },
                  { value: 'proportional',   label: 'Proportional (balanced)' },
                ].map(opt => (
                  <label key={opt.value} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="withdrawalOrder"
                      value={opt.value}
                      checked={inputs.withdrawalOrder === opt.value}
                      onChange={() => setInputs(p => ({ ...p, withdrawalOrder: opt.value as WithdrawalOrder }))}
                      className="accent-[#E8B84B]"
                    />
                    <span className="text-white/60 text-[12px]">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Spending Mode */}
            <div className="bg-[#141C28] border border-white/[0.07] rounded-xl overflow-hidden">
              <div className="bg-[#1E2A3A] px-4 py-2.5">
                <span className="font-mono text-[9px] tracking-widest uppercase text-white/40">Spending Mode</span>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex gap-3">
                  {[
                    { value: 'fixed',   label: 'Fixed' },
                    { value: 'dynamic', label: 'Dynamic (cut in bad years)' },
                  ].map(opt => (
                    <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="spendingMode"
                        value={opt.value}
                        checked={inputs.spendingMode === opt.value}
                        onChange={() => setInputs(p => ({ ...p, spendingMode: opt.value as SpendingMode }))}
                        className="accent-[#E8B84B]"
                      />
                      <span className="text-white/60 text-[12px]">{opt.label}</span>
                    </label>
                  ))}
                </div>
                {inputs.spendingMode === 'dynamic' && (
                  <div className="flex items-center justify-between">
                    <span className="text-white/55 text-[12px]">Cut spending by (%)</span>
                    <input
                      type="number"
                      min={5} max={30} step={1}
                      value={inputs.dynamicCutPct}
                      onChange={set('dynamicCutPct')}
                      className="w-20 bg-[#0D1420] border border-white/[0.12] rounded px-2 py-1 text-[#E8B84B] font-mono text-[12px] text-right focus:outline-none focus:border-[#E8B84B]/50"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT — Charts & Results */}
          <div className="space-y-6">

            {/* Summary Cards — all 3 scenarios */}
            <div className="grid grid-cols-3 gap-4">
              {scenarios.map(s => (
                <div key={s.label} className="bg-[#141C28] border border-white/[0.07] rounded-xl p-5" style={{ borderTopColor: s.color, borderTopWidth: 2 }}>
                  <div className="font-mono text-[9px] tracking-widest uppercase mb-3" style={{ color: s.color }}>{s.label}</div>
                  <div className="font-syne font-bold text-xl text-white mb-1">{fmt(s.data[s.data.length - 1]?.total ?? 0)}</div>
                  <div className="text-white/35 text-[11px] mb-3">at age {inputs.lifeExpectancy}</div>
                  {s.depleted ? (
                    <div className="bg-red-500/10 border border-red-500/20 rounded px-2 py-1">
                      <span className="font-mono text-[9px] text-red-400">⚠ Depletes age {s.depleted}</span>
                    </div>
                  ) : (
                    <div className="bg-green-500/10 border border-green-500/20 rounded px-2 py-1">
                      <span className="font-mono text-[9px] text-green-400">✓ Funded to {inputs.lifeExpectancy}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Chart Tabs */}
            <div className="bg-[#141C28] border border-white/[0.07] rounded-xl overflow-hidden">
              <div className="flex border-b border-white/[0.07]">
                {[
                  { key: 'portfolio', label: 'Portfolio Value' },
                  { key: 'spending',  label: 'Cash Flow' },
                  { key: 'compare',   label: 'SS Comparison' },
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
                    <div className="font-mono text-[9px] tracking-widest uppercase text-white/30 mb-4">Portfolio Balance by Account Type (SS at 67)</div>
                    <ResponsiveContainer width="100%" height={320}>
                      <LineChart data={primaryScenario.data} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="age" stroke="#ffffff30" tick={{ fontSize: 10, fill: '#ffffff50' }} label={{ value: 'Age', position: 'insideBottom', offset: -2, fill: '#ffffff30', fontSize: 10 }} />
                        <YAxis stroke="#ffffff30" tick={{ fontSize: 10, fill: '#ffffff50' }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 10, color: '#ffffff60' }} />
                        <ReferenceLine x={59} stroke={GOLD} strokeDasharray="4 4" label={{ value: '59½', fill: GOLD, fontSize: 9 }} />
                        <Line type="monotone" dataKey="taxable" name="Taxable" stroke={TEAL} strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="roth"    name="Roth"    stroke={SAGE} strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="trad"    name="401k"    stroke={BLUE} strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="total"   name="Total"   stroke={GOLD} strokeWidth={2.5} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </>
                )}

                {activeTab === 'spending' && (
                  <>
                    <div className="font-mono text-[9px] tracking-widest uppercase text-white/30 mb-4">Annual Cash Flow — Spending vs Income vs Withdrawal</div>
                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart data={spendingData} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="age" stroke="#ffffff30" tick={{ fontSize: 10, fill: '#ffffff50' }} />
                        <YAxis stroke="#ffffff30" tick={{ fontSize: 10, fill: '#ffffff50' }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 10, color: '#ffffff60' }} />
                        <Bar dataKey="Spending"   fill={RED}  opacity={0.8} />
                        <Bar dataKey="Income"     fill={SAGE} opacity={0.8} />
                        <Bar dataKey="Withdrawal" fill={GOLD} opacity={0.8} />
                      </BarChart>
                    </ResponsiveContainer>
                  </>
                )}

                {activeTab === 'compare' && (
                  <>
                    <div className="font-mono text-[9px] tracking-widest uppercase text-white/30 mb-4">Total Portfolio — All 3 SS Claiming Ages</div>
                    <ResponsiveContainer width="100%" height={320}>
                      <LineChart data={compareData} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="age" stroke="#ffffff30" tick={{ fontSize: 10, fill: '#ffffff50' }} />
                        <YAxis stroke="#ffffff30" tick={{ fontSize: 10, fill: '#ffffff50' }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 10, color: '#ffffff60' }} />
                        <ReferenceLine x={62} stroke={RED}  strokeDasharray="3 3" />
                        <ReferenceLine x={67} stroke={GOLD} strokeDasharray="3 3" />
                        <ReferenceLine x={70} stroke={SAGE} strokeDasharray="3 3" />
                        <Line type="monotone" dataKey="SS at 62" stroke={RED}  strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="SS at 67" stroke={GOLD} strokeWidth={2.5} dot={false} />
                        <Line type="monotone" dataKey="SS at 70" stroke={SAGE} strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                    {/* SS Crossover analysis */}
                    <div className="mt-4 grid grid-cols-3 gap-3">
                      {scenarios.map(s => {
                        const atAge80 = s.data.find(d => d.age === 80)?.total ?? 0
                        const atAge85 = s.data.find(d => d.age === 85)?.total ?? 0
                        return (
                          <div key={s.label} className="bg-black/30 rounded-lg p-3 text-center">
                            <div className="font-mono text-[8px] tracking-widest uppercase mb-2" style={{ color: s.color }}>{s.label}</div>
                            <div className="text-white/60 text-[11px]">Age 80: <span className="text-white font-mono">{fmt(atAge80)}</span></div>
                            <div className="text-white/60 text-[11px]">Age 85: <span className="text-white font-mono">{fmt(atAge85)}</span></div>
                          </div>
                        )
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Year-by-year table */}
            <div className="bg-[#141C28] border border-white/[0.07] rounded-xl overflow-hidden">
              <div className="bg-[#1E2A3A] px-5 py-3 flex items-center justify-between">
                <span className="font-mono text-[9px] tracking-widest uppercase text-white/40">Year-by-Year Detail (SS at 67)</span>
                <span className="font-mono text-[8px] text-white/20">First 20 years shown</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      {['Age','Phase','Spending','Income','Withdrawal','Total Portfolio'].map(h => (
                        <th key={h} className="px-3 py-2 text-left font-mono text-[9px] tracking-widest uppercase text-white/30">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {primaryScenario.data.slice(0, 20).map((row, i) => (
                      <tr key={row.age} className={`border-b border-white/[0.04] ${i % 2 === 0 ? '' : 'bg-white/[0.02]'}`}>
                        <td className="px-3 py-2 font-mono text-white/70">{row.age}</td>
                        <td className="px-3 py-2">
                          <span className="font-mono text-[8px] px-1.5 py-0.5 rounded" style={{
                            background: row.phase === 'Bridge' ? `${GOLD}20` : row.phase === 'Full Income' ? `${SAGE}20` : `${TEAL}20`,
                            color: row.phase === 'Bridge' ? GOLD : row.phase === 'Full Income' ? SAGE : TEAL,
                          }}>{row.phase}</span>
                        </td>
                        <td className="px-3 py-2 font-mono text-white/60">{fmt(row.spending)}</td>
                        <td className="px-3 py-2 font-mono text-[#4ADE80]">{row.income > 0 ? fmt(row.income) : '—'}</td>
                        <td className="px-3 py-2 font-mono text-[#F87171]">{fmt(row.withdrawal)}</td>
                        <td className="px-3 py-2 font-mono font-bold" style={{ color: row.total < inputs.portfolio * 0.5 ? RED : GOLD }}>{fmt(row.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </div>
      <ProNav />
    </div>
  )
}
