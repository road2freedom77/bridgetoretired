'use client'

import { useEffect, useState } from 'react'

interface Scenario {
  id: string
  name: string
  updated_at: string
  monte_carlo_success: number | null
  withdrawal_rate: number | null
  portfolio_at_90: number | null
  is_active: boolean
}

interface Props {
  activeScenarioId: string | null
  onLoad: (scenario: any) => void
  onNew: () => void
  onActivated?: () => void
}

export default function ScenarioSidebar({ activeScenarioId, onLoad, onNew, onActivated }: Props) {
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [loading, setLoading] = useState(true)
  const [activating, setActivating] = useState<string | null>(null)

  const fetchScenarios = async () => {
    try {
      const res = await fetch('/api/planner/scenarios')
      const data = await res.json()
      if (data.scenarios) setScenarios(data.scenarios)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchScenarios() }, [activeScenarioId])

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Delete this scenario?')) return
    await fetch(`/api/planner/scenarios/${id}`, { method: 'DELETE' })
    fetchScenarios()
  }

  const handleSetActive = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setActivating(id)
    try {
      await fetch(`/api/planner/scenarios/${id}/activate`, { method: 'PATCH' })
      await fetchScenarios()
      onActivated?.()
    } catch (err) {
      console.error(err)
    } finally {
      setActivating(null)
    }
  }

  const successColor = (rate: number) => {
    const pct = Math.round(rate * 100)
    if (pct >= 90) return 'text-green-400'
    if (pct >= 75) return 'text-amber-400'
    return 'text-red-400'
  }

  return (
    <div className="w-56 shrink-0 border-r border-white/[0.06] min-h-[calc(100vh-56px)] p-4">
      <button
        onClick={onNew}
        className="w-full bg-gold/10 border border-gold/20 text-gold font-mono text-[10px] tracking-widest uppercase py-2.5 rounded-lg hover:bg-gold/20 transition-colors mb-4"
      >
        + New Scenario
      </button>

      <div className="font-mono text-[8px] tracking-widest uppercase text-white/20 mb-3">
        Saved Scenarios ({scenarios.length}/5)
      </div>

      {loading ? (
        <div className="font-mono text-[10px] text-white/20">Loading...</div>
      ) : scenarios.length === 0 ? (
        <div className="font-mono text-[10px] text-white/20 leading-relaxed">
          No saved scenarios yet. Enter your numbers and click Save.
        </div>
      ) : (
        <div className="space-y-2">
          {scenarios.map(s => {
            const isLoaded = activeScenarioId === s.id
            const isActive = s.is_active === true
            const isActivating = activating === s.id

            return (
              <div
                key={s.id}
                onClick={() => onLoad(s)}
                className={`rounded-lg p-3 cursor-pointer border transition-colors group ${
                  isLoaded
                    ? 'bg-gold/10 border-gold/30'
                    : 'bg-ink border-white/[0.06] hover:border-white/20'
                }`}
              >
                {/* Name row */}
                <div className="flex items-start justify-between gap-1 mb-1.5">
                  <div className="font-syne font-semibold text-[12px] text-white leading-tight">
                    {s.name}
                  </div>
                  <button
                    onClick={e => handleDelete(s.id, e)}
                    className="text-white/20 hover:text-red-400 transition-colors text-[14px] leading-none shrink-0 opacity-0 group-hover:opacity-100"
                  >
                    ×
                  </button>
                </div>

                {/* MC + At 90 */}
                {s.monte_carlo_success != null && (
                  <div className={`font-mono text-[10px] font-bold ${successColor(s.monte_carlo_success)}`}>
                    {Math.round(s.monte_carlo_success * 100)}% MC
                  </div>
                )}
                {s.portfolio_at_90 != null && (
                  <div className="font-mono text-[9px] text-white/30 mt-0.5">
                    ${(s.portfolio_at_90 / 1_000_000).toFixed(1)}M at 90
                  </div>
                )}

                <div className="font-mono text-[8px] text-white/20 mt-1">
                  {new Date(s.updated_at).toLocaleDateString()}
                </div>

                {/* Set Active button */}
                <div className="mt-2 pt-2 border-t border-white/[0.06]">
                  {isActive ? (
                    <div className="flex items-center gap-1">
                      <span className="text-[9px]">⭐</span>
                      <span className="font-mono text-[8px] tracking-widest uppercase text-gold/70">
                        Active
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={e => handleSetActive(s.id, e)}
                      disabled={isActivating}
                      className="font-mono text-[8px] tracking-widest uppercase text-white/25 hover:text-gold/70 transition-colors disabled:opacity-40"
                    >
                      {isActivating ? 'Setting...' : '☆ Set Active'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}