'use client'

import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { ProNav } from '@/components/ProNav'

const GOLD   = '#E8B84B'
const SAGE   = '#4ADE80'
const RED    = '#F87171'
const TEAL   = '#2DD4BF'
const BLUE   = '#60A5FA'
const PURPLE = '#A78BFA'

const SCENARIO_COLORS = [GOLD, TEAL, SAGE, BLUE, PURPLE]
const MAX_SCENARIOS = 5

// ─── Types ────────────────────────────────────────────────────────────────────

interface ScenarioInputs {
  retireAge:       number
  portfolio:       number
  taxable:         number
  annualSpending:  number
  inflationRate:   number
  returnRate:      number
  ssAge:           number
  ssIncome:        number
  partTimeIncome:  number
  partTimeYears:   number
  healthcareCost:  number
}

interface Scenario {
  id:        string
  name:      string
  color:     string
  inputs:    ScenarioInputs
  createdAt: string
  isActive:  boolean
}

interface ProjectionResult {
  totalAt80:      number
  totalAt90:      number
  depleted:       number | null
  bridgeYears:    number
  withdrawalRate: number
  funded:         boolean
}

interface ScoredScenario {
  id:    string
  score: number
  rank:  number
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_INPUTS: ScenarioInputs = {
  retireAge:      55,
  portfolio:      1_150_000,
  taxable:        350_000,
  annualSpending:  55_000,
  inflationRate:    2.5,
  returnRate:       6.5,
  ssAge:           67,
  ssIncome:        24_000,
  partTimeIncome:       0,
  partTimeYears:        0,
  healthcareCost:   8_400,
}

const PRESET_NAMES = [
  'Retire at 50 aggressive',
  'Retire at 55 base case',
  'Retire at 53 conservative',
  'One more year',
  'Lean FIRE',
]

// ─── DB mapping helpers ───────────────────────────────────────────────────────

function toPlannerInputs(inputs: ScenarioInputs) {
  return {
    currentAge:     45,
    retireAge:      inputs.retireAge,
    ssAge:          inputs.ssAge,
    lifeExpectancy: 90,
    filingStatus:   'MFJ',
    state:          'TX',
    stateTaxRate:   0,
    taxable:        inputs.taxable,
    k401:           inputs.portfolio - inputs.taxable,
    roth:           0,
    cash:           0,
    spending:       inputs.annualSpending + inputs.healthcareCost,
    inflation:      inputs.inflationRate / 100,
    otherIncome:    inputs.partTimeIncome,
    ssBenefit:      inputs.ssIncome,
    returnRate:     inputs.returnRate / 100,
    volatility:     0.12,
  }
}

function fromDbRow(row: any): ScenarioInputs {
  const extra = row.risk_flags ?? {}
  const healthcareCost = extra.healthcareCost ?? 8_400
  return {
    retireAge:      row.retire_age,
    portfolio:      (row.taxable ?? 0) + (row.k401 ?? 0),
    taxable:        row.taxable ?? 0,
    annualSpending: Math.max(0, (row.spending ?? 0) - healthcareCost),
    inflationRate:  (row.inflation ?? 0.025) * 100,
    returnRate:     (row.return_rate ?? 0.065) * 100,
    ssAge:          row.ss_age,
    ssIncome:       row.ss_benefit ?? 0,
    partTimeIncome: row.other_income ?? 0,
    partTimeYears:  extra.partTimeYears ?? 0,
    healthcareCost,
  }
}

function colorForIndex(idx: number) {
  return SCENARIO_COLORS[idx % SCENARIO_COLORS.length]
}

// ─── Projection ───────────────────────────────────────────────────────────────

function runProjection(inputs: ScenarioInputs): ProjectionResult {
  const bridgeYears    = Math.max(0, 59.5 - inputs.retireAge)
  const withdrawalRate = inputs.annualSpending / inputs.portfolio * 100
  let taxable  = inputs.taxable
  let other    = inputs.portfolio - inputs.taxable
  let depleted: number | null = null
  let totalAt80 = 0
  let totalAt90 = 0

  for (let i = 0; i < 90 - inputs.retireAge; i++) {
    const age        = inputs.retireAge + i
    const isBridge   = age < 59.5
    const spending   = inputs.annualSpending * Math.pow(1 + inputs.inflationRate / 100, i)
    const healthcare = inputs.healthcareCost * Math.pow(1 + inputs.inflationRate / 100, i)
    let income = 0
    if (i < inputs.partTimeYears) income += inputs.partTimeIncome
    if (age >= inputs.ssAge) income += inputs.ssIncome * Math.pow(1 + inputs.inflationRate / 100, age - inputs.ssAge)
    const needed      = Math.max(0, spending + healthcare - income)
    const fromTaxable = Math.min(needed, taxable)
    taxable           = Math.max(0, taxable - fromTaxable)
    const fromOther   = needed - fromTaxable
    if (!isBridge) other = Math.max(0, other - fromOther)
    taxable = Math.max(0, taxable * (1 + inputs.returnRate / 100))
    other   = Math.max(0, other   * (1 + inputs.returnRate / 100))
    const total = taxable + other
    if (total <= 0 && depleted === null) depleted = Math.floor(age)
    if (Math.floor(age) === 80) totalAt80 = Math.round(total)
    if (Math.floor(age) === 89) totalAt90 = Math.round(total)
  }

  return { totalAt80, totalAt90, depleted, bridgeYears, withdrawalRate, funded: depleted === null }
}

// ─── Scoring & Recommendation ─────────────────────────────────────────────────

function scoreScenarios(
  scenarios: Scenario[],
  results: (ProjectionResult & { id: string })[]
): ScoredScenario[] {
  if (scenarios.length < 2) return scenarios.map((s, i) => ({ id: s.id, score: 100, rank: i + 1 }))

  const get = (id: string) => results.find(r => r.id === id)!
  const vals = (fn: (s: Scenario) => number) => scenarios.map(fn)
  const norm = (v: number, min: number, max: number, invert = false) => {
    if (max === min) return 50
    const pct = (v - min) / (max - min) * 100
    return invert ? 100 - pct : pct
  }

  const at90s      = vals(s => get(s.id).totalAt90)
  const wrs        = vals(s => get(s.id).withdrawalRate)
  const bridges    = vals(s => get(s.id).bridgeYears)
  const retireAges = vals(s => s.inputs.retireAge)

  const scored = scenarios.map((s, i) => {
    const r = get(s.id)
    const fundedScore  = r.funded ? 100 : Math.max(0, ((r.depleted ?? 90) - s.inputs.retireAge) / (90 - s.inputs.retireAge) * 100)
    const at90Score    = norm(at90s[i],     Math.min(...at90s),     Math.max(...at90s))
    const wrScore      = norm(wrs[i],        Math.min(...wrs),        Math.max(...wrs),   true)
    const bridgeScore  = norm(bridges[i],    Math.min(...bridges),    Math.max(...bridges), true)
    const retireScore  = norm(retireAges[i], Math.min(...retireAges), Math.max(...retireAges), true)
    const total = fundedScore * 0.30 + at90Score * 0.25 + wrScore * 0.20 + bridgeScore * 0.15 + retireScore * 0.10
    return { id: s.id, score: Math.round(total) }
  })

  const sorted = [...scored].sort((a, b) => b.score - a.score)
  return scored.map(s => ({ ...s, rank: sorted.findIndex(x => x.id === s.id) + 1 }))
}

function buildWhyReasons(
  winner: Scenario,
  others: Scenario[],
  winnerResult: ProjectionResult & { id: string },
  otherResults: (ProjectionResult & { id: string })[]
): string[] {
  const reasons: string[] = []

  if (winnerResult.funded) {
    const unfundedCount = otherResults.filter(r => !r.funded).length
    if (unfundedCount > 0)
      reasons.push(`Fully funded to age 90 — ${unfundedCount} other scenario${unfundedCount > 1 ? 's' : ''} deplete${unfundedCount === 1 ? 's' : ''} early`)
  }

  const bestOtherAt90 = Math.max(...otherResults.map(r => r.totalAt90))
  const at90Diff = winnerResult.totalAt90 - bestOtherAt90
  if (at90Diff > 10_000)
    reasons.push(`$${Math.round(at90Diff / 1000)}k more remaining at age 90 vs. next best scenario`)

  const bestOtherWR = Math.min(...otherResults.map(r => r.withdrawalRate))
  const wrDiff = bestOtherWR - winnerResult.withdrawalRate
  if (wrDiff > 0.2)
    reasons.push(`Lower withdrawal rate (${winnerResult.withdrawalRate.toFixed(1)}% vs ${bestOtherWR.toFixed(1)}%) — less portfolio stress`)

  const avgOtherBridge = otherResults.reduce((a, r) => a + r.bridgeYears, 0) / otherResults.length
  const bridgeDiff = avgOtherBridge - winnerResult.bridgeYears
  if (bridgeDiff > 0.5)
    reasons.push(`Shorter bridge period (${winnerResult.bridgeYears.toFixed(1)} yrs) — less reliance on taxable accounts`)

  const earliestOtherRetire = Math.min(...others.map(s => s.inputs.retireAge))
  const latestOtherRetire   = Math.max(...others.map(s => s.inputs.retireAge))
  if (winner.inputs.retireAge > earliestOtherRetire && winner.inputs.retireAge <= latestOtherRetire) {
    const diff = winner.inputs.retireAge - earliestOtherRetire
    reasons.push(`Only ${diff} additional year${diff > 1 ? 's' : ''} of work vs. earliest scenario — strong longevity payoff`)
  }

  if (reasons.length === 0)
    reasons.push('Best overall balance of portfolio longevity, withdrawal rate, and bridge risk')

  return reasons.slice(0, 4)
}

// ─── Formatters ───────────────────────────────────────────────────────────────

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000)     return `$${Math.round(n / 1000)}k`
  return `$${Math.round(n)}`
}

const MEDALS = ['🥇', '🥈', '🥉']

// ─── Sub-components ───────────────────────────────────────────────────────────

function InputRow({ label, field, min, max, step, isCurrency = false, inputs, onChange }: {
  label: string; field: keyof ScenarioInputs; min: number; max: number; step: number
  isCurrency?: boolean; inputs: ScenarioInputs; onChange: (k: keyof ScenarioInputs) => (e: any) => void
}) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-white/[0.04]">
      <span className="text-white/50 text-[11px]">{label}</span>
      <div className="flex items-center gap-1">
        {isCurrency && <span className="text-white/25 text-[10px]">$</span>}
        <input
          type="number" min={min} max={max} step={step}
          value={(inputs as any)[field]}
          onChange={onChange(field)}
          className="w-20 bg-black/40 border border-white/[0.1] rounded px-2 py-1 text-[#E8B84B] font-mono text-[11px] text-right focus:outline-none focus:border-[#E8B84B]/50"
        />
      </div>
    </div>
  )
}

function ScenarioForm({ inputs, onChange }: {
  inputs: ScenarioInputs; onChange: (k: keyof ScenarioInputs) => (e: any) => void
}) {
  return (
    <div className="space-y-1">
      <div className="font-mono text-[8px] tracking-widest uppercase text-white/25 pt-2 pb-1">Retirement</div>
      <InputRow label="Retire Age"         field="retireAge"      min={40}  max={65}      step={1}     inputs={inputs} onChange={onChange} />
      <InputRow label="Total Portfolio"    field="portfolio"      min={0}   max={5000000} step={50000} isCurrency inputs={inputs} onChange={onChange} />
      <InputRow label="Taxable Portion"    field="taxable"        min={0}   max={3000000} step={25000} isCurrency inputs={inputs} onChange={onChange} />
      <div className="font-mono text-[8px] tracking-widest uppercase text-white/25 pt-3 pb-1">Spending</div>
      <InputRow label="Annual Spending"    field="annualSpending" min={20000} max={300000} step={1000} isCurrency inputs={inputs} onChange={onChange} />
      <InputRow label="Healthcare/ACA"     field="healthcareCost" min={0}   max={30000}   step={500}   isCurrency inputs={inputs} onChange={onChange} />
      <InputRow label="Part-Time Income"   field="partTimeIncome" min={0}   max={100000}  step={1000}  isCurrency inputs={inputs} onChange={onChange} />
      <InputRow label="Part-Time Years"    field="partTimeYears"  min={0}   max={20}      step={1}     inputs={inputs} onChange={onChange} />
      <div className="font-mono text-[8px] tracking-widest uppercase text-white/25 pt-3 pb-1">Returns</div>
      <InputRow label="Portfolio Return %" field="returnRate"     min={1}   max={12}      step={0.1}   inputs={inputs} onChange={onChange} />
      <InputRow label="Inflation Rate %"   field="inflationRate"  min={1}   max={8}       step={0.1}   inputs={inputs} onChange={onChange} />
      <div className="font-mono text-[8px] tracking-widest uppercase text-white/25 pt-3 pb-1">Social Security</div>
      <InputRow label="SS Claiming Age"    field="ssAge"          min={62}  max={70}      step={1}     inputs={inputs} onChange={onChange} />
      <InputRow label="SS Annual Benefit"  field="ssIncome"       min={0}   max={60000}   step={500}   isCurrency inputs={inputs} onChange={onChange} />
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ScenarioComparePage() {
  const { user, isLoaded } = useUser()
  const isPro = user?.publicMetadata?.isPro === true

  const [scenarios,   setScenarios]   = useState<Scenario[]>([])
  const [loading,     setLoading]     = useState(true)
  const [editing,     setEditing]     = useState<string | null>(null)
  const [saving,      setSaving]      = useState(false)
  const [activating,  setActivating]  = useState<string | null>(null)
  const [newName,     setNewName]     = useState('')
  const [draft,       setDraft]       = useState<ScenarioInputs>(DEFAULT_INPUTS)
  const [showNew,     setShowNew]     = useState(false)
  const [toast,       setToast]       = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchScenarios = useCallback(async () => {
    try {
      const res  = await fetch('/api/planner/scenarios')
      const data = await res.json()
      if (data.scenarios) {
        const compareScenarios = data.scenarios.filter(
          (s: any) => s.risk_flags?._source === 'compare'
        )
        const mapped: Scenario[] = compareScenarios.map((s: any, idx: number) => ({
          id:        s.id,
          name:      s.name,
          color:     colorForIndex(idx),
          inputs:    fromDbRow(s),
          createdAt: new Date(s.created_at).toLocaleDateString(),
          isActive:  s.is_active === true,
        }))
        setScenarios(mapped)
      }
    } catch (err) {
      console.error('Failed to load scenarios', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isLoaded && isPro) fetchScenarios()
    else if (isLoaded) setLoading(false)
  }, [isLoaded, isPro, fetchScenarios])

  const saveScenario = async () => {
    if (!newName.trim() || !user) return
    setSaving(true)
    try {
      const res = await fetch('/api/planner/scenarios', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          name:   newName.trim(),
          email:  user.primaryEmailAddress?.emailAddress,
          inputs: toPlannerInputs(draft),
          results: {
            riskFlags: {
              _source:        'compare',
              partTimeYears:  draft.partTimeYears,
              healthcareCost: draft.healthcareCost,
            },
          },
        }),
      })
      const data = await res.json()
      if (data.error) {
        showToast(data.error, 'error')
      } else {
        showToast('Scenario saved')
        setShowNew(false)
        setNewName('')
        setDraft(DEFAULT_INPUTS)
        await fetchScenarios()
      }
    } catch {
      showToast('Failed to save', 'error')
    } finally {
      setSaving(false)
    }
  }

  const deleteScenario = async (id: string) => {
    try {
      await fetch(`/api/planner/scenarios/${id}`, { method: 'DELETE' })
      setScenarios(prev => prev.filter(s => s.id !== id))
      if (editing === id) setEditing(null)
      showToast('Scenario deleted')
    } catch {
      showToast('Failed to delete', 'error')
    }
  }

  const updateScenario = async (id: string, inputs: ScenarioInputs, name: string) => {
    setScenarios(prev => prev.map(s => s.id === id ? { ...s, inputs } : s))
    try {
      await fetch(`/api/planner/scenarios/${id}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          name,
          inputs: toPlannerInputs(inputs),
          results: {
            riskFlags: {
              _source:        'compare',
              partTimeYears:  inputs.partTimeYears,
              healthcareCost: inputs.healthcareCost,
            },
          },
        }),
      })
    } catch {
      showToast('Failed to update', 'error')
      await fetchScenarios()
    }
  }

  const activateScenario = async (id: string) => {
    setActivating(id)
    try {
      const res  = await fetch(`/api/planner/scenarios/${id}/activate`, { method: 'PATCH' })
      const data = await res.json()
      if (data.error) {
        showToast(data.error, 'error')
      } else {
        // Optimistic update — mark active locally
        setScenarios(prev => prev.map(s => ({ ...s, isActive: s.id === id })))
        showToast('✓ Active scenario set')
      }
    } catch {
      showToast('Failed to set active', 'error')
    } finally {
      setActivating(null)
    }
  }

  const setDraftField = (key: keyof ScenarioInputs) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setDraft(prev => ({ ...prev, [key]: parseFloat(e.target.value) || 0 }))
  }

  const results = scenarios.map(s => ({ id: s.id, ...runProjection(s.inputs) }))

  const scores: ScoredScenario[] = scenarios.length >= 2
    ? scoreScenarios(scenarios, results)
    : []

  const rankOf   = (id: string) => scores.find(s => s.id === id)?.rank ?? 99
  const scoreOf  = (id: string) => scores.find(s => s.id === id)?.score ?? 0
  const winnerId = scores.find(s => s.rank === 1)?.id ?? null
  const winner   = scenarios.find(s => s.id === winnerId) ?? null
  const winnerRes = results.find(r => r.id === winnerId) ?? null

  // ── Gates ──────────────────────────────────────────────────────────────────

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="font-mono text-[11px] tracking-widest uppercase text-white/30">Loading...</div>
      </div>
    )
  }

  if (!isPro) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-5">
        <div className="max-w-md text-center">
          <div className="text-4xl mb-6">🔒</div>
          <div className="font-mono text-[9px] tracking-widest uppercase text-gold mb-3">Pro Feature</div>
          <h1 className="font-syne font-bold text-[28px] text-white mb-4">Scenario Compare is Pro Only</h1>
          <p className="text-white/45 text-[14px] leading-relaxed mb-8">
            Save up to 5 retirement scenarios, compare them side-by-side, and access your plan from any device.
          </p>
          <Link href="/pricing" className="bg-gold text-black font-syne font-semibold text-[13px] tracking-wide px-8 py-3 rounded hover:opacity-85 transition-opacity">
            Upgrade to Pro →
          </Link>
        </div>
      </div>
    )
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-black">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 font-mono text-[11px] tracking-widest uppercase px-4 py-2.5 rounded-lg border ${
          toast.type === 'success'
            ? 'bg-green-500/10 border-green-500/20 text-green-400'
            : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          {toast.msg}
        </div>
      )}

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

      {/* Hero */}
      <div className="bg-[#0D1420] border-b border-white/[0.06] px-5 py-10">
        <div className="max-w-7xl mx-auto flex items-end justify-between flex-wrap gap-4">
          <div>
            <div className="font-mono text-[9px] tracking-widest uppercase text-[#E8B84B] mb-3">Scenario Compare</div>
            <h1 className="font-syne font-bold text-[clamp(24px,3vw,40px)] text-white tracking-tight mb-2">
              Save &amp; Compare Scenarios
            </h1>
            <p className="text-white/45 text-[14px]">Up to 5 named scenarios. Your numbers are saved automatically.</p>
          </div>
          <div className="w-full mt-4 bg-[#E8B84B]/10 border border-[#E8B84B]/20 rounded-xl px-5 py-3 flex items-center gap-3">
            <span className="text-[#E8B84B] text-lg flex-shrink-0">☁️</span>
            <p className="text-white/50 text-[12px] leading-relaxed">
              Scenarios are saved to <strong className="text-white/70">your account</strong> — available on any device, any browser. No bookmarking required.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {scenarios.length < MAX_SCENARIOS && !showNew && (
              <button
                onClick={() => { setShowNew(true); setNewName(PRESET_NAMES[scenarios.length] ?? 'My Scenario') }}
                className="bg-[#E8B84B] text-black font-syne font-semibold text-[12px] px-5 py-2.5 rounded-lg hover:opacity-85 transition-opacity"
              >
                + New Scenario
              </button>
            )}
            {scenarios.length >= MAX_SCENARIOS && (
              <span className="font-mono text-[9px] text-white/30 tracking-widest uppercase">5/5 slots used</span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 py-8 space-y-8">

        {/* New Scenario Form */}
        {showNew && (
          <div className="bg-[#141C28] border border-[#E8B84B]/30 rounded-2xl overflow-hidden">
            <div className="bg-[#1E2A3A] px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ background: SCENARIO_COLORS[scenarios.length % 5] }} />
                <span className="font-syne font-semibold text-white text-[14px]">New Scenario</span>
              </div>
              <button onClick={() => setShowNew(false)} className="text-white/30 hover:text-white/60 text-lg">✕</button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label className="font-mono text-[9px] tracking-widest uppercase text-white/30 block mb-2">Scenario Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="e.g. Retire at 50 aggressive"
                  className="w-full max-w-sm bg-black/40 border border-white/[0.12] rounded-lg px-4 py-2.5 text-white font-syne text-[14px] focus:outline-none focus:border-[#E8B84B]/50 placeholder-white/20"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ScenarioForm inputs={draft} onChange={setDraftField} />
                <div>
                  <div className="font-mono text-[9px] tracking-widest uppercase text-white/25 mb-3">Live Preview</div>
                  {(() => {
                    const r = runProjection(draft)
                    return (
                      <div className="space-y-3">
                        <div className="bg-black/30 rounded-xl p-4 grid grid-cols-2 gap-3">
                          {[
                            { label: 'Bridge Years',    value: r.bridgeYears.toFixed(1),         color: r.bridgeYears > 10 ? RED : GOLD },
                            { label: 'Withdrawal Rate', value: r.withdrawalRate.toFixed(1) + '%', color: r.withdrawalRate > 4 ? RED : SAGE },
                            { label: 'At Age 80',       value: fmt(r.totalAt80),                  color: r.totalAt80 > 0 ? TEAL : RED },
                            { label: 'At Age 90',       value: fmt(r.totalAt90),                  color: r.totalAt90 > 0 ? SAGE : RED },
                          ].map(m => (
                            <div key={m.label} className="text-center">
                              <div className="font-mono font-bold text-[15px] mb-0.5" style={{ color: m.color }}>{m.value}</div>
                              <div className="font-mono text-[8px] tracking-widest uppercase text-white/25">{m.label}</div>
                            </div>
                          ))}
                        </div>
                        <div className={`rounded-xl p-3 text-center ${r.funded ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                          <span className="font-mono text-[10px] tracking-widest uppercase" style={{ color: r.funded ? SAGE : RED }}>
                            {r.funded ? '✓ Funded to age 90' : `⚠ Depletes at age ${r.depleted}`}
                          </span>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={saveScenario}
                  disabled={!newName.trim() || saving}
                  className="bg-[#E8B84B] text-black font-syne font-semibold text-[12px] px-6 py-2.5 rounded-lg hover:opacity-85 transition-opacity disabled:opacity-40"
                >
                  {saving ? 'Saving...' : 'Save Scenario'}
                </button>
                <button
                  onClick={() => setShowNew(false)}
                  className="border border-white/[0.12] text-white/50 font-mono text-[10px] tracking-widest uppercase px-5 py-2.5 rounded-lg hover:border-white/25 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {scenarios.length === 0 && !showNew && (
          <div className="text-center py-20 bg-[#141C28] border border-white/[0.07] rounded-2xl">
            <div className="text-5xl mb-4">📊</div>
            <div className="font-syne font-bold text-white text-xl mb-2">No scenarios yet</div>
            <p className="text-white/40 text-[13px] mb-6 max-w-sm mx-auto">
              Save up to 5 retirement scenarios and compare them side-by-side. They'll be available on any device.
            </p>
            <button
              onClick={() => { setShowNew(true); setNewName(PRESET_NAMES[0]) }}
              className="bg-[#E8B84B] text-black font-syne font-semibold text-[13px] px-6 py-3 rounded-lg hover:opacity-85 transition-opacity"
            >
              + Create First Scenario
            </button>
          </div>
        )}

        {/* Comparison table + recommendation + cards */}
        {scenarios.length > 0 && (
          <>
            {/* Recommendation block */}
            {winner && winnerRes && scenarios.length >= 2 && (() => {
              const others   = scenarios.filter(s => s.id !== winner.id)
              const otherRes = results.filter(r => r.id !== winner.id)
              const reasons  = buildWhyReasons(winner, others, winnerRes, otherRes)
              return (
                <div className="bg-[#0D1420] border border-[#E8B84B]/25 rounded-2xl overflow-hidden">
                  <div className="bg-[#E8B84B]/8 px-6 py-4 flex items-center gap-3 border-b border-[#E8B84B]/15">
                    <span className="text-xl">⭐</span>
                    <div>
                      <div className="font-mono text-[9px] tracking-widest uppercase text-[#E8B84B]">Recommended Scenario</div>
                      <div className="font-syne font-bold text-white text-[18px] mt-0.5">{winner.name}</div>
                    </div>
                    <div className="ml-auto flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-mono text-[9px] tracking-widest uppercase text-white/30 mb-0.5">Overall Score</div>
                        <div className="font-mono font-bold text-[22px]" style={{ color: winner.color }}>{scoreOf(winner.id)}</div>
                      </div>
                      <button
                        onClick={() => activateScenario(winner.id)}
                        disabled={activating === winner.id || winner.isActive}
                        className="font-mono text-[9px] tracking-widest uppercase px-3 py-2 rounded-lg border transition-all disabled:opacity-50"
                        style={winner.isActive
                          ? { borderColor: SAGE, color: SAGE, background: `${SAGE}10` }
                          : { borderColor: `${GOLD}60`, color: GOLD, background: `${GOLD}10` }
                        }
                      >
                        {winner.isActive ? '✓ Active' : activating === winner.id ? 'Setting...' : 'Set Active'}
                      </button>
                    </div>
                  </div>
                  <div className="px-6 py-4">
                    <div className="font-mono text-[9px] tracking-widest uppercase text-white/30 mb-3">Why this scenario wins</div>
                    <div className="space-y-2">
                      {reasons.map((reason, i) => (
                        <div key={i} className="flex items-start gap-2.5">
                          <span className="text-[#4ADE80] text-[11px] mt-0.5 shrink-0">✓</span>
                          <span className="text-white/65 text-[13px] leading-snug">{reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })()}

            {/* Comparison table */}
            <div className="bg-[#141C28] border border-white/[0.07] rounded-2xl overflow-hidden">
              <div className="bg-[#1E2A3A] px-6 py-4 flex items-center justify-between">
                <span className="font-mono text-[9px] tracking-widest uppercase text-white/40">Side-by-Side Comparison</span>
                {scenarios.length >= 2 && (
                  <span className="font-mono text-[8px] tracking-widest uppercase text-white/20">
                    🥇 gold &nbsp;·&nbsp; 🥈 silver &nbsp;·&nbsp; 🥉 bronze
                  </span>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="border-b border-white/[0.07]">
                      <th className="px-5 py-3 text-left font-mono text-[9px] tracking-widest uppercase text-white/30 w-36">Metric</th>
                      {scenarios.map(s => {
                        const rank    = rankOf(s.id)
                        const medal   = rank <= 3 && scenarios.length >= 2 ? MEDALS[rank - 1] : null
                        const isWinner = rank === 1 && scenarios.length >= 2
                        return (
                          <th key={s.id} className="px-4 py-3 text-center">
                            <div className="flex flex-col items-center gap-1">
                              {medal ? (
                                <span className="text-base leading-none">{medal}</span>
                              ) : (
                                <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                              )}
                              <span className="font-syne font-semibold text-[12px] leading-tight" style={{ color: isWinner ? s.color : 'white' }}>
                                {s.name}
                              </span>
                              {s.isActive && (
                                <span className="font-mono text-[7px] tracking-widest uppercase text-[#4ADE80]">⭐ active</span>
                              )}
                              {scenarios.length >= 2 && (
                                <span className="font-mono text-[8px] text-white/25">score {scoreOf(s.id)}</span>
                              )}
                            </div>
                          </th>
                        )
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: 'Retire Age',      getValue: (s: Scenario) => s.inputs.retireAge,                                 format: (v: any) => `${v}`,               isGoodHigh: false },
                      { label: 'Bridge Years',    getValue: (s: Scenario) => results.find(r=>r.id===s.id)?.bridgeYears ?? 0,    format: (v: any) => v.toFixed(1) + ' yrs', isGoodHigh: false },
                      { label: 'Portfolio',       getValue: (s: Scenario) => s.inputs.portfolio,                                 format: fmt,                              isGoodHigh: true  },
                      { label: 'Annual Spending', getValue: (s: Scenario) => s.inputs.annualSpending,                            format: fmt,                              isGoodHigh: false },
                      { label: 'Withdrawal Rate', getValue: (s: Scenario) => results.find(r=>r.id===s.id)?.withdrawalRate ?? 0, format: (v: any) => v.toFixed(1) + '%',   isGoodHigh: false },
                      { label: 'SS Age',          getValue: (s: Scenario) => s.inputs.ssAge,                                    format: (v: any) => `${v}`,               isGoodHigh: true  },
                      { label: 'Portfolio at 80', getValue: (s: Scenario) => results.find(r=>r.id===s.id)?.totalAt80 ?? 0,      format: fmt,                              isGoodHigh: true  },
                      { label: 'Portfolio at 90', getValue: (s: Scenario) => results.find(r=>r.id===s.id)?.totalAt90 ?? 0,      format: fmt,                              isGoodHigh: true  },
                      { label: 'Funded to 90?',   getValue: (s: Scenario) => results.find(r=>r.id===s.id)?.funded ?? false,     format: (v: any) => v ? '✓ Yes' : '✗ No', isGoodHigh: true  },
                    ].map((row, ri) => {
                      const values = scenarios.map(s => row.getValue(s))
                      const best   = row.isGoodHigh ? Math.max(...values.map(Number)) : Math.min(...values.map(Number))
                      return (
                        <tr key={row.label} className={`border-b border-white/[0.04] ${ri % 2 === 0 ? '' : 'bg-white/[0.015]'}`}>
                          <td className="px-5 py-3 text-white/40 text-[11px]">{row.label}</td>
                          {scenarios.map(s => {
                            const val      = row.getValue(s)
                            const isBest   = Number(val) === Number(best) && scenarios.length > 1
                            const isBool   = typeof val === 'boolean'
                            const rank     = rankOf(s.id)
                            const cellColor = isBool
                              ? (val ? SAGE : RED)
                              : isBest
                                ? (rank === 1 ? GOLD : rank === 2 ? '#C0C0C0' : rank === 3 ? '#CD7F32' : s.color)
                                : '#ffffff50'
                            return (
                              <td key={s.id} className="px-4 py-3 text-center">
                                <span className="font-mono text-[12px] font-medium" style={{ color: cellColor }}>
                                  {row.format(val as any)}
                                  {isBest && !isBool && <span className="ml-1 text-[8px]">★</span>}
                                </span>
                              </td>
                            )
                          })}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Scenario cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {scenarios.map(s => {
                const r         = results.find(res => res.id === s.id)!
                const isEditing = editing === s.id
                const rank      = rankOf(s.id)
                const medal     = rank <= 3 && scenarios.length >= 2 ? MEDALS[rank - 1] : null
                const isWinner  = rank === 1 && scenarios.length >= 2
                return (
                  <div
                    key={s.id}
                    className="bg-[#141C28] border border-white/[0.07] rounded-xl overflow-hidden"
                    style={{ borderTopColor: s.isActive ? SAGE : isWinner ? GOLD : s.color, borderTopWidth: s.isActive || isWinner ? 3 : 2 }}
                  >
                    <div className="px-5 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        {medal
                          ? <span className="text-base leading-none">{medal}</span>
                          : <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                        }
                        <div>
                          <span className="font-syne font-semibold text-[14px] leading-tight" style={{ color: isWinner ? GOLD : 'white' }}>
                            {s.name}
                          </span>
                          {s.isActive && (
                            <div className="font-mono text-[8px] tracking-widest uppercase text-[#4ADE80] mt-0.5">
                              ⭐ Active Scenario
                            </div>
                          )}
                          {isWinner && !s.isActive && (
                            <div className="font-mono text-[8px] tracking-widest uppercase text-[#E8B84B]/60 mt-0.5">
                              Recommended
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {/* Set Active button */}
                        <button
                          onClick={() => activateScenario(s.id)}
                          disabled={activating === s.id || s.isActive}
                          className="font-mono text-[8px] tracking-widest uppercase px-2.5 py-1 rounded border transition-colors"
                          style={s.isActive
                            ? { borderColor: SAGE, color: SAGE }
                            : { borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)' }
                          }
                        >
                          {s.isActive ? '✓ Active' : activating === s.id ? '...' : 'Set Active'}
                        </button>
                        <button
                          onClick={() => setEditing(isEditing ? null : s.id)}
                          className="font-mono text-[8px] tracking-widest uppercase px-2.5 py-1 rounded border transition-colors"
                          style={isEditing
                            ? { borderColor: s.color, color: s.color }
                            : { borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)' }
                          }
                        >
                          {isEditing ? 'Done' : 'Edit'}
                        </button>
                        <button
                          onClick={() => deleteScenario(s.id)}
                          className="font-mono text-[8px] tracking-widest uppercase px-2.5 py-1 rounded border border-white/[0.08] text-white/20 hover:text-red-400 hover:border-red-400/30 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="px-5 pb-4 grid grid-cols-2 gap-2">
                      {[
                        { label: 'Retire', value: `Age ${s.inputs.retireAge}`,       color: 'white' },
                        { label: 'W/R',    value: r.withdrawalRate.toFixed(1) + '%', color: r.withdrawalRate > 4 ? RED : SAGE },
                        { label: 'At 80',  value: fmt(r.totalAt80),                  color: r.totalAt80 > 0 ? TEAL : RED },
                        { label: 'At 90',  value: fmt(r.totalAt90),                  color: r.totalAt90 > 0 ? SAGE : RED },
                      ].map(m => (
                        <div key={m.label} className="bg-black/30 rounded-lg p-2.5 text-center">
                          <div className="font-mono font-bold text-[13px] mb-0.5" style={{ color: m.color }}>{m.value}</div>
                          <div className="font-mono text-[7px] tracking-widest uppercase text-white/25">{m.label}</div>
                        </div>
                      ))}
                    </div>

                    <div className={`mx-5 mb-4 rounded-lg px-3 py-2 text-center ${r.funded ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                      <span className="font-mono text-[9px] tracking-widest uppercase" style={{ color: r.funded ? SAGE : RED }}>
                        {r.funded ? '✓ Funded to age 90' : `⚠ Depletes at age ${r.depleted}`}
                      </span>
                    </div>

                    <div className="px-5 pb-1 text-right">
                      <span className="font-mono text-[8px] text-white/15">Saved {s.createdAt}</span>
                    </div>

                    {isEditing && (
                      <div className="border-t border-white/[0.07] px-5 py-4">
                        <ScenarioForm
                          inputs={s.inputs}
                          onChange={(key) => (e) => {
                            const updated = { ...s.inputs, [key]: parseFloat(e.target.value) || 0 }
                            updateScenario(s.id, updated, s.name)
                          }}
                        />
                      </div>
                    )}
                  </div>
                )
              })}

              {scenarios.length < MAX_SCENARIOS && !showNew && (
                <button
                  onClick={() => { setShowNew(true); setNewName(PRESET_NAMES[scenarios.length] ?? 'My Scenario') }}
                  className="bg-[#141C28] border border-white/[0.07] border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 hover:border-[#E8B84B]/30 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-[#E8B84B]/30 transition-colors">
                    <span className="text-white/30 text-xl group-hover:text-[#E8B84B]/60 transition-colors">+</span>
                  </div>
                  <span className="font-mono text-[9px] tracking-widest uppercase text-white/25 group-hover:text-[#E8B84B]/50 transition-colors">
                    Add Scenario ({scenarios.length}/{MAX_SCENARIOS})
                  </span>
                </button>
              )}
            </div>

            {/* Next step callout */}
            <div className="bg-[#2DD4BF]/5 border border-[#2DD4BF]/20 rounded-xl px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <div className="font-mono text-[9px] tracking-widest uppercase text-[#2DD4BF] mb-1">Recommended Next</div>
                <p className="text-white/60 text-[13px]">Compare is complete. Now stress-test your strongest scenario.</p>
              </div>
              <Link href="/sequence-tester" className="shrink-0 bg-[#2DD4BF]/10 border border-[#2DD4BF]/30 text-[#2DD4BF] font-mono text-[10px] tracking-widest uppercase px-5 py-2.5 rounded-lg hover:bg-[#2DD4BF]/20 transition-colors">
                Run Stress Test →
              </Link>
            </div>
          </>
        )}
      </div>

      <ProNav />
    </div>
  )
}