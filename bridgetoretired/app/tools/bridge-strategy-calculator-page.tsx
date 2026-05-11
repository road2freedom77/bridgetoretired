'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'

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
      if (tb >= w)      { tb -= w; acct = 'Taxable' }
      else if (tb > 0)  { const rem = w - tb; tb = 0; ro -= rem; acct = 'Taxable + Roth' }
      else              { ro -= w; acct = 'Roth' }
    } else {
      if (k >= w)       { k -= w; acct = '401(k)' }
      else if (k > 0)   { const rem = w - k; k = 0; ro -= rem; acct = '401k + Roth' }
      else              { ro -= w; acct = 'Roth' }
    }

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

const FREE_ROWS = 5

export default function BridgeStrategyCalculatorPage() {
  const { user } = useUser()
  const isPro = (user?.publicMetadata as any)?.isPro === true

  const [inputs, setInputs] = useState({
    currentAge:   45,
    retireAge:    55,
    lifeExp:      90,
    ssAge:        67,
    taxable:      300000,
    k401:         800000,
    roth:         150000,
    spending:     60000,
    returnPct:    6,
    inflationPct: 2.5,
    inflationAdj: true,
  })

  const set = (k: keyof typeof inputs, v: number | boolean) =>
    setInputs(prev => ({ ...prev, [k]: v }))

  const rows = useMemo(() =>
    calcBridge(
      inputs.currentAge, inputs.retireAge, inputs.lifeExp, inputs.ssAge,
      inputs.taxable, inputs.k401, inputs.roth, inputs.spending,
      inputs.returnPct / 100, inputs.inflationPct / 100, inputs.inflationAdj
    ), [inputs])

  const bridgeRows   = rows.filter(r => r.age < 59.5)
  const totalPortfolio = inputs.taxable + inputs.k401 + inputs.roth
  const finalRow     = rows[rows.length - 1]
  const depleted     = rows.find(r => r.totalEnd <= 0)

  const visibleRows = isPro ? rows : rows.slice(0, FREE_ROWS)
  const hiddenCount = rows.length - FREE_ROWS

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-navy border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-5 pt-12 pb-10">
          <Link href="/tools" className="font-mono text-[10px] tracking-widest uppercase text-white/30 hover:text-gold transition-colors flex items-center gap-2 mb-6">
            ← All Tools
          </Link>
          <div className="font-mono text-[9px] tracking-widest uppercase text-gold mb-3">Bridge Strategy</div>
          <h1 className="font-syne font-bold text-[clamp(26px,4vw,46px)] tracking-tight text-white leading-tight mb-3">
            Bridge Strategy Calculator
          </h1>
          <p className="text-white/50 text-[15px] leading-relaxed max-w-xl">
            Model your year-by-year withdrawal plan from retirement to age 90. See exactly how taxable, 401(k), and Roth accounts work together across your bridge years.
          </p>
        </div>
      </div>

      {/* Calculator */}
      <div className="max-w-7xl mx-auto px-5 py-12">
        <div className="grid lg:grid-cols-[340px_1fr] gap-8">

          {/* Inputs panel */}
          <div className="bg-ink border border-white/[0.07] rounded-xl p-6 h-fit">
            <div className="font-mono text-[9px] tracking-[0.2em] uppercase text-gold mb-5">
              Your Numbers
            </div>

            <div className="font-mono text-[8.5px] tracking-widest uppercase text-white/30 mb-3">Timeline</div>
            <div className="space-y-4 mb-6">
              {([
                { label: 'Current Age',     key: 'currentAge', min: 30,  max: 65,  step: 1 },
                { label: 'Retirement Age',  key: 'retireAge',  min: 40,  max: 65,  step: 1 },
                { label: 'Life Expectancy', key: 'lifeExp',    min: 70,  max: 100, step: 1 },
                { label: 'SS Claim Age',    key: 'ssAge',      min: 62,  max: 70,  step: 1 },
              ] as const).map(({ label, key, min, max, step }) => (
                <label key={key} className="block">
                  <div className="flex justify-between mb-1.5">
                    <span className="font-mono text-[11px] text-white/50">{label}</span>
                    <span className="font-mono text-[11px] text-gold font-medium">{inputs[key]}</span>
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

            <div className="font-mono text-[8.5px] tracking-widest uppercase text-white/30 mb-3">Account Balances</div>
            <div className="space-y-3 mb-6">
              {([
                { label: 'Taxable Brokerage ($)',  key: 'taxable', step: 5000  },
                { label: 'Traditional 401(k) ($)', key: 'k401',    step: 10000 },
                { label: 'Roth IRA ($)',           key: 'roth',    step: 5000  },
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

            <div className="font-mono text-[8.5px] tracking-widest uppercase text-white/30 mb-3">Spending & Assumptions</div>
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
            {/* KPI cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Total Portfolio',  val: fmt(totalPortfolio),          sub: 'at retirement'            },
                { label: 'Bridge Duration',  val: `${bridgeRows.length} yrs`,   sub: 'until 59½ access'         },
                { label: 'Final Balance',    val: fmt(finalRow?.totalEnd ?? 0), sub: `at age ${inputs.lifeExp}` },
                { label: 'Portfolio Status', val: depleted ? '⚠ Depleted' : '✓ Solvent',
                  sub: depleted ? `age ${depleted.age}` : 'through life exp.' },
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
                  {isPro ? `Showing all ${rows.length} years` : `Showing ${FREE_ROWS} of ${rows.length} years`}
                </span>
              </div>
              <div className="overflow-auto max-h-[420px]">
                <table className="w-full text-left">
                  <thead className="sticky top-0 bg-slate">
                    <tr>
                      {['Year','Age','Withdrawal','Account','Taxable','401(k)','Roth','Total'].map(h => (
                        <th key={h} className="font-mono text-[9px] tracking-wider uppercase text-white/30 px-4 py-2.5 whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {visibleRows.map((r, i) => {
                      const isBridge = r.age < 59.5
                      return (
                        <tr key={r.year} className={`border-t border-white/[0.04] transition-colors hover:bg-white/[0.02] ${i % 2 === 0 ? '' : 'bg-white/[0.01]'}`}>
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
                          <td className={`font-mono text-[11px] px-4 py-2 font-medium ${r.totalEnd < 0 ? 'text-red-400' : 'text-white/80'}`}>
                            {fmt(r.totalEnd)}
                          </td>
                        </tr>
                      )
                    })}

                    {/* Pro gate row */}
                    {!isPro && (
                      <tr className="border-t border-gold/20">
                        <td colSpan={8} className="px-5 py-5">
                          <div className="flex items-center justify-between gap-4 bg-gold/5 border border-gold/20 rounded-lg px-5 py-4">
                            <div>
                              <div className="font-mono text-[9px] tracking-widest uppercase text-gold mb-1">⚡ Pro</div>
                              <div className="font-syne font-semibold text-[14px] text-white mb-0.5">
                                See all {hiddenCount} remaining years
                              </div>
                              <div className="font-mono text-[10px] text-white/35">
                                Years {inputs.retireAge + FREE_ROWS}–{inputs.lifeExp} · Full retirement timeline · Bridge Risk Score
                              </div>
                            </div>
                            <Link
                              href="/pricing"
                              className="shrink-0 bg-gold text-black font-syne font-semibold text-[12px] px-5 py-2.5 rounded hover:opacity-85 transition-opacity whitespace-nowrap"
                            >
                              Unlock Pro →
                            </Link>
                          </div>
                        </td>
                      </tr>
                    )}
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

        {/* SEO content */}
        <div className="mt-16 max-w-3xl">
          <h2 className="font-syne font-bold text-[24px] tracking-tight text-white mb-4">
            How to Use This Calculator
          </h2>
          <div className="space-y-4 text-white/55 text-[14px] leading-[1.8]">
            <p>
              The Bridge Strategy Calculator models how your taxable brokerage, 401(k)/IRA, and Roth accounts work together from your retirement date to your life expectancy. It shows you which account to draw from each year and what your ending balances look like across your full retirement horizon.
            </p>
            <p>
              During the <strong className="text-white/80">bridge years</strong> — from your retirement age until 59½ — the calculator draws from your taxable brokerage first, leaving your 401(k) untouched to compound. After 59½, it switches to drawing from your 401(k). Social Security income reduces the required portfolio withdrawal after your claimed age.
            </p>
            <p>
              The <strong className="text-white/80">Portfolio Status</strong> indicator tells you whether your portfolio survives to your life expectancy. If it shows "Depleted," try reducing annual spending, increasing expected return assumptions, or delaying retirement age by a year or two — small changes often have large effects on portfolio longevity.
            </p>
            <p>
              The <strong className="text-white/80">Bridge Duration</strong> is the number of years between your retirement age and 59½ — the window where account access is most constrained. For someone retiring at 50, that's 9.5 years. For someone retiring at 55, it's 4.5 years. The taxable brokerage balance needs to cover this gap.
            </p>
          </div>

          <h2 className="font-syne font-bold text-[24px] tracking-tight text-white mt-10 mb-4">
            Common Scenarios
          </h2>
          <div className="space-y-4 text-white/55 text-[14px] leading-[1.8]">
            <p>
              <strong className="text-white/80">Retiring at 55 with $1M:</strong> A common FIRE milestone. With $300K taxable, $600K in 401(k), and $100K Roth at $50K spending, most portfolios remain solvent to age 90 at a 6% return. The 4.5-year bridge is manageable if taxable covers the gap.
            </p>
            <p>
              <strong className="text-white/80">Retiring at 50 with limited taxable:</strong> If most savings are in a 401(k), the 9.5-year bridge before 59½ creates a funding gap. In this case, consider modeling a <Link href="/blog/rule-72t-sepp-guide" className="text-gold hover:text-gold/80 transition-colors">72(t) SEPP structure</Link> as a supplement.
            </p>
            <p>
              <strong className="text-white/80">High spending scenario:</strong> At $80K+ annual spending, most $1M portfolios show depletion risk by age 80-85. The fix is usually a combination of reducing early spending, delaying Social Security to 70, or building a larger taxable brokerage before retiring.
            </p>
          </div>

          <h2 className="font-syne font-bold text-[24px] tracking-tight text-white mt-10 mb-4">
            Related Tools and Guides
          </h2>
          <div className="grid sm:grid-cols-2 gap-3 mt-4">
            {[
              { href: '/tools/72t-sepp-calculator',               label: '72(t) SEPP Calculator' },
              { href: '/tools/withdrawal-order-optimizer',         label: 'Withdrawal Order Optimizer' },
              { href: '/blog/what-is-retirement-bridge-strategy',  label: 'Bridge Strategy Guide' },
              { href: '/blog/how-much-taxable-brokerage-to-retire-early', label: 'How Much Taxable Do I Need?' },
              { href: '/blog/rule-72t-sepp-guide',                label: 'Rule 72(t) Explained' },
              { href: '/blog/withdrawal-order-taxable-roth-401k', label: 'Withdrawal Order Guide' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 bg-ink border border-white/[0.07] rounded-lg px-4 py-3 hover:border-gold/20 transition-colors group"
              >
                <span className="font-mono text-[11px] text-white/50 group-hover:text-gold/80 transition-colors">{label} →</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}