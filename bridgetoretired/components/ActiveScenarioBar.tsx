'use client'

import { useEffect, useState, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'

const GOLD  = '#E8B84B'
const SAGE  = '#4ADE80'
const RED   = '#F87171'
const TEAL  = '#2DD4BF'

interface ActiveScenario {
  id:                  string
  name:                string
  retire_age:          number
  withdrawal_rate:     number | null
  portfolio_at_90:     number | null
  monte_carlo_success: number | null
  risk_flags:          any
  updated_at:          string
}

interface Props {
  // Optional: parent can register a refetch callback to trigger bar updates
  // e.g. after setting a scenario active from the sidebar
  onRegisterRefetch?: (refetch: () => void) => void
}

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000)     return `$${Math.round(n / 1_000)}k`
  return `$${Math.round(n)}`
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86_400_000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7)  return `${days} days ago`
  return new Date(dateStr).toLocaleDateString()
}

export default function ActiveScenarioBar({ onRegisterRefetch }: Props) {
  const { user, isLoaded } = useUser()
  const isPro = user?.publicMetadata?.isPro === true

  const [scenario,  setScenario]  = useState<ActiveScenario | null>(null)
  const [loading,   setLoading]   = useState(true)
  const [collapsed, setCollapsed] = useState(false)

  const fetchActive = useCallback(async () => {
    try {
      const res  = await fetch('/api/planner/scenarios')
      const data = await res.json()
      if (data.scenarios) {
        const active = data.scenarios.find((s: any) => s.is_active === true)
        setScenario(active ?? null)
      }
    } catch (err) {
      console.error('ActiveScenarioBar fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Register refetch with parent so it can trigger bar updates (e.g. after Set Active)
  useEffect(() => {
    onRegisterRefetch?.(fetchActive)
  }, [fetchActive, onRegisterRefetch])

  useEffect(() => {
    if (isLoaded && isPro) fetchActive()
    else if (isLoaded) setLoading(false)
  }, [isLoaded, isPro, fetchActive])

  if (!isLoaded || !isPro || loading) return null

  if (!scenario) {
    return (
      <div className="w-full bg-[#0D1420] border-b border-[#E8B84B]/10">
        <div className="max-w-7xl mx-auto px-5 h-10 flex items-center gap-3">
          <span className="font-mono text-[9px] tracking-widest uppercase text-white/20">Active Scenario</span>
          <span className="text-white/15 text-[10px]">—</span>
          <span className="font-mono text-[10px] text-white/25">None set</span>
          <Link
            href="/scenario-compare"
            className="ml-auto font-mono text-[9px] tracking-widest uppercase text-[#E8B84B]/50 hover:text-[#E8B84B] transition-colors"
          >
            Set Active Scenario →
          </Link>
        </div>
      </div>
    )
  }

  const mc      = scenario.monte_carlo_success
  const wr      = scenario.withdrawal_rate
  const at90    = scenario.portfolio_at_90
  // successRate is stored as 0–1 decimal (e.g. 0.83). Threshold and display both need * 100.
  const mcPass  = mc !== null && mc >= 0.80
  const wrSafe  = wr !== null && wr <= 4
  const source  = scenario.risk_flags?._source
  const isPlanner = source !== 'compare'

  if (collapsed) {
    return (
      <div className="w-full bg-[#0D1420] border-b border-[#E8B84B]/15">
        <div className="max-w-7xl mx-auto px-5 h-10 flex items-center gap-3">
          <span className="text-[10px]">⭐</span>
          <span className="font-mono text-[9px] tracking-widest uppercase text-[#E8B84B]/60">Active</span>
          <span className="font-syne font-semibold text-white text-[12px]">{scenario.name}</span>
          <span className="font-mono text-[10px] text-white/25">· Retire {scenario.retire_age}</span>
          {mc !== null && isPlanner && (
            <span className="font-mono text-[10px]" style={{ color: mcPass ? SAGE : RED }}>
              · {Math.round(mc * 100)}% MC
            </span>
          )}
          <button
            onClick={() => setCollapsed(false)}
            className="ml-auto font-mono text-[9px] tracking-widest uppercase text-white/20 hover:text-white/50 transition-colors"
          >
            expand ↓
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full bg-[#0D1420] border-b border-[#E8B84B]/15">
      <div className="max-w-7xl mx-auto px-5 py-2.5 flex items-center gap-5 flex-wrap">

        {/* Label + name */}
        <div className="flex items-center gap-2.5 shrink-0">
          <span className="text-[11px]">⭐</span>
          <div>
            <div className="font-mono text-[8px] tracking-widest uppercase text-[#E8B84B]/50 leading-none mb-0.5">Active Scenario</div>
            <div className="font-syne font-semibold text-white text-[13px] leading-none">{scenario.name}</div>
          </div>
        </div>

        <div className="w-px h-6 bg-white/[0.08] shrink-0" />

        {/* Stats */}
        <div className="flex items-center gap-4 flex-wrap">
          <Stat label="Retire Age" value={`${scenario.retire_age}`} color="white" />

          {wr !== null && (
            <Stat label="W/R" value={`${wr.toFixed(1)}%`} color={wrSafe ? SAGE : RED} />
          )}

          {at90 !== null && (
            <Stat label="At 90" value={fmt(at90)} color={at90 > 0 ? TEAL : RED} />
          )}

          {mc !== null && isPlanner && (
            <Stat label="Monte Carlo" value={`${Math.round(mc * 100)}%`} color={mcPass ? SAGE : RED} />
          )}

          <Stat label="Updated" value={timeAgo(scenario.updated_at)} color="rgba(255,255,255,0.3)" />
        </div>

        {/* Actions */}
        <div className="ml-auto flex items-center gap-3 shrink-0">
          <Link
            href="/pro/planner"
            className="font-mono text-[9px] tracking-widest uppercase text-[#2DD4BF]/60 hover:text-[#2DD4BF] transition-colors"
          >
            Edit →
          </Link>
          <Link
            href="/scenario-compare"
            className="font-mono text-[9px] tracking-widest uppercase text-white/20 hover:text-white/50 transition-colors"
          >
            Switch
          </Link>
          <button
            onClick={() => setCollapsed(true)}
            className="font-mono text-[9px] tracking-widest uppercase text-white/15 hover:text-white/35 transition-colors"
          >
            ↑
          </button>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div>
      <div className="font-mono text-[7px] tracking-widest uppercase text-white/25 leading-none mb-0.5">{label}</div>
      <div className="font-mono font-semibold text-[11px] leading-none" style={{ color }}>{value}</div>
    </div>
  )
}