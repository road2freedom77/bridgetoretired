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

// Controlled numeric field — allows clearing and typing freely
function NumericField({
  label, value, onChange, min, max, step, prefix, suffix, note
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  step?: number
  prefix?: string
  suffix?: string
  note?: string
}) {
  const [raw, setRaw] = useState(String(value))

  // Sync when external value changes (e.g. loading a scenario)
  useEffect(() => {
    setRaw(String(value))
  }, [value])

  return (
    <div className="mb-3">
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
          onChange={e => {
            const val = e.target.value
            // Allow empty, digits, one decimal point, one minus at start
            if (/^-?\d*\.?\d*$/.test(val) || val === '') {
              setRaw(val)
              const parsed = parseFloat(val)
              if (!isNaN(parsed)) onChange(parsed)
            }
          }}
          onFocus={e => {
            // Select all on focus for easy replacement
            e.target.select()
          }}
          onBlur={e => {
            const parsed = parseFloat(e.target.value)
            const clean = isNaN(parsed) ? 0 : parsed
            setRaw(String(clean))
            onChange(clean)
          }}
          className={`w-full bg-ink border border-white/[0.08] rounded-lg py-2 font-mono text-[12px] text-blue-400 font-bold outline-none focus:border-gold/40 transition-colors
            ${prefix ? 'pl-7' : 'pl-3'} ${suffix ? 'pr-8' : 'pr-3'}`}
        />
        {suffix && (
          <span className="absolute right-3 font-mono text-[11px] text-white/40 pointer-events-none">{suffix}</span>
        )}
      </div>
      {note && (
        <div className="font-mono text-[8px] text-white/20 mt-0.5">{note}</div>
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
  const set = (key: keyof PlannerInputs) => (value: any) => {
    const updated = { ...inputs, [key]: value }
    if (key === 'state' && NO_TAX_STATES.includes(value)) {
      updated.stateTaxRate = 0
    }
    onChange(updated)
  }

  const totalPortfolio = inputs.taxable + inputs.k401 + inputs.roth + inputs.cash

  return (
    <div className="bg-ink border border-white/[0.07] rounded-xl p-5 overflow-y-auto max-h-[calc(100vh-80px)]">
      <div className="font-syne font-bold text-[13px] text-white mb-4">Inputs</div>

      <Section title="Personal" />

      <NumericField
        label="Current Age"
        value={inputs.currentAge}
        onChange={set('currentAge')}
        min={18} max={80}
      />
      <NumericField
        label="Retirement Age"
        value={inputs.retireAge}
        onChange={set('retireAge')}
        min={18} max={80}
      />
      <NumericField
        label="SS Claiming Age"
        value={inputs.ssAge}
        onChange={set('ssAge')}
        min={62} max={70}
        note="62 / 67 / 70"
      />
      <NumericField
        label="Life Expectancy"
        value={inputs.lifeExpectancy}
        onChange={set('lifeExpectancy')}
        min={70} max={100}
        note="Conservative = 90–95"
      />

      <div className="mb-3">
        <label className="font-mono text-[9px] tracking-widest uppercase text-white/35 block mb-1">
          Filing Status
        </label>
        <select
          value={inputs.filingStatus}
          onChange={e => set('filingStatus')(e.target.value)}
          className="w-full bg-ink border border-white/[0.08] rounded-lg py-2 px-3 font-mono text-[12px] text-blue-400 font-bold outline-none focus:border-gold/40 transition-colors"
        >
          <option value="MFJ">MFJ</option>
          <option value="Single">Single</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="font-mono text-[9px] tracking-widest uppercase text-white/35 block mb-1">
          State
        </label>
        <select
          value={inputs.state}
          onChange={e => set('state')(e.target.value)}
          className="w-full bg-ink border border-white/[0.08] rounded-lg py-2 px-3 font-mono text-[12px] text-blue-400 font-bold outline-none focus:border-gold/40 transition-colors"
        >
          {US_STATES.map(s => (
            <option key={s} value={s}>
              {s}{NO_TAX_STATES.includes(s) ? ' (no tax)' : ''}
            </option>
          ))}
        </select>
      </div>

      {!NO_TAX_STATES.includes(inputs.state) && (
        <NumericField
          label="State Tax Rate"
          value={parseFloat((inputs.stateTaxRate * 100).toFixed(2))}
          onChange={v => set('stateTaxRate')(v / 100)}
          suffix="%"
          step={0.1}
          note="Your effective state rate"
        />
      )}

      <Section title="Portfolio Balances" />

      <NumericField label="Taxable Brokerage"      value={inputs.taxable}  onChange={set('taxable')}  prefix="$" step={1000} />
      <NumericField label="Traditional 401k / IRA" value={inputs.k401}     onChange={set('k401')}     prefix="$" step={1000} />
      <NumericField label="Roth IRA / Roth 401k"   value={inputs.roth}     onChange={set('roth')}     prefix="$" step={1000} />
      <NumericField label="Cash / Money Market"     value={inputs.cash}     onChange={set('cash')}     prefix="$" step={1000} note="Bridge buffer" />

      <div className="bg-navy/50 rounded-lg px-3 py-2 mb-3">
        <div className="font-mono text-[8px] text-white/30 mb-0.5">Total Portfolio</div>
        <div className="font-syne font-bold text-[15px] text-gold">
          ${totalPortfolio.toLocaleString()}
        </div>
      </div>

      <Section title="Spending & Income" />

      <NumericField label="Annual Spending"       value={inputs.spending}     onChange={set('spending')}     prefix="$" step={1000} />
      <NumericField
        label="Inflation Rate"
        value={parseFloat((inputs.inflation * 100).toFixed(2))}
        onChange={v => set('inflation')(v / 100)}
        suffix="%" step={0.1}
      />
      <NumericField label="Other Income (bridge)" value={inputs.otherIncome}  onChange={set('otherIncome')}  prefix="$" step={1000} note="Pension, rental, part-time" />
      <NumericField label="SS Benefit (today $)"  value={inputs.ssBenefit}    onChange={set('ssBenefit')}    prefix="$" step={1000} note="At claiming age" />

      <Section title="Assumptions" />

      <NumericField
        label="Portfolio Return"
        value={parseFloat((inputs.returnRate * 100).toFixed(2))}
        onChange={v => set('returnRate')(v / 100)}
        suffix="%" step={0.1}
      />
      <NumericField
        label="Volatility (std dev)"
        value={parseFloat((inputs.volatility * 100).toFixed(2))}
        onChange={v => set('volatility')(v / 100)}
        suffix="%" step={0.1}
        note="60/40 ≈ 10–12%"
      />
    </div>
  )
}