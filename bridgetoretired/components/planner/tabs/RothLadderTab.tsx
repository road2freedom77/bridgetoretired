'use client'

import { PlannerInputs, PlannerResults } from '@/lib/planner/types'
import { calcRothLadder } from '@/lib/planner/rothLadder'

interface Props {
  results: PlannerResults
  inputs: PlannerInputs
}

function fmt(n: number) {
  return '$' + Math.round(n).toLocaleString()
}

export default function RothLadderTab({ results, inputs }: Props) {
  const ladderYears = calcRothLadder(inputs, results.bridgeYears)

  if (ladderYears.length === 0) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-center">
          <div className="text-3xl mb-3">✓</div>
          <div className="font-syne font-semibold text-white text-[16px] mb-2">
            No bridge — no Roth ladder needed
          </div>
          <div className="font-mono text-[11px] text-white/35">
            Retiring at or after 59½ — all accounts accessible without penalty
          </div>
        </div>
      </div>
    )
  }

  const totalConversions = ladderYears.reduce((s, y) => s + y.suggestedConversion, 0)
  const totalTax = ladderYears.reduce((s, y) => s + y.taxOnConversion, 0)
  const acaWarnings = ladderYears.filter(y => y.acaStatus === 'over').length
  const acaCliff = inputs.filingStatus === 'MFJ' ? 81760 : 51760

  return (
    <div>
      {/* Header */}
      <div className="font-mono text-[9px] tracking-widest uppercase text-white/25 mb-1">
        Suggested conversions fill remaining 12% bracket space each bridge year
      </div>
      <div className="font-mono text-[9px] tracking-widest uppercase text-white/20 mb-6">
        ACA cliff: est. ${acaCliff.toLocaleString()} MAGI for {inputs.filingStatus} ({inputs.state}) · Each rung unlocks penalty-free after 5 years
      </div>

      {/* ACA warning banner */}
      {acaWarnings > 0 && (
        <div className="bg-amber-950/40 border border-amber-500/20 rounded-xl px-4 py-3 mb-6 flex items-start gap-3">
          <span className="text-amber-400 shrink-0 mt-0.5">⚠</span>
          <div>
            <div className="font-mono text-[9px] tracking-widest uppercase text-amber-400 mb-1">
              ACA Cliff Warning — {acaWarnings} year{acaWarnings > 1 ? 's' : ''} flagged
            </div>
            <div className="text-white/50 text-[12px] leading-relaxed">
              Suggested conversions in flagged years may push MAGI above the estimated 400% FPL threshold,
              which could reduce or eliminate ACA premium tax credits. The suggestion is capped at
              ACA-safe amounts — overwrite to convert more and the flag will update.
            </div>
          </div>
        </div>
      )}

      {/* Summary KPIs */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Total Suggested Conversions', value: fmt(totalConversions), color: 'text-teal-400' },
          { label: 'Tax on Conversions (12%)', value: fmt(totalTax), color: 'text-amber-400' },
          { label: 'ACA Years Flagged', value: `${acaWarnings} / ${ladderYears.length}`, color: acaWarnings > 0 ? 'text-amber-400' : 'text-green-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-navy/50 border border-white/[0.06] rounded-xl p-4">
            <div className="font-mono text-[8px] tracking-widest uppercase text-white/25 mb-2">{label}</div>
            <div className={`font-syne font-bold text-[18px] ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      {/* Year by year table */}
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-[11px]">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {['Year', 'Age', '12% Space Left', 'Suggested Conv.', 'Tax (12%)', 'MAGI', 'ACA Check', 'Unlocks'].map(h => (
                <th key={h} className="font-mono text-[9px] tracking-widest uppercase text-gold/70 text-right first:text-left py-2 px-2 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ladderYears.map((y, i) => (
              <tr
                key={i}
                className={`border-b border-white/[0.04] ${
                  y.acaStatus === 'over' ? 'bg-amber-950/20' :
                  i % 2 === 0 ? 'bg-white/[0.01]' : ''
                }`}
              >
                <td className="py-2 px-2 font-mono text-white/50">{y.year}</td>
                <td className="py-2 px-2 font-mono text-white/50 text-right">{y.age}</td>
                <td className="py-2 px-2 font-mono text-teal-400 text-right">{fmt(y.bracketSpaceLeft)}</td>
                <td className="py-2 px-2 font-mono text-teal-400 font-bold text-right">{fmt(y.suggestedConversion)}</td>
                <td className="py-2 px-2 font-mono text-amber-400 text-right">{fmt(y.taxOnConversion)}</td>
                <td className="py-2 px-2 font-mono text-white/60 text-right">{fmt(y.magi)}</td>
                <td className={`py-2 px-2 font-mono font-bold text-right ${
                  y.acaStatus === 'over' ? 'text-amber-400' : 'text-green-400'
                }`}>
                  {y.acaStatus === 'over' ? '⚠ OVER CLIFF' : '✓ Under cliff'}
                </td>
                <td className="py-2 px-2 font-mono text-white/35 text-right">{y.unlocksYear}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-gold/20 bg-gold/5">
              <td colSpan={2} className="py-2 px-2 font-mono text-[9px] tracking-widest uppercase text-gold">
                Total →
              </td>
              <td className="py-2 px-2" />
              <td className="py-2 px-2 font-mono text-teal-400 font-bold text-right">{fmt(totalConversions)}</td>
              <td className="py-2 px-2 font-mono text-amber-400 font-bold text-right">{fmt(totalTax)}</td>
              <td colSpan={3} />
            </tr>
          </tfoot>
        </table>
      </div>

      {/* How to use this */}
      <div className="bg-navy/30 border border-white/[0.06] rounded-xl p-5">
        <div className="font-mono text-[9px] tracking-widest uppercase text-white/25 mb-3">
          How to use the Roth Ladder
        </div>
        <div className="space-y-2 text-[12px] text-white/45 leading-relaxed">
          <p>
            <span className="text-teal-400 font-semibold">Suggested conversions</span> fill your remaining
            12% bracket space each year — converting traditional IRA/401k to Roth at the lowest possible tax rate
            during low-income bridge years.
          </p>
          <p>
            <span className="text-amber-400 font-semibold">The 5-year rule</span> means each conversion must
            season for 5 years before earnings are penalty-free. A 2029 conversion unlocks in 2034.
            Roth contributions (not conversions) are always accessible.
          </p>
          <p>
            <span className="text-amber-400 font-semibold">ACA cliff</span> — if your MAGI exceeds the
            estimated 400% FPL threshold, you may lose premium tax credits on your health insurance.
            The suggested conversion is already capped at the ACA-safe amount for {inputs.filingStatus} filers in {inputs.state}.
          </p>
        </div>
      </div>

      <div className="mt-4 font-mono text-[9px] text-white/20 leading-relaxed">
        ACA cliff based on estimated 400% FPL for {inputs.filingStatus} household (2026). Actual threshold varies by
        household size and Marketplace rules. Consult a tax advisor before executing conversions.
      </div>
    </div>
  )
}