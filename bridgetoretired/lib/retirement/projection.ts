// ─── F1-03: Projection Adapter ────────────────────────────────────────────────
// Wraps lib/planner/runPlan() to produce compare-friendly metrics.
// Single source of truth: no independent financial calculations here.

import { runPlan } from '@/lib/planner'
import type { ScenarioInput, PlannerResults } from '@/lib/planner/types'
import type { CompareMetrics } from './scoring'

// ─── Extract Compare Metrics ──────────────────────────────────────────────────
// Runs the full shared engine and maps the output to the flat metrics shape
// that scoring and insights consume.

export function getCompareMetrics(
  id: string,
  inputs: ScenarioInput
): CompareMetrics {
  const results = runPlan(inputs)
  return extractMetrics(id, inputs, results)
}

// ─── Extract from pre-computed results ────────────────────────────────────────
// For cases where runPlan() was already called (e.g. planner page).

export function extractMetrics(
  id: string,
  inputs: ScenarioInput,
  results: PlannerResults
): CompareMetrics {
  const totalAt80 = getPortfolioAtAge(results, 80)
  const totalAt90 = results.portfolioAt90
  const depleted = getDepletionAge(results, inputs)

  return {
    id,
    retireAge: inputs.retireAge,
    bridgeYears: results.bridgeLength,
    withdrawalRate: results.withdrawalRate * 100, // engine stores as decimal
    totalAt80,
    totalAt90,
    depleted,
    funded: depleted === null,
    monteCarloSuccess: results.monteCarlo?.successRate != null ? Math.round(results.monteCarlo.successRate * 100) : null,
  }
}

// ─── Portfolio at specific age ────────────────────────────────────────────────

function getPortfolioAtAge(results: PlannerResults, targetAge: number): number {
  // Check post-59.5 years first (most common case for age 80+)
  for (const year of results.post595Years) {
    if (Math.floor(year.age) === targetAge) {
      return Math.round(year.portfolioBalance + year.rothBalance)
    }
  }
  // Check bridge years (in case targetAge < 59.5)
  for (const year of results.bridgeYears) {
    if (Math.floor(year.age) === targetAge) {
      return Math.round(year.totalEnd)
    }
  }
  return 0
}

// ─── Depletion age ────────────────────────────────────────────────────────────

function getDepletionAge(results: PlannerResults, inputs: ScenarioInput): number | null {
  // Check bridge years
  for (const year of results.bridgeYears) {
    if (year.totalEnd <= 0) return Math.floor(year.age)
  }
  // Check post-59.5 years
  for (const year of results.post595Years) {
    if (year.portfolioBalance + year.rothBalance <= 0) return Math.floor(year.age)
  }
  return null
}

// ─── Run Full Plan (re-export for convenience) ────────────────────────────────

export { runPlan } from '@/lib/planner'