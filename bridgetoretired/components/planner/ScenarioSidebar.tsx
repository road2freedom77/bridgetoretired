'use client'

import { useEffect, useState } from 'react'

interface Scenario {
  id: string
  name: string
  updated_at: string
  monte_carlo_success: number
  withdrawal_rate: number
  portfolio_at_90: number
}

interface Props {
  activeScenarioId: string | null
  onLoad: (scenario: any) => void
  onNew: () => void
}

export default function ScenarioSidebar({ activeScenarioId, onLoad, onNew }: Props) {
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [loading, setLoading] = useState(true)

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
          {scenarios.map(s => (
            <div
              key={s.id}
              onClick={() => onLoad(s)}
              className={`rounded-lg p-3 cursor-pointer border transition-colors group ${
                activeScenarioId === s.id
                  ? 'bg-gold/10 border-gold/30'
                  : 'bg-ink border-white/[0.06] hover:border-white/20'
              }`}
            >
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
              {s.monte_carlo_success != null && (
                <div className={`font-mono text-[10px] font-bold ${successColor(s.monte_carlo_success)}`}>
                  {Math.round(s.monte_carlo_success * 100)}% MC
                </div>
              )}
              {s.portfolio_at_90 != null && (
                <div className="font-mono text-[9px] text-white/30 mt-0.5">
                  ${(s.portfolio_at_90 / 1000000).toFixed(1)}M at 90
                </div>
              )}
              <div className="font-mono text-[8px] text-white/20 mt-1">
                {new Date(s.updated_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}