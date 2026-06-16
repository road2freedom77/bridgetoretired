'use client'

import { PlannerInputs, PlannerResults } from '@/lib/planner/types'

interface Props {
  results: PlannerResults
  inputs: PlannerInputs
}

function fmt(n: number) {
  return '$' + Math.round(n).toLocaleString()
}

export default function Post595Tab({ results, inputs }: Props) {
  const { post595Years } = results

  if (post595Years.length === 0) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-center">
          <div className="text-3xl mb-3">📊</div>
          <div className="font-syne font-semibold text-white text-[16px] mb-2">
            No projection available
          </div>
          <div className="font-mono text-[11px] text-white/35">
            Check your inputs and try again
          </div>
        </div>
      </div>
    )
  }

  const lastYear = post595Years[post595Years.length - 1]
  const finalBalance = lastYear.portfolioBalance + lastYear.rothBalance
  const ssStartYear = post595Years.find(y => y.ssIncome > 0)
  const totalSS = post595Years.reduce((s, y) => s + y.ssIncome, 0)
  const totalWithdrawals = post595Years.reduce((s, y) => s + y.netWithdrawal, 0)

  return (
    <div>
      <div className="font-mono text-[9px] tracking-widest uppercase text-white/25 mb-1">
        401k draws first · Roth preserved · SS income reduces withdrawals from claiming age
      </div>
      <div className="font-mono text-[9px] tracking-widest uppercase text-white/20 mb-6">
        SS claiming age {inputs.ssAge} · Life expectancy {inputs.lifeExpectancy}
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          {
            label: 'Balance at Life Expectancy',
            value: fmt(finalBalance),
            color: finalBalance > 0 ? 'text-green-400' : 'text-red-400',
            sub: finalBalance > 0 ? `Age ${inputs.lifeExpectancy} — funded` : 'Depletes before target',
          },
          {
            label: 'Total SS Income',
            value: fmt(totalSS),
            color: 'text-green-400',
            sub: ssStartYear ? `Starts age ${Math.floor(ssStartYear.age)}` : 'Not yet claiming',
          },
          {
            label: 'Total Portfolio Withdrawals',
            value: fmt(totalWithdrawals),
            color: 'text-white',
            sub: 'After SS income offset',
          },
          {
            label: 'Roth Balance at 90',
            value: fmt(lastYear.rothBalance),
            color: 'text-teal-400',
            sub: 'Preserved for heirs or late spending',
          },
        ].map(({ label, value, color, sub }) => (
          <div key={label} className="bg-navy/50 border border-white/[0.06] rounded-xl p-4">
            <div className="font-mono text-[8px] tracking-widest uppercase text-white/25 mb-2">{label}</div>
            <div className={`font-syne font-bold text-[16px] mb-1 ${color}`}>{value}</div>
            <div className="font-mono text-[9px] text-white/30">{sub}</div>
          </div>
        ))}
      </div>

      {/* Year by year table */}
      <div className="overflow-x-auto">
        <table className="w-full text-[11px]">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {['Year', 'Age', 'Spending', 'SS Income', 'Net Withdrawal', 'Portfolio Bal.', 'Roth Bal.', 'Total'].map(h => (
                <th key={h} className="font-mono text-[9px] tracking-widest uppercase text-gold/70 text-right first:text-left py-2 px-2 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {post595Years.map((y, i) => {
              const total = y.portfolioBalance + y.rothBalance
              const isSSYear = y.ssIncome > 0
              const isDepleted = total === 0
              return (
                <tr
                  key={i}
                  className={`border-b border-white/[0.04] ${
                    isDepleted ? 'bg-red-950/20' :
                    isSSYear && i === post595Years.findIndex(yr => yr.ssIncome > 0) ? 'bg-green-950/20' :
                    i % 2 === 0 ? 'bg-white/[0.01]' : ''
                  }`}
                >
                  <td className="py-2 px-2 font-mono text-white/50">{y.year}</td>
                  <td className="py-2 px-2 font-mono text-white/50 text-right">{Math.floor(y.age)}</td>
                  <td className="py-2 px-2 font-mono text-white/60 text-right">{fmt(y.spending)}</td>
                  <td className={`py-2 px-2 font-mono text-right ${y.ssIncome > 0 ? 'text-green-400 font-bold' : 'text-white/20'}`}>
                    {y.ssIncome > 0 ? fmt(y.ssIncome) : '—'}
                  </td>
                  <td className="py-2 px-2 font-mono text-white/70 text-right">{fmt(y.netWithdrawal)}</td>
                  <td className={`py-2 px-2 font-mono text-right ${isDepleted ? 'text-red-400' : 'text-white/70'}`}>
                    {fmt(y.portfolioBalance)}
                  </td>
                  <td className="py-2 px-2 font-mono text-teal-400 text-right">{fmt(y.rothBalance)}</td>
                  <td className={`py-2 px-2 font-mono font-bold text-right ${
                    isDepleted ? 'text-red-400' :
                    total > 1000000 ? 'text-green-400' :
                    'text-white'
                  }`}>
                    {fmt(total)}
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr className="border-t border-gold/20 bg-gold/5">
              <td colSpan={2} className="py-2 px-2 font-mono text-[9px] tracking-widest uppercase text-gold">
                At Age {inputs.lifeExpectancy} →
              </td>
              <td className="py-2 px-2" />
              <td className="py-2 px-2 font-mono text-green-400 font-bold text-right">{fmt(totalSS)}</td>
              <td className="py-2 px-2 font-mono text-white/70 font-bold text-right">{fmt(totalWithdrawals)}</td>
              <td className="py-2 px-2 font-mono font-bold text-right" style={{ color: finalBalance > 0 ? '#4ADE80' : '#F87171' }}>
                {fmt(lastYear.portfolioBalance)}
              </td>
              <td className="py-2 px-2 font-mono text-teal-400 font-bold text-right">{fmt(lastYear.rothBalance)}</td>
              <td className="py-2 px-2 font-mono font-bold text-right" style={{ color: finalBalance > 0 ? '#4ADE80' : '#F87171' }}>
                {fmt(finalBalance)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="mt-4 font-mono text-[9px] text-white/20 leading-relaxed">
        Portfolio balance = taxable + 401k combined. Roth preserved separately.
        SS income inflated at {(inputs.inflation * 100).toFixed(1)}%/yr from first projection year.
        Returns assumed at {(inputs.returnRate * 100).toFixed(1)}% annually — see Monte Carlo for sequence risk analysis.
      </div>
    </div>
  )
}