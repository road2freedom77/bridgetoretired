import type { ScenarioInput, ScenarioSource } from './types'

// ─── Validation Result ────────────────────────────────────────────────────────

export interface ValidationResult {
  valid: boolean
  errors: string[]
  cleaned: ScenarioInput
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function num(raw: unknown, fallback: number): number {
  if (typeof raw === 'number' && !isNaN(raw)) return raw
  if (typeof raw === 'string') {
    const parsed = parseFloat(raw)
    if (!isNaN(parsed)) return parsed
  }
  return fallback
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function rangeCheck(
  errors: string[],
  label: string,
  value: number,
  min: number,
  max: number
): void {
  if (value < min || value > max) {
    errors.push(`${label} must be between ${min} and ${max} (got ${value})`)
  }
}

// ─── Validate Scenario Inputs ─────────────────────────────────────────────────
// Coerces types, clamps to reasonable ranges, collects errors.
// Returns cleaned inputs even when there are errors (best-effort).

export function validateScenarioInput(raw: Record<string, unknown>): ValidationResult {
  const errors: string[] = []

  const currentAge     = clamp(num(raw.currentAge,     45),  18,  80)
  const retireAge      = clamp(num(raw.retireAge,      55),  30,  80)
  const ssAge          = clamp(num(raw.ssAge,          67),  62,  70)
  const lifeExpectancy = clamp(num(raw.lifeExpectancy, 90),  70, 110)
  const stateTaxRate   = clamp(num(raw.stateTaxRate,    0),   0,  0.15)
  const taxable        = clamp(num(raw.taxable,         0),   0,  50_000_000)
  const k401           = clamp(num(raw.k401,            0),   0,  50_000_000)
  const roth           = clamp(num(raw.roth,            0),   0,  50_000_000)
  const cash           = clamp(num(raw.cash,            0),   0,  10_000_000)
  const spending       = clamp(num(raw.spending,    55000),   0,   1_000_000)
  const inflation      = clamp(num(raw.inflation,   0.025),   0,   0.15)
  const otherIncome    = clamp(num(raw.otherIncome,     0),   0,   1_000_000)
  const ssBenefit      = clamp(num(raw.ssBenefit,       0),   0,     100_000)
  const returnRate     = clamp(num(raw.returnRate,  0.065),   0,   0.20)
  const volatility     = clamp(num(raw.volatility,  0.12),    0,   0.50)
  const partTimeIncome = clamp(num(raw.partTimeIncome,  0),   0,   500_000)
  const partTimeYears  = clamp(num(raw.partTimeYears,   0),   0,   30)
  const healthcareCost = clamp(num(raw.healthcareCost,  0),   0,   100_000)

  // Filing status
  const rawFs = raw.filingStatus
  const filingStatus: 'MFJ' | 'Single' =
    rawFs === 'Single' ? 'Single' : 'MFJ'

  // State — allow any 2-char string, default TX
  const rawState = typeof raw.state === 'string' ? raw.state.trim().toUpperCase() : 'TX'
  const state = rawState.length === 2 ? rawState : 'TX'

  // Cross-field checks
  if (retireAge <= currentAge) {
    errors.push(`retireAge (${retireAge}) must be greater than currentAge (${currentAge})`)
  }
  if (retireAge >= lifeExpectancy) {
    errors.push(`retireAge (${retireAge}) must be less than lifeExpectancy (${lifeExpectancy})`)
  }
  if (ssAge > lifeExpectancy) {
    errors.push(`ssAge (${ssAge}) exceeds lifeExpectancy (${lifeExpectancy})`)
  }
  if (taxable + k401 + roth + cash === 0) {
    errors.push('Total portfolio cannot be zero')
  }

  // Range warnings (soft — don't block save, but flag)
  rangeCheck(errors, 'currentAge',     currentAge,      18,  75)
  rangeCheck(errors, 'retireAge',      retireAge,       30,  75)
  rangeCheck(errors, 'lifeExpectancy', lifeExpectancy,  75, 110)

  const cleaned: ScenarioInput = {
    currentAge,
    retireAge,
    ssAge,
    lifeExpectancy,
    filingStatus,
    state,
    stateTaxRate,
    taxable,
    k401,
    roth,
    cash,
    spending,
    inflation,
    otherIncome,
    ssBenefit,
    returnRate,
    volatility,
    partTimeIncome,
    partTimeYears,
    healthcareCost,
  }

  return { valid: errors.length === 0, errors, cleaned }
}

// ─── Validate Scenario Name ───────────────────────────────────────────────────

export function validateScenarioName(raw: unknown): { name: string; valid: boolean; error?: string } {
  if (typeof raw !== 'string' || raw.trim().length === 0) {
    return { name: 'My Plan', valid: false, error: 'Scenario name is required' }
  }
  const name = raw.trim().slice(0, 100)
  return { name, valid: true }
}

// ─── Validate Source ──────────────────────────────────────────────────────────

export function validateSource(raw: unknown): ScenarioSource {
  if (raw === 'compare') return 'compare'
  return 'planner'
}