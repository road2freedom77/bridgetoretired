'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ProNav } from '@/components/ProNav'

interface ReportInputs {
  name:           string
  preparedFor:    string
  date:           string
  currentAge:     number
  retireAge:      number
  lifeExpectancy: number
  portfolio:      number
  taxable:        number
  rothIRA:        number
  trad401k:       number
  annualSpending: number
  healthcareCost: number
  inflationRate:  number
  returnRate:     number
  ssAge:          number
  ssIncome:       number
  partTimeIncome: number
  partTimeYears:  number
  notes:          string
}

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${Math.round(n / 1000).toLocaleString()}k`
  return `$${Math.round(n).toLocaleString()}`
}

function fmtFull(n: number) {
  return `$${Math.round(n).toLocaleString()}`
}

function runProjection(inputs: ReportInputs) {
  const bridgeYears = Math.max(0, 59.5 - inputs.retireAge)
  const withdrawalRate = (inputs.annualSpending + inputs.healthcareCost) / inputs.portfolio * 100
  let taxable = inputs.taxable
  let other   = inputs.portfolio - inputs.taxable
  let depleted: number | null = null
  const yearData: { age: number; spending: number; income: number; withdrawal: number; total: number }[] = []

  for (let i = 0; i < inputs.lifeExpectancy - inputs.retireAge; i++) {
    const age = inputs.retireAge + i
    const isBridge = age < 59.5
    const spending = (inputs.annualSpending + inputs.healthcareCost) * Math.pow(1 + inputs.inflationRate / 100, i)
    let income = 0
    if (i < inputs.partTimeYears) income += inputs.partTimeIncome
    if (age >= inputs.ssAge) income += inputs.ssIncome * Math.pow(1 + inputs.inflationRate / 100, age - inputs.ssAge)
    const needed = Math.max(0, spending - income)
    const fromTaxable = Math.min(needed, taxable)
    taxable = Math.max(0, taxable - fromTaxable)
    if (!isBridge) other = Math.max(0, other - (needed - fromTaxable))
    taxable = Math.max(0, taxable * (1 + inputs.returnRate / 100))
    other   = Math.max(0, other   * (1 + inputs.returnRate / 100))
    const total = taxable + other
    if (total <= 0 && depleted === null) depleted = Math.floor(age)
    yearData.push({ age: Math.floor(age), spending: Math.round(spending), income: Math.round(income), withdrawal: Math.round(needed), total: Math.round(Math.max(0, total)) })
  }

  const at80 = yearData.find(d => d.age === 80)?.total ?? 0
  const at90 = yearData.find(d => d.age === 90)?.total ?? 0
  return { bridgeYears, withdrawalRate, depleted, funded: depleted === null, at80, at90, yearData }
}

function generatePrintHTML(inputs: ReportInputs): string {
  const r = runProjection(inputs)
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  const riskColor = (wr: number) => wr > 4 ? '#dc2626' : wr > 3.5 ? '#d97706' : '#16a34a'
  const fundedColor = r.funded ? '#16a34a' : '#dc2626'

  const tableRows = r.yearData.slice(0, 30).map(d => `
    <tr style="border-bottom:1px solid #e5e7eb">
      <td style="padding:6px 10px;font-size:12px;color:#374151">${d.age}</td>
      <td style="padding:6px 10px;font-size:12px;color:#374151;text-align:right">${fmtFull(d.spending)}</td>
      <td style="padding:6px 10px;font-size:12px;color:#16a34a;text-align:right">${d.income > 0 ? fmtFull(d.income) : '—'}</td>
      <td style="padding:6px 10px;font-size:12px;color:#dc2626;text-align:right">${fmtFull(d.withdrawal)}</td>
      <td style="padding:6px 10px;font-size:12px;font-weight:600;color:${d.total < inputs.portfolio * 0.4 ? '#dc2626' : '#111827'};text-align:right">${fmtFull(d.total)}</td>
    </tr>
  `).join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Retirement Bridge Plan — ${inputs.preparedFor || 'Personal'}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; color: #111827; background: white; }
  @media print {
    body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    .no-print { display: none !important; }
    .page-break { page-break-before: always; }
  }
  .page { max-width: 800px; margin: 0 auto; padding: 40px; }
  h1 { font-size: 28px; font-weight: 800; color: #0d1420; }
  h2 { font-size: 16px; font-weight: 700; color: #0d1420; margin-bottom: 12px; }
  h3 { font-size: 13px; font-weight: 700; color: #374151; margin-bottom: 8px; }
  p  { font-size: 13px; color: #6b7280; line-height: 1.6; }
  .gold { color: #b45309; }
  .header { background: #0d1420; color: white; padding: 32px 40px; margin: -40px -40px 32px; }
  .header-sub { font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; color: #9ca3af; margin-bottom: 8px; }
  .header h1 { color: white; font-size: 26px; margin-bottom: 4px; }
  .header-meta { font-size: 12px; color: #9ca3af; margin-top: 12px; display: flex; gap: 24px; }
  .accent-bar { height: 3px; background: #e8b84b; margin: 20px 0 28px; }
  .metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
  .metric-card { border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px; text-align: center; }
  .metric-value { font-size: 22px; font-weight: 800; margin-bottom: 4px; }
  .metric-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #9ca3af; }
  .section { margin-bottom: 32px; }
  .section-title { font-size: 11px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: #9ca3af; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 16px; }
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
  .three-col { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  .data-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-size: 13px; }
  .data-label { color: #6b7280; }
  .data-value { font-weight: 600; color: #111827; }
  table { width: 100%; border-collapse: collapse; }
  thead tr { background: #0d1420; }
  thead th { padding: 10px; font-size: 11px; font-weight: 700; color: white; text-align: left; letter-spacing: 0.05em; text-transform: uppercase; }
  thead th:not(:first-child) { text-align: right; }
  tbody tr:nth-child(even) { background: #f9fafb; }
  .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; }
  .status-ok   { background: #dcfce7; color: #16a34a; }
  .status-warn { background: #fef3c7; color: #d97706; }
  .status-bad  { background: #fee2e2; color: #dc2626; }
  .risk-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .risk-item { border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; display: flex; align-items: flex-start; gap: 10px; }
  .risk-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; margin-top: 4px; }
  .footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 10px; color: #9ca3af; display: flex; justify-content: space-between; }
  .notes-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; font-size: 13px; color: #374151; line-height: 1.7; white-space: pre-wrap; }
  .print-btn { position: fixed; bottom: 24px; right: 24px; background: #e8b84b; color: #111; padding: 12px 24px; border: none; border-radius: 8px; font-weight: 700; font-size: 14px; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 100; }
</style>
</head>
<body>
<button class="no-print print-btn" onclick="window.print()">⬇ Save as PDF</button>
<div class="page">

  <!-- HEADER -->
  <div class="header">
    <div class="header-sub">BridgeToRetired Pro · Retirement Plan</div>
    <h1>Retirement Bridge Analysis</h1>
    ${inputs.preparedFor ? `<div style="font-size:15px;color:#d1d5db;margin-top:6px">Prepared for: <strong style="color:white">${inputs.preparedFor}</strong></div>` : ''}
    <div class="header-meta">
      <span>Generated: ${today}</span>
      <span>Age: ${inputs.currentAge}</span>
      <span>Planned Retirement: Age ${inputs.retireAge}</span>
      <span>bridgetoretired.com</span>
    </div>
  </div>

  <div class="accent-bar"></div>

  <!-- KEY METRICS -->
  <div class="section">
    <div class="section-title">Key Metrics at a Glance</div>
    <div class="metrics-grid">
      <div class="metric-card" style="border-top:3px solid #e8b84b">
        <div class="metric-value gold">${r.bridgeYears.toFixed(1)}</div>
        <div class="metric-label">Bridge Years</div>
      </div>
      <div class="metric-card" style="border-top:3px solid ${riskColor(r.withdrawalRate)}">
        <div class="metric-value" style="color:${riskColor(r.withdrawalRate)}">${r.withdrawalRate.toFixed(1)}%</div>
        <div class="metric-label">Withdrawal Rate</div>
      </div>
      <div class="metric-card" style="border-top:3px solid #2563eb">
        <div class="metric-value" style="color:#1d4ed8">${fmt(r.at80)}</div>
        <div class="metric-label">Portfolio at 80</div>
      </div>
      <div class="metric-card" style="border-top:3px solid ${fundedColor}">
        <div class="metric-value" style="color:${fundedColor}">${r.funded ? '✓ Funded' : '⚠ Risk'}</div>
        <div class="metric-label">${r.funded ? `To Age ${inputs.lifeExpectancy}` : `Depletes ${r.depleted}`}</div>
      </div>
    </div>
  </div>

  <!-- PLAN DETAILS -->
  <div class="two-col section">
    <div>
      <div class="section-title">Personal Details</div>
      <div class="data-row"><span class="data-label">Current Age</span><span class="data-value">${inputs.currentAge}</span></div>
      <div class="data-row"><span class="data-label">Planned Retirement Age</span><span class="data-value">${inputs.retireAge}</span></div>
      <div class="data-row"><span class="data-label">Planning Horizon</span><span class="data-value">Age ${inputs.lifeExpectancy}</span></div>
      <div class="data-row"><span class="data-label">Bridge Length</span><span class="data-value">${r.bridgeYears.toFixed(1)} years</span></div>
      <div class="data-row"><span class="data-label">SS Claiming Age</span><span class="data-value">${inputs.ssAge}</span></div>
      <div class="data-row"><span class="data-label">SS Annual Benefit</span><span class="data-value">${fmtFull(inputs.ssIncome)}</span></div>
      ${inputs.partTimeIncome > 0 ? `<div class="data-row"><span class="data-label">Part-Time Income</span><span class="data-value">${fmtFull(inputs.partTimeIncome)}/yr × ${inputs.partTimeYears} yrs</span></div>` : ''}
    </div>
    <div>
      <div class="section-title">Portfolio Balances</div>
      <div class="data-row"><span class="data-label">Taxable Brokerage</span><span class="data-value">${fmtFull(inputs.taxable)}</span></div>
      <div class="data-row"><span class="data-label">Roth IRA</span><span class="data-value">${fmtFull(inputs.rothIRA)}</span></div>
      <div class="data-row"><span class="data-label">Traditional 401k/IRA</span><span class="data-value">${fmtFull(inputs.trad401k)}</span></div>
      <div class="data-row" style="border-top:2px solid #e8b84b;margin-top:4px"><span class="data-label" style="font-weight:700">Total Portfolio</span><span class="data-value" style="font-size:15px">${fmtFull(inputs.portfolio)}</span></div>
    </div>
  </div>

  <!-- SPENDING & ASSUMPTIONS -->
  <div class="two-col section">
    <div>
      <div class="section-title">Spending Plan</div>
      <div class="data-row"><span class="data-label">Annual Living Expenses</span><span class="data-value">${fmtFull(inputs.annualSpending)}</span></div>
      <div class="data-row"><span class="data-label">Healthcare / ACA Premiums</span><span class="data-value">${fmtFull(inputs.healthcareCost)}</span></div>
      <div class="data-row"><span class="data-label">Total Annual Spending</span><span class="data-value">${fmtFull(inputs.annualSpending + inputs.healthcareCost)}</span></div>
      <div class="data-row"><span class="data-label">Withdrawal Rate</span><span class="data-value" style="color:${riskColor(r.withdrawalRate)}">${r.withdrawalRate.toFixed(1)}%</span></div>
    </div>
    <div>
      <div class="section-title">Return Assumptions</div>
      <div class="data-row"><span class="data-label">Portfolio Return (nominal)</span><span class="data-value">${inputs.returnRate}%</span></div>
      <div class="data-row"><span class="data-label">Inflation Rate</span><span class="data-value">${inputs.inflationRate}%</span></div>
      <div class="data-row"><span class="data-label">Real Return</span><span class="data-value">${(inputs.returnRate - inputs.inflationRate).toFixed(1)}%</span></div>
    </div>
  </div>

  <!-- RISK ASSESSMENT -->
  <div class="section">
    <div class="section-title">Risk Assessment</div>
    <div class="risk-grid">
      ${[
        {
          label: 'Withdrawal Rate',
          status: r.withdrawalRate > 4 ? 'bad' : r.withdrawalRate > 3.5 ? 'warn' : 'ok',
          badge: r.withdrawalRate > 4 ? 'High Risk' : r.withdrawalRate > 3.5 ? 'Moderate' : 'Safe',
          desc: r.withdrawalRate > 4
            ? `${r.withdrawalRate.toFixed(1)}% exceeds the 4% guideline. Consider reducing spending or delaying retirement.`
            : `${r.withdrawalRate.toFixed(1)}% is within a sustainable range.`
        },
        {
          label: 'Bridge Funding',
          status: inputs.taxable >= (inputs.annualSpending + inputs.healthcareCost) * r.bridgeYears ? 'ok' : 'warn',
          badge: inputs.taxable >= (inputs.annualSpending + inputs.healthcareCost) * r.bridgeYears ? 'Funded' : 'Gap',
          desc: inputs.taxable >= (inputs.annualSpending + inputs.healthcareCost) * r.bridgeYears
            ? 'Taxable account fully funds the bridge period.'
            : `Taxable account covers ${Math.round(inputs.taxable / ((inputs.annualSpending + inputs.healthcareCost) * r.bridgeYears) * 100)}% of bridge needs.`
        },
        {
          label: 'Portfolio Longevity',
          status: r.funded ? 'ok' : 'bad',
          badge: r.funded ? `Funded to ${inputs.lifeExpectancy}` : `Depletes at ${r.depleted}`,
          desc: r.funded
            ? `Portfolio projects to ${fmt(r.at90)} at age 90.`
            : `Portfolio depletes at age ${r.depleted}. Review spending or return assumptions.`
        },
        {
          label: 'SS Timing',
          status: inputs.ssAge >= 67 ? 'ok' : 'warn',
          badge: inputs.ssAge >= 67 ? 'Optimized' : 'Review',
          desc: inputs.ssAge >= 67
            ? `Claiming at ${inputs.ssAge} maximizes lifetime benefit.`
            : `Claiming at ${inputs.ssAge} reduces lifetime benefit. Consider delaying to 67 or 70.`
        },
      ].map(risk => `
        <div class="risk-item">
          <div class="risk-dot" style="background:${risk.status === 'ok' ? '#16a34a' : risk.status === 'warn' ? '#d97706' : '#dc2626'}"></div>
          <div>
            <div style="font-size:12px;font-weight:700;color:#111827;margin-bottom:3px">${risk.label} <span class="status-badge status-${risk.status}">${risk.badge}</span></div>
            <div style="font-size:11px;color:#6b7280">${risk.desc}</div>
          </div>
        </div>
      `).join('')}
    </div>
  </div>

  <!-- PROJECTION TABLE -->
  <div class="section page-break">
    <div class="section-title">30-Year Projection (First 30 Years)</div>
    <table>
      <thead>
        <tr>
          <th>Age</th>
          <th style="text-align:right">Total Spending</th>
          <th style="text-align:right">Income</th>
          <th style="text-align:right">Withdrawal</th>
          <th style="text-align:right">Portfolio Total</th>
        </tr>
      </thead>
      <tbody>${tableRows}</tbody>
    </table>
  </div>

  <!-- NOTES -->
  ${inputs.notes ? `
  <div class="section">
    <div class="section-title">Planner Notes</div>
    <div class="notes-box">${inputs.notes}</div>
  </div>
  ` : ''}

  <!-- DISCLAIMER -->
  <div class="footer">
    <span>Generated by BridgeToRetired Pro · bridgetoretired.com</span>
    <span>⚠ Not financial advice. For modeling purposes only.</span>
  </div>

</div>
</body>
</html>`
}

export default function PDFReportPage() {
  const [inputs, setInputs] = useState<ReportInputs>({
    name:           '',
    preparedFor:    '',
    date:           new Date().toISOString().split('T')[0],
    currentAge:     52,
    retireAge:      55,
    lifeExpectancy: 90,
    portfolio:      1_150_000,
    taxable:        350_000,
    rothIRA:        150_000,
    trad401k:       650_000,
    annualSpending:  55_000,
    healthcareCost:   8_400,
    inflationRate:     2.5,
    returnRate:        6.5,
    ssAge:            67,
    ssIncome:       24_000,
    partTimeIncome:      0,
    partTimeYears:       0,
    notes:          '',
  })

  const [generating, setGenerating] = useState(false)

  const set = (key: keyof ReportInputs) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const val = e.target.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value
    setInputs(prev => ({ ...prev, [key]: val }))
  }

  const handleGenerate = () => {
    setGenerating(true)
    setTimeout(() => {
      const html = generatePrintHTML(inputs)
      const win = window.open('', '_blank')
      if (win) {
        win.document.write(html)
        win.document.close()
      }
      setGenerating(false)
    }, 300)
  }

  const preview = runProjection(inputs)

  const InputField = ({ label, field, type = 'number', min, max, step, prefix }: {
    label: string; field: keyof ReportInputs; type?: string; min?: number; max?: number; step?: number; prefix?: string
  }) => (
    <div className="flex items-center justify-between py-2 border-b border-white/[0.04]">
      <label className="text-white/50 text-[12px]">{label}</label>
      <div className="flex items-center gap-1.5">
        {prefix && <span className="text-white/25 text-[11px]">{prefix}</span>}
        <input
          type={type}
          min={min} max={max} step={step}
          value={(inputs as any)[field]}
          onChange={set(field)}
          className="w-28 bg-[#0D1420] border border-white/[0.1] rounded px-2.5 py-1.5 text-[#E8B84B] font-mono text-[12px] text-right focus:outline-none focus:border-[#E8B84B]/50"
        />
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="border-b border-white/[0.06] bg-[#0D1420]">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
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
        <div className="max-w-6xl mx-auto">
          <div className="font-mono text-[9px] tracking-widest uppercase text-[#E8B84B] mb-3">PDF Export</div>
          <h1 className="font-syne font-bold text-[clamp(24px,3vw,40px)] text-white tracking-tight mb-2">
            Retirement Plan Report
          </h1>
          <p className="text-white/45 text-[14px]">One-click export. Branded, shareable, CPA-ready. Opens in a new tab — save as PDF from your browser.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-5 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-8">

          {/* Left — Form */}
          <div className="space-y-5">

            {/* Report Info */}
            <div className="bg-[#141C28] border border-white/[0.07] rounded-xl overflow-hidden">
              <div className="bg-[#1E2A3A] px-5 py-3">
                <span className="font-mono text-[9px] tracking-widest uppercase text-white/40">Report Info</span>
              </div>
              <div className="p-5 space-y-1">
                <div className="flex items-center justify-between py-2 border-b border-white/[0.04]">
                  <label className="text-white/50 text-[12px]">Prepared For</label>
                  <input
                    type="text"
                    placeholder="Your name"
                    value={inputs.preparedFor}
                    onChange={set('preparedFor')}
                    className="w-48 bg-[#0D1420] border border-white/[0.1] rounded px-2.5 py-1.5 text-white font-mono text-[12px] focus:outline-none focus:border-[#E8B84B]/50 placeholder-white/20"
                  />
                </div>
                <div className="flex items-center justify-between py-2">
                  <label className="text-white/50 text-[12px]">Report Notes (optional)</label>
                </div>
                <textarea
                  rows={3}
                  placeholder="Add any notes, goals, or context for your advisor..."
                  value={inputs.notes}
                  onChange={set('notes')}
                  className="w-full bg-[#0D1420] border border-white/[0.1] rounded px-3 py-2 text-white/70 text-[12px] focus:outline-none focus:border-[#E8B84B]/50 placeholder-white/20 resize-none"
                />
              </div>
            </div>

            {/* Personal */}
            <div className="bg-[#141C28] border border-white/[0.07] rounded-xl overflow-hidden">
              <div className="bg-[#1E2A3A] px-5 py-3">
                <span className="font-mono text-[9px] tracking-widest uppercase text-white/40">Personal Details</span>
              </div>
              <div className="p-5">
                <InputField label="Current Age"        field="currentAge"     min={30} max={65} step={1} />
                <InputField label="Retire Age"         field="retireAge"      min={40} max={65} step={1} />
                <InputField label="Life Expectancy"    field="lifeExpectancy" min={70} max={100} step={1} />
                <InputField label="SS Claiming Age"    field="ssAge"          min={62} max={70} step={1} />
                <InputField label="SS Annual Benefit"  field="ssIncome"       min={0} max={60000} step={500} prefix="$" />
                <InputField label="Part-Time Income"   field="partTimeIncome" min={0} max={100000} step={1000} prefix="$" />
                <InputField label="Part-Time Years"    field="partTimeYears"  min={0} max={20} step={1} />
              </div>
            </div>

            {/* Portfolio */}
            <div className="bg-[#141C28] border border-white/[0.07] rounded-xl overflow-hidden">
              <div className="bg-[#1E2A3A] px-5 py-3">
                <span className="font-mono text-[9px] tracking-widest uppercase text-white/40">Portfolio Balances</span>
              </div>
              <div className="p-5">
                <InputField label="Taxable Brokerage"   field="taxable"   min={0} max={5000000} step={10000} prefix="$" />
                <InputField label="Roth IRA"            field="rothIRA"   min={0} max={2000000} step={10000} prefix="$" />
                <InputField label="Traditional 401k"    field="trad401k"  min={0} max={5000000} step={10000} prefix="$" />
                <div className="mt-3 pt-3 border-t border-white/[0.06] flex justify-between">
                  <span className="text-white/50 text-[12px]">Total Portfolio</span>
                  <span className="font-mono font-bold text-[#E8B84B] text-[14px]">{fmtFull(inputs.portfolio)}</span>
                </div>
              </div>
            </div>

            {/* Spending */}
            <div className="bg-[#141C28] border border-white/[0.07] rounded-xl overflow-hidden">
              <div className="bg-[#1E2A3A] px-5 py-3">
                <span className="font-mono text-[9px] tracking-widest uppercase text-white/40">Spending & Assumptions</span>
              </div>
              <div className="p-5">
                <InputField label="Annual Spending"     field="annualSpending" min={20000} max={300000} step={1000} prefix="$" />
                <InputField label="Healthcare / ACA"    field="healthcareCost" min={0} max={30000} step={500} prefix="$" />
                <InputField label="Portfolio Return %"  field="returnRate"     min={1} max={12} step={0.1} />
                <InputField label="Inflation Rate %"    field="inflationRate"  min={1} max={8} step={0.1} />
              </div>
            </div>
          </div>

          {/* Right — Preview + Generate */}
          <div className="space-y-5">

            {/* Live Preview */}
            <div className="bg-[#141C28] border border-[#E8B84B]/20 rounded-xl overflow-hidden sticky top-5">
              <div className="bg-[#1E2A3A] px-5 py-3 flex items-center justify-between">
                <span className="font-mono text-[9px] tracking-widest uppercase text-white/40">Report Preview</span>
                <span className="font-mono text-[8px] text-white/20">Updates live</span>
              </div>
              <div className="p-5 space-y-4">
                {/* Mini metrics */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Bridge Years',    value: preview.bridgeYears.toFixed(1) + ' yrs', color: preview.bridgeYears > 10 ? '#F87171' : '#E8B84B' },
                    { label: 'Withdrawal Rate', value: preview.withdrawalRate.toFixed(1) + '%',  color: preview.withdrawalRate > 4 ? '#F87171' : '#4ADE80' },
                    { label: 'Portfolio at 80', value: fmt(preview.at80),                        color: '#60A5FA' },
                    { label: 'Portfolio at 90', value: fmt(preview.at90),                        color: preview.funded ? '#4ADE80' : '#F87171' },
                  ].map(m => (
                    <div key={m.label} className="bg-black/40 rounded-lg p-3 text-center">
                      <div className="font-mono font-bold text-[14px] mb-0.5" style={{ color: m.color }}>{m.value}</div>
                      <div className="font-mono text-[8px] tracking-widest uppercase text-white/25">{m.label}</div>
                    </div>
                  ))}
                </div>

                <div className={`rounded-lg p-3 text-center ${preview.funded ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                  <span className="font-mono text-[10px] tracking-widest uppercase" style={{ color: preview.funded ? '#4ADE80' : '#F87171' }}>
                    {preview.funded ? `✓ Funded to age ${inputs.lifeExpectancy}` : `⚠ Depletes at age ${preview.depleted}`}
                  </span>
                </div>

                {/* What's in the report */}
                <div className="space-y-1.5">
                  <div className="font-mono text-[8px] tracking-widest uppercase text-white/25 mb-2">Report includes</div>
                  {[
                    'Key metrics summary',
                    'Personal & portfolio details',
                    'Spending plan analysis',
                    '4 automated risk checks',
                    '30-year projection table',
                    'Planner notes section',
                    'Disclaimer for CPA sharing',
                  ].map(item => (
                    <div key={item} className="flex items-center gap-2 text-[11px] text-white/40">
                      <span className="text-[#4ADE80] text-[9px]">✓</span>
                      {item}
                    </div>
                  ))}
                </div>

                {/* Generate button */}
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="w-full bg-[#E8B84B] text-black font-syne font-bold text-[14px] py-4 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {generating ? (
                    <>
                      <span className="animate-spin">⟳</span>
                      Generating...
                    </>
                  ) : (
                    <>
                      📄 Generate PDF Report
                    </>
                  )}
                </button>
                <p className="text-white/25 text-[10px] text-center leading-relaxed">
                  Opens in a new tab. Use <strong className="text-white/40">File → Print → Save as PDF</strong> in your browser.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    <ProNav />
    </div>
  )
}
  )
}
