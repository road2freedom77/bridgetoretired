'use client'

import { useUser } from '@clerk/nextjs'
import { useEffect, useState, useCallback, useRef } from 'react'
import { PlannerInputs, PlannerResults } from '@/lib/planner/types'
import InputsForm from '@/components/planner/InputsForm'
import ResultsDashboard from '@/components/planner/ResultsDashboard'
import ScenarioSidebar from '@/components/planner/ScenarioSidebar'
import ActiveScenarioBar from '@/components/ActiveScenarioBar'
import Link from 'next/link'
import { trackScenarioSave } from '@/lib/analytics'

const DEFAULT_INPUTS: PlannerInputs = {
  currentAge: 50,
  retireAge: 55,
  ssAge: 67,
  lifeExpectancy: 90,
  filingStatus: 'MFJ',
  state: 'TX',
  stateTaxRate: 0,
  taxable: 350000,
  k401: 650000,
  roth: 150000,
  cash: 75000,
  spending: 50000,
  inflation: 0.025,
  otherIncome: 0,
  ssBenefit: 24000,
  returnRate: 0.065,
  volatility: 0.12,
}

export default function PlannerPage() {
  const { user, isLoaded } = useUser()
  const isPro = user?.publicMetadata?.isPro === true

  const [inputs, setInputs] = useState<PlannerInputs>(DEFAULT_INPUTS)
  const [results, setResults] = useState<PlannerResults | null>(null)
  const [calculating, setCalculating] = useState(false)
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null)
  const [scenarioName, setScenarioName] = useState('My Plan')
  const [editingName, setEditingName] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [saveMsgType, setSaveMsgType] = useState<'success' | 'error'>('success')

  // Ref to trigger ActiveScenarioBar refetch without remounting it
  const barRefetchRef = useRef<(() => void) | null>(null)

  const calculate = useCallback(async (inp: PlannerInputs) => {
    setCalculating(true)
    try {
      const res = await fetch('/api/planner/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inp),
      })
      const data = await res.json()
      if (data.success) setResults(data.results)
    } catch (err) {
      console.error(err)
    } finally {
      setCalculating(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => calculate(inputs), 600)
    return () => clearTimeout(timer)
  }, [inputs, calculate])

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    setSaveMsg('')
    try {
      const url = activeScenarioId
        ? `/api/planner/scenarios/${activeScenarioId}`
        : '/api/planner/scenarios'
      const method = activeScenarioId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: scenarioName,
          email: user.primaryEmailAddress?.emailAddress,
          inputs,
          results,
        }),
      })
      const data = await res.json()
      if (data.scenario) {
        setActiveScenarioId(data.scenario.id)
        setSaveMsg('✓ Saved')
        setSaveMsgType('success')
        trackScenarioSave('planner', !activeScenarioId)
      } else {
        setSaveMsg(data.error || 'Failed to save')
        setSaveMsgType('error')
      }
    } catch {
      setSaveMsg('Failed to save')
      setSaveMsgType('error')
    } finally {
      setSaving(false)
      setTimeout(() => setSaveMsg(''), 3000)
    }
  }

  const handleLoadScenario = (scenario: any) => {
    const inp: PlannerInputs = {
      currentAge: scenario.current_age,
      retireAge: scenario.retire_age,
      ssAge: scenario.ss_age,
      lifeExpectancy: scenario.life_expectancy,
      filingStatus: scenario.filing_status,
      state: scenario.state,
      stateTaxRate: scenario.state_tax_rate,
      taxable: scenario.taxable,
      k401: scenario.k401,
      roth: scenario.roth,
      cash: scenario.cash,
      spending: scenario.spending,
      inflation: scenario.inflation,
      otherIncome: scenario.other_income,
      ssBenefit: scenario.ss_benefit,
      returnRate: scenario.return_rate,
      volatility: scenario.volatility,
    }
    setInputs(inp)
    setActiveScenarioId(scenario.id)
    setScenarioName(scenario.name)
    setEditingName(false)
  }

  const handleNewScenario = () => {
    setInputs(DEFAULT_INPUTS)
    setActiveScenarioId(null)
    setScenarioName('My Plan')
    setResults(null)
    setEditingName(false)
  }

  // Called by sidebar after a scenario is set active — refetches the bar
  const handleActivated = useCallback(() => {
    barRefetchRef.current?.()
  }, [])

  if (!isLoaded) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="font-mono text-[11px] tracking-widest uppercase text-white/30">
        Loading...
      </div>
    </div>
  )

  if (!isPro) return (
    <div className="min-h-screen bg-black flex items-center justify-center px-5">
      <div className="max-w-md text-center">
        <div className="text-4xl mb-6">🔒</div>
        <div className="font-mono text-[9px] tracking-widest uppercase text-gold mb-3">
          Pro Feature
        </div>
        <h1 className="font-syne font-bold text-[28px] text-white mb-4">
          Online Planner is Pro Only
        </h1>
        <p className="text-white/45 text-[14px] leading-relaxed mb-8">
          Save up to 5 retirement scenarios, run Monte Carlo simulation, and access
          your plan from anywhere. Upgrade to Pro to unlock the full planning system.
        </p>
        <div className="flex flex-col gap-3">
          <Link href="/pricing" className="bg-gold text-black font-syne font-semibold text-[13px] tracking-wide px-8 py-3 rounded hover:opacity-85 transition-opacity">
            Upgrade to Pro →
          </Link>
          <Link href="/#download" className="border border-white/[0.12] text-white/50 font-mono text-[10px] tracking-widest uppercase px-8 py-3 rounded hover:border-white/25 transition-colors">
            Download Free Planner Instead
          </Link>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-black">
      {/* Sticky header */}
      <div className="bg-navy border-b border-white/[0.06] sticky top-0 z-40">
        <div className="max-w-[1400px] mx-auto px-5 h-14 flex items-center justify-between">

          <div className="flex items-center gap-4">
            <Link href="/" className="font-mono text-[10px] tracking-widest uppercase text-white/30 hover:text-gold transition-colors shrink-0">
              ← Home
            </Link>
            <span className="text-white/10">|</span>

            {editingName ? (
              <input
                autoFocus
                value={scenarioName}
                onChange={e => setScenarioName(e.target.value)}
                onBlur={() => setEditingName(false)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === 'Escape') setEditingName(false)
                }}
                className="bg-white/[0.06] border border-gold/40 rounded px-3 py-1 font-syne font-semibold text-[13px] text-white outline-none w-56"
              />
            ) : (
              <button
                onClick={() => setEditingName(true)}
                className="group flex items-center gap-2 hover:opacity-80 transition-opacity"
                title="Click to rename"
              >
                <span className="font-syne font-semibold text-[14px] text-white">
                  {scenarioName}
                </span>
                <span className="font-mono text-[9px] text-white/20 group-hover:text-gold/60 transition-colors">
                  ✎ rename
                </span>
              </button>
            )}

            {calculating && (
              <span className="font-mono text-[9px] tracking-widest uppercase text-gold/60 animate-pulse shrink-0">
                Calculating...
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {saveMsg && (
              <span className={`font-mono text-[10px] ${saveMsgType === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                {saveMsg}
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={saving || !results}
              className="bg-gold text-black font-syne font-semibold text-[11px] tracking-wide px-4 py-2 rounded hover:opacity-85 transition-opacity disabled:opacity-40"
            >
              {saving ? 'Saving...' : activeScenarioId ? 'Update Scenario' : 'Save Scenario'}
            </button>
          </div>
        </div>
      </div>

      {/* Active Scenario Bar — exposes refetch via callback ref */}
      <ActiveScenarioBar onRegisterRefetch={fn => { barRefetchRef.current = fn }} />

      <div className="max-w-[1400px] mx-auto flex">
        {/* Scenario sidebar */}
        <ScenarioSidebar
          activeScenarioId={activeScenarioId}
          onLoad={handleLoadScenario}
          onNew={handleNewScenario}
          onActivated={handleActivated}
        />

        {/* Main content */}
        <div className="flex-1 min-w-0 p-6 flex gap-6">
          <div className="w-72 shrink-0">
            <InputsForm inputs={inputs} onChange={setInputs} />
          </div>
          <div className="flex-1 min-w-0">
            {results ? (
              <ResultsDashboard results={results} inputs={inputs} />
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="font-mono text-[11px] tracking-widest uppercase text-white/20">
                  {calculating ? 'Calculating your plan...' : 'Enter your numbers to see results'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}