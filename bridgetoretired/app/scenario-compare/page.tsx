'use client'

import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { ProNav } from '@/components/ProNav'
import { scenarioInputFromDbRow, scenarioInputToDbColumns } from '@/lib/planner/types'
import type { ScenarioInput } from '@/lib/planner/types'
import { getCompareMetrics } from '@/lib/retirement/projection'
import {
  scoreScenarios,
  getWinnerId,
  GOAL_LABELS,
  type GoalMode,
  type CompareMetrics,
  type ScoredScenario,
} from '@/lib/retirement/scoring'
import { buildInsights, type Insight } from '@/lib/retirement/insights'
import { trackScenarioSave, trackScenarioCompare } from '@/lib/analytics'

// ─── Design tokens ────────────────────────────────────────────────────────────

const GOLD   = '#E8B84B'
const SAGE   = '#4ADE80'
const RED    = '#F87171'
const TEAL   = '#2DD4BF'
const BLUE   = '#60A5FA'
const PURPLE = '#A78BFA'

const SCENARIO_COLORS = [GOLD, TEAL, SAGE, BLUE, PURPLE]
const MAX_SCENARIOS = 5
const MEDALS = ['🥇', '🥈', '🥉']

// ─── Compare-form fields ──────────────────────────────────────────────────────
// The compare form exposes a simplified subset of ScenarioInput.
// All omitted fields use sensible defaults when mapping to ScenarioInput.

interface CompareFormInputs {
  retireAge:      number
  portfolio:      number
  taxable:        number
  annualSpending: number
  inflationRate:  number  // display as %, e.g. 2.5
  returnRate:     number  // display as %, e.g. 6.5
  ssAge:          number
  ssIncome:       number
  partTimeIncome: number
  partTimeYears:  number
  healthcareCost: number
}

interface Scenario {
  id:        string
  name:      string
  color:     string
  inputs:    CompareFormInputs
  rawInput:  ScenarioInput  // canonical typed input for engine
  createdAt: string
  isActive:  boolean
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_FORM: CompareFormInputs = {
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

// ─── Mappers ──────────────────────────────────────────────────────────────────

function formToScenarioInput(form: CompareFormInputs): ScenarioInput {
  return {
    currentAge:     45,
    retireAge:      form.retireAge,
    ssAge:          form.ssAge,
    lifeExpectancy: 90,
    filingStatus:   'MFJ',
    state:          'TX',
    stateTaxRate:   0,
    taxable:        form.taxable,
    k401:           Math.max(0, form.portfolio - form.taxable),
    roth:           0,
    cash:           0,
    spending:       form.annualSpending + form.healthcareCost,
    inflation:      form.inflationRate / 100,
    otherIncome:    form.partTimeIncome,
    ssBenefit:      form.ssIncome,
    returnRate:     form.returnRate / 100,
    volatility:     0.12,
    partTimeIncome: form.partTimeIncome,
    partTimeYears:  form.partTimeYears,
    healthcareCost: form.healthcareCost,
  }
}

function dbRowToFormInputs(row: Record<string, any>): CompareFormInputs {
  const si = scenarioInputFromDbRow(row)
  const healthcareCost = si.healthcareCost ?? 8_400
  return {
    retireAge:      si.retireAge,
    portfolio:      si.taxable + si.k401 + si.roth + (si.cash ?? 0),
    taxable:        si.taxable,
    annualSpending: Math.max(0, si.spending - healthcareCost),
    inflationRate:  si.inflation * 100,
    returnRate:     si.returnRate * 100,
    ssAge:          si.ssAge,
    ssIncome:       si.ssBenefit,
    partTimeIncome: si.partTimeIncome ?? si.otherIncome ?? 0,
    partTimeYears:  si.partTimeYears ?? 0,
    healthcareCost,
  }
}

function colorForIndex(idx: number) {
  return SCENARIO_COLORS[idx % SCENARIO_COLORS.length]
}

// ─── Formatters ───────────────────────────────────────────────────────────────

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000)     return `$${Math.round(n / 1000)}k`
  return `$${Math.round(n)}`
}

// ─── Severity color ───────────────────────────────────────────────────────────

function severityColor(severity: string): string {
  switch (severity) {
    case 'positive': return SAGE
    case 'caution':  return RED
    default:         return GOLD
  }
}

function severityIcon(severity: string): string {
  switch (severity) {
    case 'positive': return '✓'
    case 'caution':  return '⚠'
    default:         return '→'
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function InputRow({ label, field, min, max, step, isCurrency = false, inputs, onChange }: {
  label: string; field: keyof CompareFormInputs; min: number; max: number; step: number
  isCurrency?: boolean; inputs: CompareFormInputs; onChange: (k: keyof CompareFormInputs) => (e: any) => void
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
  inputs: CompareFormInputs; onChange: (k: keyof CompareFormInputs) => (e: any) => void
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

// ─── Goal Selector ────────────────────────────────────────────────────────────

function GoalSelector({ goal, onChange }: { goal: GoalMode; onChange: (g: GoalMode) => void }) {
  const goals = Object.entries(GOAL_LABELS) as [GoalMode, string][]
  return (
    <div className="flex flex-wrap gap-2">
      {goals.map(([key, label]) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className="font-mono text-[9px] tracking-widest uppercase px-3 py-2 rounded-lg border transition-all"
          style={goal === key
            ? { borderColor: GOLD, color: GOLD, background: `${GOLD}15` }
            : { borderColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.35)' }
          }
        >
          {label}
        </button>
      ))}
    </div>
  )
}

// ─── Insights Panel ───────────────────────────────────────────────────────────

function InsightsPanel({ insights }: { insights: Insight[] }) {
  if (insights.length === 0) return null
  return (
    <div className="space-y-2">
      {insights.map((insight, i) => (
        <div key={i} className="flex items-start gap-2.5">
          <span className="text-[11px] mt-0.5 shrink-0" style={{ color: severityColor(insight.severity) }}>
            {severityIcon(insight.severity)}
          </span>
          <div className="flex-1">
            <span className="text-white/65 text-[13px] leading-snug">{insight.copyKey}</span>
          </div>
        </div>
      ))}
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
  const [draft,       setDraft]       = useState<CompareFormInputs>(DEFAULT_FORM)
  const [showNew,     setShowNew]     = useState(false)
  const [toast,       setToast]       = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [goal,        setGoal]        = useState<GoalMode>('overall')

  // Fire compare event once per session when ≥2 scenarios are loaded
  useEffect(() => {
    if (scenarios.length >= 2) {
      trackScenarioCompare(scenarios.length, goal)
    }
  }, [scenarios.length >= 2])

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
          (s: any) => (s.source === 'compare') || (s.risk_flags?._source === 'compare')
        )
        const mapped: Scenario[] = compareScenarios.map((s: any, idx: number) => {
          const formInputs = dbRowToFormInputs(s)
          return {
            id:        s.id,
            name:      s.name,
            color:     colorForIndex(idx),
            inputs:    formInputs,
            rawInput:  formToScenarioInput(formInputs),
            createdAt: new Date(s.created_at).toLocaleDateString(),
            isActive:  s.is_active === true,
          }
        })
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

  // ── Derived state (shared engine) ──────────────────────────────────────────

  const metrics: CompareMetrics[] = scenarios.map(s =>
    getCompareMetrics(s.id, s.rawInput)
  )

  const scores: ScoredScenario[] = scenarios.length >= 2
    ? scoreScenarios(metrics, goal)
    : scenarios.length === 1
      ? [{ id: scenarios[0].id, score: 100, rank: 1 }]
      : []

  const winnerId = getWinnerId(scores)
  const winner   = scenarios.find(s => s.id === winnerId) ?? null
  const winnerMetrics = metrics.find(m => m.id === winnerId) ?? null

  const insights: Insight[] = winner
    ? buildInsights(winnerId!, winner.name, metrics, goal)
    : []

  const rankOf   = (id: string) => scores.find(s => s.id === id)?.rank ?? 99
  const scoreOf  = (id: string) => scores.find(s => s.id === id)?.score ?? 0
  const metricOf = (id: string) => metrics.find(m => m.id === id)

  // ── Preview metrics for new scenario form ─────────────────────────────────

  const draftRawInput = formToScenarioInput(draft)
  const draftMetrics  = getCompareMetrics('draft', draftRawInput)

  // ── Actions ────────────────────────────────────────────────────────────────

  const saveScenario = async () => {
    if (!newName.trim() || !user) return
    setSaving(true)
    try {
      const rawInput = formToScenarioInput(draft)
      const m = getCompareMetrics('new', rawInput)
      const res = await fetch('/api/planner/scenarios', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          name:   newName.trim(),
          email:  user.primaryEmailAddress?.emailAddress,
          source: 'compare',
          inputs: rawInput,
          results: {
            withdrawalRate: m.withdrawalRate / 100,
            portfolioAt90:  m.totalAt90,
            monteCarlo:     { successRate: m.monteCarloSuccess },
            riskFlags:      null,
          },
        }),
      })
      const data = await res.json()
      if (data.error) {
        showToast(data.error, 'error')
      } else {
        showToast('Scenario saved')
        trackScenarioSave('compare', true)
        setShowNew(false)
        setNewName('')
        setDraft(DEFAULT_FORM)
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

  const updateScenario = async (id: string, formInputs: CompareFormInputs, name: string) => {
    const rawInput = formToScenarioInput(formInputs)
    setScenarios(prev => prev.map(s =>
      s.id === id ? { ...s, inputs: formInputs, rawInput } : s
    ))
    try {
      const m = getCompareMetrics(id, rawInput)
      await fetch(`/api/planner/scenarios/${id}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          name,
          source: 'compare',
          inputs: rawInput,
          results: {
            withdrawalRate: m.withdrawalRate / 100,
            portfolioAt90:  m.totalAt90,
            monteCarlo:     { successRate: m.monteCarloSuccess },
            riskFlags:      null,
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
        setScenarios(prev => prev.map(s => ({ ...s, isActive: s.id === id })))
        showToast('✓ Active scenario set')
      }
    } catch {
      showToast('Failed to set active', 'error')
    } finally {
      setActivating(null)
    }
  }

  const setDraftField = (key: keyof CompareFormInputs) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setDraft(prev => ({ ...prev, [key]: parseFloat(e.target.value) || 0 }))
  }

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
                  <div className="space-y-3">
                    <div className="bg-black/30 rounded-xl p-4 grid grid-cols-2 gap-3">
                      {[
                        { label: 'Bridge Years',    value: draftMetrics.bridgeYears.toFixed(1),             color: draftMetrics.bridgeYears > 10 ? RED : GOLD },
                        { label: 'Withdrawal Rate', value: draftMetrics.withdrawalRate.toFixed(1) + '%',   color: draftMetrics.withdrawalRate > 4 ? RED : SAGE },
                        { label: 'At Age 80',       value: fmt(draftMetrics.totalAt80),                     color: draftMetrics.totalAt80 > 0 ? TEAL : RED },
                        { label: 'At Age 90',       value: fmt(draftMetrics.totalAt90),                     color: draftMetrics.totalAt90 > 0 ? SAGE : RED },
                      ].map(m => (
                        <div key={m.label} className="text-center">
                          <div className="font-mono font-bold text-[15px] mb-0.5" style={{ color: m.color }}>{m.value}</div>
                          <div className="font-mono text-[8px] tracking-widest uppercase text-white/25">{m.label}</div>
                        </div>
                      ))}
                    </div>
                    <div className={`rounded-xl p-3 text-center ${draftMetrics.funded ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                      <span className="font-mono text-[10px] tracking-widest uppercase" style={{ color: draftMetrics.funded ? SAGE : RED }}>
                        {draftMetrics.funded ? '✓ Funded to age 90' : `⚠ Depletes at age ${draftMetrics.depleted}`}
                      </span>
                    </div>
                    {draftMetrics.monteCarloSuccess !== null && (
                      <div className="bg-black/20 rounded-xl p-3 text-center">
                        <span className="font-mono text-[10px] tracking-widest uppercase text-white/40">
                          Monte Carlo: <span style={{ color: draftMetrics.monteCarloSuccess >= 80 ? SAGE : draftMetrics.monteCarloSuccess >= 60 ? GOLD : RED }}>{draftMetrics.monteCarloSuccess}%</span> success
                        </span>
                      </div>
                    )}
                  </div>
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
            {/* Goal selector */}
            {scenarios.length >= 2 && (
              <div className="bg-[#0D1420] border border-white/[0.07] rounded-2xl px-6 py-5">
                <div className="font-mono text-[9px] tracking-widest uppercase text-white/30 mb-3">Optimize For</div>
                <GoalSelector goal={goal} onChange={setGoal} />
              </div>
            )}

            {/* Recommendation block */}
            {winner && winnerMetrics && scenarios.length >= 2 && (
              <div className="bg-[#0D1420] border border-[#E8B84B]/25 rounded-2xl overflow-hidden">
                <div className="bg-[#E8B84B]/8 px-6 py-4 flex items-center gap-3 border-b border-[#E8B84B]/15">
                  <span className="text-xl">⭐</span>
                  <div>
                    <div className="font-mono text-[9px] tracking-widest uppercase text-[#E8B84B]">
                      Best Fit for {GOAL_LABELS[goal]}
                    </div>
                    <div className="font-syne font-bold text-white text-[18px] mt-0.5">{winner.name}</div>
                  </div>
                  <div className="ml-auto flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-mono text-[9px] tracking-widest uppercase text-white/30 mb-0.5">Score</div>
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
                  <div className="font-mono text-[9px] tracking-widest uppercase text-white/30 mb-3">
                    Why this scenario wins for {GOAL_LABELS[goal].toLowerCase()}
                  </div>
                  <InsightsPanel insights={insights} />
                </div>
              </div>
            )}

            {/* Single-scenario insights */}
            {scenarios.length === 1 && insights.length > 0 && (
              <div className="bg-[#0D1420] border border-white/[0.07] rounded-2xl px-6 py-5">
                <div className="font-mono text-[9px] tracking-widest uppercase text-white/30 mb-3">Scenario Assessment</div>
                <InsightsPanel insights={insights} />
                <p className="text-white/25 text-[11px] mt-4">Add a second scenario to unlock full comparison and recommendations.</p>
              </div>
            )}

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
                      { label: 'Retire Age',      getValue: (s: Scenario) => s.inputs.retireAge,                        format: (v: any) => `${v}`,               isGoodHigh: false },
                      { label: 'Bridge Years',    getValue: (s: Scenario) => metricOf(s.id)?.bridgeYears ?? 0,         format: (v: any) => v.toFixed(1) + ' yrs', isGoodHigh: false },
                      { label: 'Portfolio',       getValue: (s: Scenario) => s.inputs.portfolio,                        format: fmt,                              isGoodHigh: true  },
                      { label: 'Annual Spending', getValue: (s: Scenario) => s.inputs.annualSpending,                   format: fmt,                              isGoodHigh: false },
                      { label: 'Withdrawal Rate', getValue: (s: Scenario) => metricOf(s.id)?.withdrawalRate ?? 0,      format: (v: any) => v.toFixed(1) + '%',   isGoodHigh: false },
                      { label: 'MC Success',      getValue: (s: Scenario) => metricOf(s.id)?.monteCarloSuccess ?? 0,   format: (v: any) => v + '%',              isGoodHigh: true  },
                      { label: 'SS Age',          getValue: (s: Scenario) => s.inputs.ssAge,                            format: (v: any) => `${v}`,               isGoodHigh: true  },
                      { label: 'Portfolio at 80', getValue: (s: Scenario) => metricOf(s.id)?.totalAt80 ?? 0,           format: fmt,                              isGoodHigh: true  },
                      { label: 'Portfolio at 90', getValue: (s: Scenario) => metricOf(s.id)?.totalAt90 ?? 0,           format: fmt,                              isGoodHigh: true  },
                      { label: 'Funded to 90?',   getValue: (s: Scenario) => metricOf(s.id)?.funded ?? false,          format: (v: any) => v ? '✓ Yes' : '✗ No', isGoodHigh: true  },
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
                const m         = metricOf(s.id)
                const isEditing = editing === s.id
                const rank      = rankOf(s.id)
                const medal     = rank <= 3 && scenarios.length >= 2 ? MEDALS[rank - 1] : null
                const isWinner  = rank === 1 && scenarios.length >= 2
                if (!m) return null
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
                              Best Fit
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
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
                        { label: 'Retire',  value: `Age ${s.inputs.retireAge}`,        color: 'white' },
                        { label: 'W/R',     value: m.withdrawalRate.toFixed(1) + '%',  color: m.withdrawalRate > 4 ? RED : SAGE },
                        { label: 'At 80',   value: fmt(m.totalAt80),                    color: m.totalAt80 > 0 ? TEAL : RED },
                        { label: 'At 90',   value: fmt(m.totalAt90),                    color: m.totalAt90 > 0 ? SAGE : RED },
                      ].map(met => (
                        <div key={met.label} className="bg-black/30 rounded-lg p-2.5 text-center">
                          <div className="font-mono font-bold text-[13px] mb-0.5" style={{ color: met.color }}>{met.value}</div>
                          <div className="font-mono text-[7px] tracking-widest uppercase text-white/25">{met.label}</div>
                        </div>
                      ))}
                    </div>

                    <div className={`mx-5 mb-4 rounded-lg px-3 py-2 text-center ${m.funded ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                      <span className="font-mono text-[9px] tracking-widest uppercase" style={{ color: m.funded ? SAGE : RED }}>
                        {m.funded ? '✓ Funded to age 90' : `⚠ Depletes at age ${m.depleted}`}
                      </span>
                    </div>

                    {m.monteCarloSuccess !== null && (
                      <div className="mx-5 mb-4 bg-black/20 rounded-lg px-3 py-2 text-center">
                        <span className="font-mono text-[9px] tracking-widest uppercase text-white/30">
                          MC: <span style={{ color: m.monteCarloSuccess >= 80 ? SAGE : m.monteCarloSuccess >= 60 ? GOLD : RED }}>{m.monteCarloSuccess}%</span>
                        </span>
                      </div>
                    )}

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