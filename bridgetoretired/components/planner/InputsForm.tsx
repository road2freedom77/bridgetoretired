'use client'

import { PlannerInputs } from '@/lib/planner/types'
import { useState, useEffect } from 'react'

interface Props {
  inputs: PlannerInputs
  onChange: (inputs: PlannerInputs) => void
}

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY'
]

const NO_TAX_STATES = ['AK','FL','NV','NH','SD','TN','TX','WA','WY']

interface HelpContent {
  title: string
  what: string
  tip: string
  example?: string
}

const HELP: Record<string, HelpContent> = {
  currentAge: {
    title: 'Current Age',
    what: 'Your age today. This sets the starting point for all projections.',
    tip: 'Be accurate — even one year changes your bridge length and withdrawal rate significantly.',
    example: 'If you are 49, enter 49.',
  },
  retireAge: {
    title: 'Planned Retirement Age',
    what: 'The age you plan to stop working full-time. This determines your bridge length — the gap before penalty-free 401k access at 59½.',
    tip: 'Retiring before 55 means a longer bridge and more pressure on taxable assets. Each extra year of work adds contributions and compounding.',
    example: 'Retiring at 52 = 7.5 year bridge. Retiring at 57 = 2.5 year bridge.',
  },
  ssAge: {
    title: 'Social Security Claiming Age',
    what: 'The age you plan to start collecting Social Security. You can claim as early as 62 or as late as 70.',
    tip: 'Delaying from 62 to 70 increases your benefit by roughly 76% permanently. Every year you delay past 62 adds ~8%/yr. For early retirees SS does not solve the bridge — but it dramatically reduces post-67 portfolio draws.',
    example: '62 = reduced benefit, 67 = full retirement age, 70 = maximum benefit.',
  },
  lifeExpectancy: {
    title: 'Life Expectancy (Planning Age)',
    what: 'The age you are planning your money to last to. This is not a prediction — it is a planning horizon.',
    tip: 'Use 90-95 to be conservative. If you plan to 85 and live to 92, you run out of money. The cost of planning longer is minimal; the cost of planning shorter can be catastrophic.',
    example: 'Most financial planners use 90 for healthy individuals.',
  },
  filingStatus: {
    title: 'Filing Status',
    what: 'Whether you file taxes as Married Filing Jointly (MFJ) or Single. This determines your federal tax brackets and standard deduction.',
    tip: 'MFJ gets a $30,000 standard deduction in 2026 vs $15,000 for Single. This significantly changes Roth conversion math and ACA subsidy thresholds.',
    example: 'Married couple = MFJ. Single, divorced, or widowed = Single.',
  },
  state: {
    title: 'State of Residence',
    what: 'Your state determines whether you owe state income tax on retirement withdrawals.',
    tip: '9 states have no income tax: AK, FL, NV, NH, SD, TN, TX, WA, WY. Moving to a no-tax state before retiring can save thousands per year on 401k withdrawals.',
    example: 'NY taxes retirement income at 6.85%. TX has no state income tax.',
  },
  stateTaxRate: {
    title: 'State Tax Rate',
    what: 'Your estimated effective state income tax rate on retirement withdrawals. This varies by state and income level.',
    tip: 'Use your marginal rate on ordinary income, not the top rate. Many states exempt some retirement income — check your state rules.',
    example: 'NY: ~6.85% on income over $80K. CA: 9.3% on income $66K-$338K.',
  },
  taxable: {
    title: 'Taxable Brokerage',
    what: 'Money in a regular brokerage account (Fidelity, Schwab, Vanguard) — not a 401k or IRA. This is your most flexible asset: no age restrictions, no penalties, accessible any time.',
    tip: 'This is the most important number for early retirees. The more you have here, the more bridge years you can fund without touching the 401k. Target enough to cover most of your bridge to 59½.',
    example: '$300K taxable at $50K/year spending = ~6 years of bridge coverage.',
  },
  k401: {
    title: 'Traditional 401k / IRA',
    what: 'Pre-tax retirement accounts. Contributions were tax-deductible; withdrawals are taxed as ordinary income. Penalty-free access starts at 59½ (or 55 with Rule of 55 in some cases).',
    tip: 'This is usually your largest account but your least flexible in early retirement. The goal is to leave it untouched during the bridge years so it compounds. Every year it grows tax-deferred adds significantly to your post-59½ balance.',
    example: '$600K 401k left untouched for 7 years at 6.5% grows to ~$935K.',
  },
  roth: {
    title: 'Roth IRA / Roth 401k',
    what: 'After-tax retirement accounts. Contributions can be withdrawn penalty-free at any age. Earnings are accessible penalty-free after 59½ and 5-year seasoning.',
    tip: 'Roth contributions (not earnings) are always accessible without penalty — making this a backup bridge asset. In low-income bridge years, consider converting traditional IRA to Roth at lower tax rates.',
    example: 'If you contributed $50K to Roth over the years, that $50K is accessible now regardless of age.',
  },
  cash: {
    title: 'Cash / Money Market',
    what: 'Highly liquid savings: savings accounts, money market funds, CDs, T-bills. Counted as part of your taxable bridge but earns minimal returns.',
    tip: 'Keep 1-2 years of spending in cash as a buffer. This prevents you from selling equities in a downturn early in retirement — one of the biggest sequence-of-returns risks.',
    example: '$50K spending/year → keep $50K-$100K in cash/money market.',
  },
  spending: {
    title: 'Annual Spending',
    what: 'Your expected annual spending in retirement in today\'s dollars. The planner inflates this each year using your inflation rate.',
    tip: 'Be honest here — most people underestimate retirement spending. Include healthcare premiums, travel, home maintenance, and taxes. This single number drives your withdrawal rate more than anything else.',
    example: 'Divide your target by 4% to get the portfolio needed: $50K/year needs $1.25M at 4%.',
  },
  inflation: {
    title: 'Inflation Rate',
    what: 'The annual rate at which your spending is expected to grow. Applied to spending every year of the projection.',
    tip: 'The historical average is ~3%. Using 2.5% is slightly optimistic but reasonable for conservative planning. Do not use 0% — it significantly underestimates long-term spending.',
    example: '$50K spending at 2.5% inflation = $64K in 10 years, $82K in 20 years.',
  },
  otherIncome: {
    title: 'Other Retirement Income',
    what: 'Any income during the bridge years that reduces portfolio draws: part-time work, consulting, rental income, pension, or side business.',
    tip: 'Even $15K-$20K/year in part-time income during bridge years dramatically extends how long taxable assets last and improves Monte Carlo success rates. This is the highest-leverage lever for early retirees.',
    example: '$20K/year consulting income at $50K spending = only $30K needed from portfolio.',
  },
  ssBenefit: {
    title: 'SS Benefit (Today Dollars)',
    what: 'Your estimated annual Social Security benefit at your claiming age, in today\'s dollars. The planner inflates this to match your claiming year.',
    tip: 'Check your actual estimate at ssa.gov/myaccount. If you retire early, your benefit may be lower than projected because SSA calculates based on 35 highest earning years — early retirement leaves zeros in the formula.',
    example: 'Average SS benefit in 2026: ~$22,000/yr. Max at 70: ~$58,000/yr.',
  },
  returnRate: {
    title: 'Portfolio Return',
    what: 'Expected annual nominal return on your portfolio. Used for deterministic projections in BRIDGE and POST-59½.',
    tip: 'Be conservative. Historical US stock market average is ~10% nominal but sequence risk means average returns do not equal lived experience. Use 5.5-7% for a balanced portfolio. The Monte Carlo tab stress-tests your actual inputs.',
    example: '100% stocks: use 7-8%. 60/40 stocks/bonds: use 5.5-6.5%. Conservative: use 4-5%.',
  },
  volatility: {
    title: 'Portfolio Volatility (Std Dev)',
    what: 'The standard deviation of annual returns. Used by the Monte Carlo simulator to generate realistic randomized return sequences.',
    tip: 'Higher volatility = wider range of outcomes in Monte Carlo. A 100% stock portfolio has higher volatility than a 60/40 portfolio. Do not set this too low — it will make Monte Carlo results unrealistically optimistic.',
    example: '100% stocks: ~15-17%. 60/40 portfolio: ~10-12%. 40/60: ~8-10%.',
  },
}

function HelpCard({ content }: { content: HelpContent }) {
  return (
    <div className="mt-1.5 mb-2 bg-navy border border-gold/20 rounded-lg p-3 text-[11px] animate-in fade-in slide-in-from-top-1 duration-150">
      <div className="font-mono text-[8px] tracking-widest uppercase text-gold mb-1.5">{content.title}</div>
      <p className="text-white/60 leading-relaxed mb-2">{content.what}</p>
      <div className="flex gap-1.5 items-start mb-1.5">
        <span className="text-gold shrink-0 mt-0.5">💡</span>
        <p className="text-white/45 leading-relaxed">{content.tip}</p>
      </div>
      {content.example && (
        <div className="bg-white/[0.04] rounded px-2 py-1.5 font-mono text-[9px] text-white/35">
          {content.example}
        </div>
      )}
    </div>
  )
}

function NumericField({
  label, fieldKey, value, onChange, suffix, prefix, note, activeField, onFocus
}: {
  label: string
  fieldKey: string
  value: number
  onChange: (v: number) => void
  suffix?: string
  prefix?: string
  note?: string
  activeField: string | null
  onFocus: (key: string) => void
}) {
  const [raw, setRaw] = useState(String(value))
  const isActive = activeField === fieldKey

  useEffect(() => {
    setRaw(String(value))
  }, [value])

  return (
    <div className="mb-1">
      <label className="font-mono text-[9px] tracking-widest uppercase text-white/35 block mb-1">
        {label}
      </label>
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 font-mono text-[11px] text-white/40 pointer-events-none">{prefix}</span>
        )}
        <input
          type="text"
          inputMode="decimal"
          value={raw}
          onFocus={() => {
            onFocus(fieldKey)
            setTimeout(() => (document.activeElement as HTMLInputElement)?.select(), 0)
          }}
          onChange={e => {
            const val = e.target.value
            if (/^-?\d*\.?\d*$/.test(val) || val === '') {
              setRaw(val)
              const parsed = parseFloat(val)
              if (!isNaN(parsed)) onChange(parsed)
            }
          }}
          onBlur={e => {
            const parsed = parseFloat(e.target.value)
            const clean = isNaN(parsed) ? 0 : parsed
            setRaw(String(clean))
            onChange(clean)
          }}
          className={`w-full bg-ink border rounded-lg py-2 font-mono text-[12px] text-blue-400 font-bold outline-none transition-colors
            ${isActive ? 'border-gold/40 bg-gold/[0.03]' : 'border-white/[0.08]'}
            ${prefix ? 'pl-7' : 'pl-3'} ${suffix ? 'pr-8' : 'pr-3'}`}
        />
        {suffix && (
          <span className="absolute right-3 font-mono text-[11px] text-white/40 pointer-events-none">{suffix}</span>
        )}
      </div>
      {note && !isActive && (
        <div className="font-mono text-[8px] text-white/20 mt-0.5">{note}</div>
      )}
      {isActive && HELP[fieldKey] && (
        <HelpCard content={HELP[fieldKey]} />
      )}
    </div>
  )
}

function Section({ title }: { title: string }) {
  return (
    <div className="font-mono text-[8px] tracking-widest uppercase text-gold mb-2 mt-5 pb-1 border-b border-gold/10">
      {title}
    </div>
  )
}

export default function InputsForm({ inputs, onChange }: Props) {
  const [activeField, setActiveField] = useState<string | null>(null)

  const set = (key: keyof PlannerInputs) => (value: any) => {
    const updated = { ...inputs, [key]: value }
    if (key === 'state' && NO_TAX_STATES.includes(value)) {
      updated.stateTaxRate = 0
    }
    onChange(updated)
  }

  const totalPortfolio = inputs.taxable + inputs.k401 + inputs.roth + inputs.cash

  return (
    <div
      className="bg-ink border border-white/[0.07] rounded-xl p-5 overflow-y-auto max-h-[calc(100vh-80px)]"
      onClick={e => {
        if (e.target === e.currentTarget) setActiveField(null)
      }}
    >
      <div className="font-syne font-bold text-[13px] text-white mb-4">Inputs</div>

      <Section title="Personal" />

      <NumericField label="Current Age"       fieldKey="currentAge"     value={inputs.currentAge}    onChange={set('currentAge')}    activeField={activeField} onFocus={setActiveField} />
      <NumericField label="Retirement Age"    fieldKey="retireAge"      value={inputs.retireAge}     onChange={set('retireAge')}     activeField={activeField} onFocus={setActiveField} />
      <NumericField label="SS Claiming Age"   fieldKey="ssAge"          value={inputs.ssAge}         onChange={set('ssAge')}         activeField={activeField} onFocus={setActiveField} note="62 / 67 / 70" />
      <NumericField label="Life Expectancy"   fieldKey="lifeExpectancy" value={inputs.lifeExpectancy} onChange={set('lifeExpectancy')} activeField={activeField} onFocus={setActiveField} note="Conservative = 90–95" />

      {/* Filing Status */}
      <div className="mb-1">
        <label className="font-mono text-[9px] tracking-widest uppercase text-white/35 block mb-1">Filing Status</label>
        <select
          value={inputs.filingStatus}
          onFocus={() => setActiveField('filingStatus')}
          onChange={e => set('filingStatus')(e.target.value)}
          className={`w-full bg-ink border rounded-lg py-2 px-3 font-mono text-[12px] text-blue-400 font-bold outline-none transition-colors ${activeField === 'filingStatus' ? 'border-gold/40' : 'border-white/[0.08]'}`}
        >
          <option value="MFJ">MFJ</option>
          <option value="Single">Single</option>
        </select>
        {activeField === 'filingStatus' && HELP.filingStatus && <HelpCard content={HELP.filingStatus} />}
      </div>

      {/* State */}
      <div className="mb-1">
        <label className="font-mono text-[9px] tracking-widest uppercase text-white/35 block mb-1">State</label>
        <select
          value={inputs.state}
          onFocus={() => setActiveField('state')}
          onChange={e => set('state')(e.target.value)}
          className={`w-full bg-ink border rounded-lg py-2 px-3 font-mono text-[12px] text-blue-400 font-bold outline-none transition-colors ${activeField === 'state' ? 'border-gold/40' : 'border-white/[0.08]'}`}
        >
          {US_STATES.map(s => (
            <option key={s} value={s}>{s}{NO_TAX_STATES.includes(s) ? ' (no tax)' : ''}</option>
          ))}
        </select>
        {activeField === 'state' && HELP.state && <HelpCard content={HELP.state} />}
      </div>

      {!NO_TAX_STATES.includes(inputs.state) && (
        <NumericField
          label="State Tax Rate"
          fieldKey="stateTaxRate"
          value={parseFloat((inputs.stateTaxRate * 100).toFixed(2))}
          onChange={v => set('stateTaxRate')(v / 100)}
          suffix="%" note="Your effective state rate"
          activeField={activeField} onFocus={setActiveField}
        />
      )}

      <Section title="Portfolio Balances" />

      <NumericField label="Taxable Brokerage"      fieldKey="taxable"  value={inputs.taxable}  onChange={set('taxable')}  prefix="$" activeField={activeField} onFocus={setActiveField} />
      <NumericField label="Traditional 401k / IRA" fieldKey="k401"     value={inputs.k401}     onChange={set('k401')}     prefix="$" activeField={activeField} onFocus={setActiveField} />
      <NumericField label="Roth IRA / Roth 401k"   fieldKey="roth"     value={inputs.roth}     onChange={set('roth')}     prefix="$" activeField={activeField} onFocus={setActiveField} />
      <NumericField label="Cash / Money Market"     fieldKey="cash"     value={inputs.cash}     onChange={set('cash')}     prefix="$" note="Bridge buffer" activeField={activeField} onFocus={setActiveField} />

      <div className="bg-navy/50 rounded-lg px-3 py-2 mb-3 mt-2">
        <div className="font-mono text-[8px] text-white/30 mb-0.5">Total Portfolio</div>
        <div className="font-syne font-bold text-[15px] text-gold">
          ${totalPortfolio.toLocaleString()}
        </div>
      </div>

      <Section title="Spending & Income" />

      <NumericField label="Annual Spending"       fieldKey="spending"     value={inputs.spending}     onChange={set('spending')}     prefix="$" activeField={activeField} onFocus={setActiveField} />
      <NumericField
        label="Inflation Rate"
        fieldKey="inflation"
        value={parseFloat((inputs.inflation * 100).toFixed(2))}
        onChange={v => set('inflation')(v / 100)}
        suffix="%" activeField={activeField} onFocus={setActiveField}
      />
      <NumericField label="Other Income (bridge)" fieldKey="otherIncome"  value={inputs.otherIncome}  onChange={set('otherIncome')}  prefix="$" note="Pension, rental, part-time" activeField={activeField} onFocus={setActiveField} />
      <NumericField label="SS Benefit (today $)"  fieldKey="ssBenefit"    value={inputs.ssBenefit}    onChange={set('ssBenefit')}    prefix="$" note="At claiming age" activeField={activeField} onFocus={setActiveField} />

      <Section title="Assumptions" />

      <NumericField
        label="Portfolio Return"
        fieldKey="returnRate"
        value={parseFloat((inputs.returnRate * 100).toFixed(2))}
        onChange={v => set('returnRate')(v / 100)}
        suffix="%" activeField={activeField} onFocus={setActiveField}
      />
      <NumericField
        label="Volatility (std dev)"
        fieldKey="volatility"
        value={parseFloat((inputs.volatility * 100).toFixed(2))}
        onChange={v => set('volatility')(v / 100)}
        suffix="%" note="60/40 ≈ 10–12%" activeField={activeField} onFocus={setActiveField}
      />
    </div>
  )
}