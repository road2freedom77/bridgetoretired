// ─── F1-03: Deterministic Quantified Insights ─────────────────────────────────
// Produces 3–5 typed insight objects for the recommended scenario.
// Every insight has a numeric delta and comparison baseline.
// No generative model. No randomness. Pure deterministic math.

import type { CompareMetrics, GoalMode } from './scoring'

// ─── Types ────────────────────────────────────────────────────────────────────

export type InsightSeverity = 'positive' | 'neutral' | 'caution'

export interface Insight {
  metric: string           // Machine-readable key
  label: string            // Human-readable title
  delta: number            // Numeric difference (winner - baseline)
  baseline: number         // What we're comparing against
  winnerValue: number      // Winner's raw value
  unit: string             // '$', '%', 'years', 'age'
  severity: InsightSeverity
  copyKey: string          // Pre-built one-liner for display
}

// ─── Formatters ───────────────────────────────────────────────────────────────

function fmtDollars(n: number): string {
  const abs = Math.abs(n)
  if (abs >= 1_000_000) return `$${(abs / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `$${Math.round(abs / 1000)}k`
  return `$${Math.round(abs)}`
}

function fmtPct(n: number): string {
  return `${Math.abs(n).toFixed(1)}%`
}

function fmtYears(n: number): string {
  const abs = Math.abs(n)
  if (abs === 1) return '1 year'
  return `${abs.toFixed(1)} years`
}

// ─── Build Insights ───────────────────────────────────────────────────────────
// Takes the winner, all others, and the current goal.
// Returns 3–5 insights, ordered by relevance to the selected goal.

export function buildInsights(
  winnerId: string,
  winnerName: string,
  allMetrics: CompareMetrics[],
  goal: GoalMode
): Insight[] {
  const winner = allMetrics.find(m => m.id === winnerId)
  if (!winner) return []

  const others = allMetrics.filter(m => m.id !== winnerId)
  if (others.length === 0) return singleScenarioInsights(winner)

  const insights: Insight[] = []

  // ── 1. Bridge-period difference ──────────────────────────────────────────
  const avgOtherBridge = others.reduce((a, m) => a + m.bridgeYears, 0) / others.length
  const bridgeDelta = winner.bridgeYears - avgOtherBridge
  if (Math.abs(bridgeDelta) > 0.1) {
    const shorter = bridgeDelta < 0
    insights.push({
      metric: 'bridge_period',
      label: 'Bridge Period',
      delta: bridgeDelta,
      baseline: round1(avgOtherBridge),
      winnerValue: round1(winner.bridgeYears),
      unit: 'years',
      severity: shorter ? 'positive' : 'caution',
      copyKey: shorter
        ? `${fmtYears(-bridgeDelta)} shorter bridge than average — less reliance on taxable accounts`
        : `${fmtYears(bridgeDelta)} longer bridge period — requires more taxable runway`,
    })
  }

  // ── 2. Withdrawal-rate advantage ─────────────────────────────────────────
  const bestOtherWR = Math.min(...others.map(m => m.withdrawalRate))
  const wrDelta = winner.withdrawalRate - bestOtherWR
  if (Math.abs(wrDelta) > 0.05) {
    const lower = wrDelta < 0
    insights.push({
      metric: 'withdrawal_rate',
      label: 'Withdrawal Rate',
      delta: round1(wrDelta),
      baseline: round1(bestOtherWR),
      winnerValue: round1(winner.withdrawalRate),
      unit: '%',
      severity: lower ? 'positive' : 'caution',
      copyKey: lower
        ? `${fmtPct(-wrDelta)} lower withdrawal rate vs. next-best (${fmtPct(winner.withdrawalRate)} vs ${fmtPct(bestOtherWR)}) — less portfolio stress`
        : `${fmtPct(wrDelta)} higher withdrawal rate than next-best — monitor spending closely`,
    })
  }

  // ── 3. Work-years trade-off ──────────────────────────────────────────────
  const earliestOther = Math.min(...others.map(m => m.retireAge))
  const workYearsDelta = winner.retireAge - earliestOther
  if (workYearsDelta !== 0) {
    const moreWork = workYearsDelta > 0
    const at90Advantage = winner.totalAt90 - (allMetrics.find(m => m.retireAge === earliestOther)?.totalAt90 ?? 0)
    insights.push({
      metric: 'work_years_tradeoff',
      label: 'Work-Years Trade-off',
      delta: workYearsDelta,
      baseline: earliestOther,
      winnerValue: winner.retireAge,
      unit: 'age',
      severity: moreWork && at90Advantage > 0 ? 'positive' : moreWork ? 'neutral' : 'positive',
      copyKey: moreWork
        ? `${Math.abs(workYearsDelta)} extra work year${Math.abs(workYearsDelta) > 1 ? 's' : ''} adds ${fmtDollars(at90Advantage)} at age 90`
        : `Retires ${Math.abs(workYearsDelta)} year${Math.abs(workYearsDelta) > 1 ? 's' : ''} earlier than next-earliest scenario`,
    })
  }

  // ── 4. Age-90 dollar impact ──────────────────────────────────────────────
  const bestOtherAt90 = Math.max(...others.map(m => m.totalAt90))
  const at90Delta = winner.totalAt90 - bestOtherAt90
  if (Math.abs(at90Delta) > 5_000) {
    insights.push({
      metric: 'age90_impact',
      label: 'Age-90 Portfolio',
      delta: Math.round(at90Delta),
      baseline: Math.round(bestOtherAt90),
      winnerValue: Math.round(winner.totalAt90),
      unit: '$',
      severity: at90Delta > 0 ? 'positive' : 'caution',
      copyKey: at90Delta > 0
        ? `${fmtDollars(at90Delta)} more remaining at age 90 vs. next-best scenario`
        : `${fmtDollars(-at90Delta)} less at age 90 than highest-asset scenario — acceptable if other metrics are stronger`,
    })
  }

  // ── 5. Funded cushion ────────────────────────────────────────────────────
  if (winner.funded) {
    const unfundedCount = others.filter(m => !m.funded).length
    const allFunded = unfundedCount === 0
    if (!allFunded) {
      // Some others deplete
      const earliestDepletion = Math.min(
        ...others.filter(m => !m.funded).map(m => m.depleted ?? 90)
      )
      insights.push({
        metric: 'funded_cushion',
        label: 'Funded Cushion',
        delta: unfundedCount,
        baseline: earliestDepletion,
        winnerValue: 90,
        unit: 'years',
        severity: 'positive',
        copyKey: `Fully funded to 90 — ${unfundedCount} other scenario${unfundedCount > 1 ? 's' : ''} deplete${unfundedCount === 1 ? 's' : ''} by age ${earliestDepletion}`,
      })
    } else {
      // All funded — compare MC success if available
      const winnerMC = winner.monteCarloSuccess
      const bestOtherMC = Math.max(...others.map(m => m.monteCarloSuccess ?? 0))
      if (winnerMC !== null && bestOtherMC > 0) {
        const mcDelta = winnerMC - bestOtherMC
        if (Math.abs(mcDelta) > 1) {
          insights.push({
            metric: 'funded_cushion',
            label: 'Monte Carlo Edge',
            delta: round1(mcDelta),
            baseline: round1(bestOtherMC),
            winnerValue: round1(winnerMC),
            unit: '%',
            severity: mcDelta > 0 ? 'positive' : 'neutral',
            copyKey: mcDelta > 0
              ? `${fmtPct(mcDelta)} higher Monte Carlo success rate — more resilient to market volatility`
              : `All scenarios funded to 90, but Monte Carlo success is ${fmtPct(-mcDelta)} lower than best`,
          })
        }
      }
    }
  } else {
    // Winner itself depletes — flag it
    const deplAge = winner.depleted ?? 90
    insights.push({
      metric: 'funded_cushion',
      label: 'Depletion Warning',
      delta: deplAge - 90,
      baseline: 90,
      winnerValue: deplAge,
      unit: 'age',
      severity: 'caution',
      copyKey: `Portfolio depletes at age ${deplAge} — consider adjusting spending or retirement age`,
    })
  }

  // ── 6. Next-best comparison ──────────────────────────────────────────────
  // Only add if we have ≥3 scenarios (otherwise the "others" insights above are sufficient)
  if (others.length >= 2) {
    // Find the runner-up (sort others by their own at90 or funded status)
    const nextBest = [...others].sort((a, b) => {
      if (a.funded !== b.funded) return a.funded ? -1 : 1
      return b.totalAt90 - a.totalAt90
    })[0]
    if (nextBest) {
      const margin = winner.totalAt90 - nextBest.totalAt90
      const wrMargin = nextBest.withdrawalRate - winner.withdrawalRate
      const parts: string[] = []
      if (Math.abs(margin) > 5_000) parts.push(`${fmtDollars(Math.abs(margin))} ${margin > 0 ? 'more' : 'less'} at 90`)
      if (Math.abs(wrMargin) > 0.1) parts.push(`${fmtPct(Math.abs(wrMargin))} ${wrMargin > 0 ? 'lower' : 'higher'} withdrawal rate`)
      if (parts.length > 0) {
        insights.push({
          metric: 'next_best_comparison',
          label: 'vs. Runner-Up',
          delta: Math.round(margin),
          baseline: Math.round(nextBest.totalAt90),
          winnerValue: Math.round(winner.totalAt90),
          unit: '$',
          severity: margin >= 0 ? 'positive' : 'neutral',
          copyKey: `vs. runner-up: ${parts.join(' and ')}`,
        })
      }
    }
  }

  // Sort by goal relevance, then cap at 5
  return prioritizeByGoal(insights, goal).slice(0, 5)
}

// ─── Single-scenario fallback ─────────────────────────────────────────────────

function singleScenarioInsights(m: CompareMetrics): Insight[] {
  const insights: Insight[] = []

  insights.push({
    metric: 'withdrawal_rate',
    label: 'Withdrawal Rate',
    delta: 0,
    baseline: 4,  // conventional 4% rule
    winnerValue: round1(m.withdrawalRate),
    unit: '%',
    severity: m.withdrawalRate <= 4 ? 'positive' : m.withdrawalRate <= 5 ? 'neutral' : 'caution',
    copyKey: m.withdrawalRate <= 4
      ? `${fmtPct(m.withdrawalRate)} withdrawal rate — within the conventional 4% guideline`
      : `${fmtPct(m.withdrawalRate)} withdrawal rate — above the conventional 4% guideline`,
  })

  if (m.funded) {
    insights.push({
      metric: 'funded_cushion',
      label: 'Longevity',
      delta: 0,
      baseline: 90,
      winnerValue: 90,
      unit: 'years',
      severity: 'positive',
      copyKey: 'Portfolio projected to last to age 90',
    })
  } else {
    insights.push({
      metric: 'funded_cushion',
      label: 'Depletion Risk',
      delta: (m.depleted ?? 90) - 90,
      baseline: 90,
      winnerValue: m.depleted ?? 90,
      unit: 'age',
      severity: 'caution',
      copyKey: `Portfolio depletes at age ${m.depleted} — add a second scenario to explore alternatives`,
    })
  }

  return insights
}

// ─── Goal-based prioritization ────────────────────────────────────────────────

const GOAL_PRIORITY: Record<GoalMode, string[]> = {
  overall:                ['funded_cushion', 'age90_impact', 'withdrawal_rate', 'bridge_period', 'work_years_tradeoff', 'next_best_comparison'],
  earliest_retirement:    ['work_years_tradeoff', 'funded_cushion', 'withdrawal_rate', 'bridge_period', 'age90_impact', 'next_best_comparison'],
  lowest_bridge_risk:     ['bridge_period', 'funded_cushion', 'withdrawal_rate', 'age90_impact', 'work_years_tradeoff', 'next_best_comparison'],
  highest_age90:          ['age90_impact', 'funded_cushion', 'withdrawal_rate', 'bridge_period', 'work_years_tradeoff', 'next_best_comparison'],
  lowest_withdrawal_rate: ['withdrawal_rate', 'funded_cushion', 'age90_impact', 'bridge_period', 'work_years_tradeoff', 'next_best_comparison'],
}

function prioritizeByGoal(insights: Insight[], goal: GoalMode): Insight[] {
  const priority = GOAL_PRIORITY[goal]
  return [...insights].sort((a, b) => {
    const ai = priority.indexOf(a.metric)
    const bi = priority.indexOf(b.metric)
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
  })
}

// ─── Util ─────────────────────────────────────────────────────────────────────

function round1(n: number): number {
  return Math.round(n * 10) / 10
}