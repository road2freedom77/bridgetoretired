// ─── F1-03: Scenario Scoring Primitives ───────────────────────────────────────
// Pure functions. No UI, no React, no imports beyond types.
// Used by Scenario Compare page; later by F1-04 Command Center.

// ─── Types ────────────────────────────────────────────────────────────────────

export type GoalMode =
  | 'overall'
  | 'earliest_retirement'
  | 'lowest_bridge_risk'
  | 'highest_age90'
  | 'lowest_withdrawal_rate'

export const GOAL_LABELS: Record<GoalMode, string> = {
  overall:                'Best Overall Balance',
  earliest_retirement:    'Earliest Viable Retirement',
  lowest_bridge_risk:     'Lowest Bridge Risk',
  highest_age90:          'Highest Age-90 Assets',
  lowest_withdrawal_rate: 'Lowest Withdrawal Rate',
}

export interface CompareMetrics {
  id: string
  retireAge: number
  bridgeYears: number
  withdrawalRate: number
  totalAt80: number
  totalAt90: number
  depleted: number | null
  funded: boolean
  monteCarloSuccess: number | null
}

export interface ScoredScenario {
  id: string
  score: number
  rank: number
}

// ─── Normalization ────────────────────────────────────────────────────────────

function norm(value: number, min: number, max: number, invert = false): number {
  if (max === min) return 50
  const pct = ((value - min) / (max - min)) * 100
  return invert ? 100 - pct : pct
}

// ─── Goal-specific weight profiles ───────────────────────────────────────────
// Weights: [funded, at90, withdrawalRate, bridge, retireAge, monteCarlo]

type Weights = [number, number, number, number, number, number]

const WEIGHT_PROFILES: Record<GoalMode, Weights> = {
  overall:                [0.25, 0.20, 0.15, 0.10, 0.10, 0.20],
  earliest_retirement:    [0.30, 0.05, 0.10, 0.05, 0.40, 0.10],
  lowest_bridge_risk:     [0.25, 0.10, 0.10, 0.35, 0.05, 0.15],
  highest_age90:          [0.20, 0.40, 0.10, 0.05, 0.05, 0.20],
  lowest_withdrawal_rate: [0.20, 0.10, 0.40, 0.05, 0.05, 0.20],
}

// ─── Score Scenarios ──────────────────────────────────────────────────────────
// Returns scored + ranked array in original order.
// Single-scenario sets get score 100, rank 1.

export function scoreScenarios(
  metrics: CompareMetrics[],
  goal: GoalMode = 'overall'
): ScoredScenario[] {
  if (metrics.length === 0) return []
  if (metrics.length === 1) {
    return [{ id: metrics[0].id, score: 100, rank: 1 }]
  }

  const weights = WEIGHT_PROFILES[goal]
  const vals = (fn: (m: CompareMetrics) => number) => metrics.map(fn)

  const at90s      = vals(m => m.totalAt90)
  const wrs        = vals(m => m.withdrawalRate)
  const bridges    = vals(m => m.bridgeYears)
  const retireAges = vals(m => m.retireAge)
  const mcRates    = vals(m => m.monteCarloSuccess ?? 50)

  const scored = metrics.map((m, i) => {
    // Funded score: 100 if fully funded, proportional if depletes
    const fundedScore = m.funded
      ? 100
      : Math.max(0, ((m.depleted ?? 90) - m.retireAge) / (90 - m.retireAge) * 100)

    const at90Score    = norm(at90s[i],      Math.min(...at90s),      Math.max(...at90s))
    const wrScore      = norm(wrs[i],        Math.min(...wrs),        Math.max(...wrs),        true)
    const bridgeScore  = norm(bridges[i],    Math.min(...bridges),    Math.max(...bridges),    true)
    const retireScore  = norm(retireAges[i], Math.min(...retireAges), Math.max(...retireAges), true)
    const mcScore      = norm(mcRates[i],    Math.min(...mcRates),    Math.max(...mcRates))

    const total =
      fundedScore * weights[0] +
      at90Score   * weights[1] +
      wrScore     * weights[2] +
      bridgeScore * weights[3] +
      retireScore * weights[4] +
      mcScore     * weights[5]

    return { id: m.id, score: Math.round(total) }
  })

  // Rank by score descending, stable order for ties
  const sorted = [...scored].sort((a, b) => b.score - a.score || metrics.findIndex(m => m.id === a.id) - metrics.findIndex(m => m.id === b.id))
  return scored.map(s => ({
    ...s,
    rank: sorted.findIndex(x => x.id === s.id) + 1,
  }))
}

// ─── Get Winner ───────────────────────────────────────────────────────────────

export function getWinnerId(scored: ScoredScenario[]): string | null {
  const winner = scored.find(s => s.rank === 1)
  return winner?.id ?? null
}

// ─── Find next-best ───────────────────────────────────────────────────────────

export function getNextBestId(scored: ScoredScenario[]): string | null {
  const second = scored.find(s => s.rank === 2)
  return second?.id ?? null
}