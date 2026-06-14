'use client'

import { PlannerInputs, PlannerResults } from '@/lib/planner/types'
import { calcTaxEstimate } from '@/lib/planner/taxEstimate'

interface Props {
  results: PlannerResults
  inputs: PlannerInputs
}

function fmt(n: number) {
  return '$' + Math.round(n).toLocaleString()
}

function fmtPct(n: number) {
  return (n * 100).toFixed(1) + '%'
}

export default function TaxEstimateTab({ results, inputs }: Props) {
  const taxYears = calcTaxEstimate(inputs, results.bridgeYears)

  if (taxYears.length === 0) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-center">
          <div className="text-3xl mb-3">✓</div>
          <div className="font-syne font-semibold text-white text-[16px] mb-2">
            No bridge — no tax estimate needed
          </div>
          <div className="font-mono text-[11px] text-white/35">
            Retiring at or after 59½ — standard post-retirement tax planning applies
          </div>
        </div>
      </div>
    )
  }

  const totalFederal = taxYears.reduce((s, y) => s + y.federalTax, 0)
  const totalState = taxYears.reduce((s, y) => s + y.stateTax, 0)
  const totalTax = taxYears.reduce((s, y) => s + y.totalTax, 0)
  const totalIncome = taxYears.reduce((s, y) => s + y.grossIncome, 0)
  const overallRate = totalIncome > 0 ? totalTax / totalIncome : 0

  const stdDeduction = inputs.filingStatus === 'MFJ' ? 30000 : 15000

  return (
    <div>
      <div className="font-mono text-[9px] tracking-widest uppercase text-white/25 mb-2">
        2026 {inputs.filingStatus === 'MFJ' ? 'Married Filing Jointly' : 'Single'} brackets
        · ${stdDeduction.toLocaleString()} standard deduction
        · {inputs.state} state tax {(inputs.stateTaxRate * 100).toFixed(1)}%
      </div>
      <div className="font-mono text-[9px] tracking-widest uppercase text-white/20 mb-6">
        Income = 401k draws + Roth draws. Does not include Roth conversion optimization.
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Federal Tax', value: fmt(totalFederal), color: 'text-red-400' },
          { label: 'Total State Tax', value: fmt(totalState), color: 'text-orange-400' },
          { label: 'Total Tax Burden', value: fmt(totalTax), color: 'text-red-400' },
          { label: 'Overall Effective Rate', value: fmtPct(overallRate), color: overallRate < 0.15 ? 'text-green-400' : overallRate < 0.25 ? 'text-amber-400' : 'text-red-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-navy/50 border border-white/[0.06] rounded-xl p-4">
            <div className="font-mono text-[8px] tracking-widest uppercase text-white/25 mb-2">{label}</div>
            <div className={`font-syne font-bold text-[18px] ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      {/* Year by year table */}
      <div className="overflow-x-auto">
        <table className="w-full text-[11px]">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {['Year', 'Age', 'Gross Income', 'Std Deduction', 'Taxable Income', 'Federal Tax', 'State Tax', 'Total Tax', 'Eff. Rate'].map(h => (
                <th key={h} className="font-mono text-[9px] tracking-widest uppercase text-gold/70 text-right first:text-left py-2 px-2 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {taxYears.map((y, i) => {
              const isHighTax = y.effectiveRate > 0.25
              const isMedTax = y.effectiveRate > 0.15 && y.effectiveRate <= 0.25
              return (
                <tr
                  key={i}
                  className={`border-b border-white/[0.04] ${
                    isHighTax ? 'bg-red-950/20' :
                    isMedTax ? 'bg-amber-950/10' :
                    i % 2 === 0 ? 'bg-white/[0.01]' : ''
                  }`}
                >
                  <td className="py-2 px-2 font-mono text-white/50">{y.year}</td>
                  <td className="py-2 px-2 font-mono text-white/50 text-right">{y.age}</td>
                  <td className="py-2 px-2 font-mono text-white/70 text-right">{fmt(y.grossIncome)}</td>
                  <td className="py-2 px-2 font-mono text-white/40 text-right">{fmt(y.stdDeduction)}</td>
                  <td className="py-2 px-2 font-mono text-white/70 text-right">{fmt(y.taxableIncome)}</td>
                  <td className="py-2 px-2 font-mono text-red-400 text-right">{fmt(y.federalTax)}</td>
                  <td className="py-2 px-2 font-mono text-orange-400 text-right">{fmt(y.stateTax)}</td>
                  <td className="py-2 px-2 font-mono text-red-400 font-bold text-right">{fmt(y.totalTax)}</td>
                  <td className={`py-2 px-2 font-mono font-bold text-right ${
                    y.effectiveRate > 0.25 ? 'text-red-400' :
                    y.effectiveRate > 0.15 ? 'text-amber-400' :
                    'text-green-400'
                  }`}>
                    {fmtPct(y.effectiveRate)}
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr className="border-t border-gold/20 bg-gold/5">
              <td colSpan={2} className="py-2 px-2 font-mono text-[9px] tracking-widest uppercase text-gold">
                Total →
              </td>
              <td className="py-2 px-2 font-mono text-white/70 font-bold text-right">{fmt(totalIncome)}</td>
              <td className="py-2 px-2" />
              <td className="py-2 px-2" />
              <td className="py-2 px-2 font-mono text-red-400 font-bold text-right">{fmt(totalFederal)}</td>
              <td className="py-2 px-2 font-mono text-orange-400 font-bold text-right">{fmt(totalState)}</td>
              <td className="py-2 px-2 font-mono text-red-400 font-bold text-right">{fmt(totalTax)}</td>
              <td className={`py-2 px-2 font-mono font-bold text-right ${
                overallRate > 0.25 ? 'text-red-400' :
                overallRate > 0.15 ? 'text-amber-400' :
                'text-green-400'
              }`}>
                {fmtPct(overallRate)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Bracket reference */}
      <div className="mt-6 bg-navy/30 border border-white/[0.06] rounded-xl p-4">
        <div className="font-mono text-[9px] tracking-widest uppercase text-white/25 mb-3">
          2026 {inputs.filingStatus} Federal Brackets
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {(inputs.filingStatus === 'MFJ' ? [
            { rate: '10%', range: '$0 – $23,850' },
            { rate: '12%', range: '$23,850 – $96,950' },
            { rate: '22%', range: '$96,950 – $206,700' },
            { rate: '24%', range: '$206,700 – $394,600' },
          ] : [
            { rate: '10%', range: '$0 – $11,925' },
            { rate: '12%', range: '$11,925 – $48,475' },
            { rate: '22%', range: '$48,475 – $103,350' },
            { rate: '24%', range: '$103,350 – $197,300' },
          ]).map(({ rate, range }) => (
            <div key={rate} className="bg-black/20 rounded-lg p-3">
              <div className="font-syne font-bold text-gold text-[13px] mb-0.5">{rate}</div>
              <div className="font-mono text-[9px] text-white/35">{range}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 font-mono text-[9px] text-white/20 leading-relaxed">
        Federal tax calculated using 2026 progressive brackets. State tax applied as flat rate on taxable income.
        Does not account for capital gains rates on taxable brokerage draws, qualified dividends, or itemized deductions.
        Consult a tax advisor for your specific situation.
      </div>
    </div>
  )
}