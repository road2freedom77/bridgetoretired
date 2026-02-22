'use client'
import { useState, useMemo } from 'react'

interface YearRow {
  year: number
  age: number
  taxableStart: number
  k401Start: number
  rothStart: number
  withdrawal: number
  account: string
  taxableEnd: number
  k401End: number
  rothEnd: number
  totalEnd: number
}

function calcBridge(
  currentAge: number,
  retireAge: number,
  lifeExp: number,
  ssAge: number,
  taxable: number,
  k401: number,
  roth: number,
  spending: number,
  returnPct: number,
  inflationPct: number,
  inflationAdjust: boolean
): YearRow[] {
  const rows: YearRow[] = []
  const startYear = new Date().getFullYear() + (retireAge - currentAge)
  let tb = taxable, k = k401, ro = roth
  const ACCESS_AGE = 59.5

  for (let age = retireAge; age <= lifeExp; age++) {
    const yr = startYear + (age - retireAge)
    const yearsIn = age - retireAge
    const w = inflationAdjust ? spending * Math.pow(1 + inflationPct, yearsIn) : spending

    const tbS = tb, kS = k, roS = ro
    let acct = ''

    if (age < ACCESS_AGE) {
      // Bridge: draw from taxable first
      if (tb >= w) { tb -= w; acct = 'Taxable' }
      else if (tb > 0) { const rem = w - tb; tb = 0; ro -= rem; acct = 'Taxable + Roth' }
      else { ro -= w; acct = 'Roth' }
    } else {
      // Post-59½: draw from 401k first
      if (k >= w) { k -= w; acct = '401(k)' }
      else if (k > 0) { const rem = w - k; k = 0; ro -= rem; acct = '401k + Roth' }
      else { ro -= w; acct = 'Roth' }
    }

    // Growth on remaining balances
    tb = Math.max(0, tb) * (1 + returnPct)
    k  = Math.max(0, k)  * (1 + returnPct)
    ro = Math.max(0, ro) * (1 + returnPct)

    rows.push({
      year: yr, age,
      taxableStart: tbS, k401Start: kS, rothStart: roS,
      withdrawal: w, account: acct,
      taxableEnd: tb, k401End: k, rothEnd: ro,
      totalEnd: tb + k + ro,
    })
  }
  return rows
}

const fmt = (n: number) =>
  n < 0 ? `-$${Math.abs(Math.round(n)).toLocaleString()}` : `$${Math.round(n).toLocaleString()}`

export function Calculator() {
  const [inputs, setInputs] = useState({
    currentAge:    48,
    retireAge:     52,
    lifeExp:       90,
    ssAge:         67,
    taxable:       120000,
    k401:          650000,
    roth:          90000,
    spending:      40000,
    returnPct:     5,
    inflationPct:  2.5,
    inflationAdj:  true,
  })

  const set = (k: keyof typeof inputs, v: number | boolean) =>
    setInputs(prev => ({ ...prev, [k]: v }))

  const rows = useMemo(() =>
    calcBridge(
      inputs.currentAge, inputs.retireAge, inputs.lifeExp, inputs.ssAge,
      inputs.taxable, inputs.k401, inputs.roth, inputs.spending,
      inputs.returnPct / 100, inputs.inflationPct / 100, inputs.inflationAdj
    ), [inputs])

  const bridgeRows = rows.filter(r => r.age < 59.5)
  const totalPortfolio = (inputs.taxable + inputs.k401 + inputs.roth)
  const finalRow = rows[rows.length - 1]
  const depleted = rows.find(r => r.totalEnd <= 0)

  return (
    <section id="calculator" className="py-24 px-5 bg-navy">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <div className="flex items-center gap-3 font-mono text-[10px] tracking-[0.24em] uppercase text-gold mb-4">
            <span className="block w-6 h-px bg-gold" />
            Live Calculator
          </div>
          <h2 className="font-syne font-bold text-[clamp(28px,3.5vw,44px)] tracking-tight text-white mb-3">
            Model Your Bridge Strategy
          </h2>
          <p className="text-white/55 text-[15px] leading-relaxed max-w-xl">
            Adjust the inputs and see your year-by-year withdrawal plan update in real time.
          </p>
        </div>

        <div className="grid lg:grid-cols-[340px_1fr] gap-8">

          {/* Inputs panel */}
          <div className="bg-ink border border-white/[0.07] rounded-xl p-6 h-fit">
            <div className="font-mono text-[9px] tracking-[0.2em] uppercase text-gold mb-5">
              Your Numbers
            </div>

            {/* Timeline */}
            <div className="font-mono text-[8.5px] tracking-widest uppercase text-white/30 mb-3">
              Timeline
            </div>
            <div className="space-y-4 mb-6">
              {([
                { label: 'Current Age',      key: 'currentAge', min: 30,  max: 65,  step: 1   },
                { label: 'Retirement Age',   key: 'retireAge',  min: 40,  max: 65,  step: 1   },
                { label: 'Life Expectancy',  key: 'lifeExp',    min: 70,  max: 100, step: 1   },
                { label: 'SS Claim Age',     key: 'ssAge',      min: 62,  max: 70,  step: 1   },
              ] as const).map(({ label, key, min, max, step }) => (
                <label key={key} className="block">
                  <div className="flex justify-between mb-1.5">
                    <span className="font-mono text-[11px] text-white/50">{label}</span>
                    <span className="font-mono text-[11px] text-gold font-medium">
                      {inputs[key]}
                    </span>
                  </div>
                  <input
                    type="range" min={min} max={max} step={step}
                    value={inputs[key] as number}
                    onChange={e => set(key, +e.target.value)}
                    className="w-full accent-gold h-1 rounded-full bg-white/10 cursor-pointer"
                  />
                </label>
              ))}
            </div>

            {/* Balances */}
            <div className="font-mono text-[8.5px] tracking-widest uppercase text-white/30 mb-3">
              Account Balances
            </div>
            <div className="space-y-3 mb-6">
              {([
                { label: 'Taxable Brokerage ($)', key: 'taxable', step: 5000  },
                { label: 'Traditional 401(k) ($)', key: 'k401',   step: 10000 },
                { label: 'Roth IRA ($)',           key: 'roth',   step: 5000  },
              ] as const).map(({ label, key, step }) => (
                <label key={key} className="block">
                  <div className="font-mono text-[11px] text-white/50 mb-1">{label}</div>
                  <input
                    type="number" step={step} min={0}
                    value={inputs[key] as number}
                    onChange={e => set(key, +e.target.value)}
                    className="w-full bg-slate border border-white/[0.08] rounded px-3 py-2 font-mono text-[12px] text-white focus:border-gold/40 focus:outline-none transition-colors"
                  />
                </label>
              ))}
            </div>

            {/* Spending & rates */}
            <div className="font-mono text-[8.5px] tracking-widest uppercase text-white/30 mb-3">
              Spending & Assumptions
            </div>
            <div className="space-y-3">
              <label className="block">
                <div className="font-mono text-[11px] text-white/50 mb-1">Annual Spending ($/yr)</div>
                <input
                  type="number" step={1000} min={0}
                  value={inputs.spending}
                  onChange={e => set('spending', +e.target.value)}
                  className="w-full bg-slate border border-white/[0.08] rounded px-3 py-2 font-mono text-[12px] text-white focus:border-gold/40 focus:outline-none transition-colors"
                />
              </label>
              {([
                { label: 'Expected Return (%)', key: 'returnPct',    min: 0, max: 12, step: 0.5 },
                { label: 'Inflation (%)',        key: 'inflationPct', min: 0, max: 8,  step: 0.5 },
              ] as const).map(({ label, key, min, max, step }) => (
                <label key={key} className="block">
                  <div className="flex justify-between mb-1.5">
                    <span className="font-mono text-[11px] text-white/50">{label}</span>
                    <span className="font-mono text-[11px] text-gold">{inputs[key]}%</span>
                  </div>
                  <input
                    type="range" min={min} max={max} step={step}
                    value={inputs[key] as number}
                    onChange={e => set(key, +e.target.value)}
                    className="w-full accent-gold h-1 rounded-full bg-white/10 cursor-pointer"
                  />
                </label>
              ))}
              <label className="flex items-center gap-2.5 cursor-pointer mt-1">
                <input
                  type="checkbox"
                  checked={inputs.inflationAdj}
                  onChange={e => set('inflationAdj', e.target.checked)}
                  className="accent-gold w-4 h-4 rounded"
                />
                <span className="font-mono text-[11px] text-white/50">Inflation-adjust spending</span>
              </label>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-5">

            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Total Portfolio',    val: fmt(totalPortfolio),           sub: 'at retirement'       },
                { label: 'Bridge Duration',    val: `${bridgeRows.length} yrs`,    sub: 'until 59½ access'    },
                { label: 'Final Balance',      val: fmt(finalRow?.totalEnd ?? 0),  sub: `at age ${inputs.lifeExp}` },
                { label: 'Portfolio Status',   val: depleted ? '⚠ Depleted' : '✓ Solvent', sub: depleted ? `age ${depleted.age}` : 'through life exp.' },
              ].map(({ label, val, sub }) => (
                <div key={label} className="bg-ink border border-white/[0.07] rounded-lg p-4">
                  <div className="font-mono text-[9px] tracking-widest uppercase text-white/35 mb-2">{label}</div>
                  <div className={`font-syne font-bold text-[18px] tracking-tight leading-none mb-1 ${
                    depleted && label === 'Portfolio Status' ? 'text-red-400' : 'text-white'
                  }`}>{val}</div>
                  <div className="font-mono text-[9px] text-white/30">{sub}</div>
                </div>
              ))}
            </div>

            {/* Year-by-year table */}
            <div className="bg-ink border border-white/[0.07] rounded-xl overflow-hidden">
              <div className="px-5 py-3.5 border-b border-white/[0.06] flex items-center justify-between">
                <span className="font-mono text-[10px] tracking-widest uppercase text-white/40">
                  Year-by-Year Bridge Plan
                </span>
                <span className="font-mono text-[9px] text-white/25">
                  Showing all {rows.length} years
                </span>
              </div>
              <div className="overflow-auto max-h-[420px]">
                <table className="w-full text-left">
                  <thead className="sticky top-0 bg-slate">
                    <tr>
                      {['Year', 'Age', 'Withdrawal', 'Account', 'Taxable', '401(k)', 'Roth', 'Total'].map(h => (
                        <th key={h} className="font-mono text-[9px] tracking-wider uppercase text-white/30 px-4 py-2.5 whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => {
                      const isBridge = r.age < 59.5
                      const isSSAge  = r.age >= inputs.ssAge
                      return (
                        <tr
                          key={r.year}
                          className={`border-t border-white/[0.04] transition-colors hover:bg-white/[0.02] ${
                            i % 2 === 0 ? '' : 'bg-white/[0.01]'
                          }`}
                        >
                          <td className="font-mono text-[11px] text-white/40 px-4 py-2">{r.year}</td>
                          <td className="font-mono text-[11px] text-white/70 px-4 py-2 font-medium">{r.age}</td>
                          <td className="font-mono text-[11px] text-white/60 px-4 py-2">{fmt(r.withdrawal)}</td>
                          <td className="px-4 py-2">
                            <span className={`font-mono text-[9px] tracking-wide px-2 py-0.5 rounded border ${
                              isBridge
                                ? 'text-gold bg-gold/10 border-gold/25'
                                : 'text-teal bg-teal/10 border-teal/25'
                            }`}>
                              {r.account}
                            </span>
                          </td>
                          <td className="font-mono text-[11px] text-white/50 px-4 py-2">{fmt(r.taxableEnd)}</td>
                          <td className="font-mono text-[11px] text-white/50 px-4 py-2">{fmt(r.k401End)}</td>
                          <td className="font-mono text-[11px] text-white/50 px-4 py-2">{fmt(r.rothEnd)}</td>
                          <td className={`font-mono text-[11px] px-4 py-2 font-medium ${
                            r.totalEnd < 0 ? 'text-red-400' : 'text-white/80'
                          }`}>{fmt(r.totalEnd)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <p className="font-mono text-[10px] text-white/25 leading-relaxed">
              * This calculator is for educational purposes only and does not constitute financial advice.
              Consult a qualified financial planner before making retirement decisions.
              Returns are not guaranteed; actual results will vary.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
