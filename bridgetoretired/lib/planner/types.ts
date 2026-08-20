// ─── Calculation Engine Version ───────────────────────────────────────────────
// Bump on every change to bridge/monteCarlo/riskFlags/taxEstimate/post595 logic.
// Stored with every saved scenario so stale cached outputs can be detected.
export const CALCULATION_VERSION = '1.0.0'

// ─── Canonical Scenario Input ─────────────────────────────────────────────────
// Single source of truth for both Planner and Compare pages.
// Every field that the calculation engine needs lives here.
// Compare-only fields (partTimeIncome, partTimeYears, healthcareCost) are
// optional with defaults applied at calculation time, not at save time.

export interface ScenarioInput {
  currentAge: number
  retireAge: number
  ssAge: number
  lifeExpectancy: number
  filingStatus: 'MFJ' | 'Single'
  state: string
  stateTaxRate: number
  taxable: number
  k401: number
  roth: number
  cash: number
  spending: number
  inflation: number       // decimal, e.g. 0.025
  otherIncome: number
  ssBenefit: number
  returnRate: number      // decimal, e.g. 0.065
  volatility: number      // decimal, e.g. 0.12
  // Compare-page extensions — optional, defaults to 0
  partTimeIncome?: number
  partTimeYears?: number
  healthcareCost?: number
}

// ─── Scenario Metadata ────────────────────────────────────────────────────────
// Stored alongside the scenario row, not inside risk_flags.

export type ScenarioSource = 'planner' | 'compare'

export interface ScenarioMetadata {
  source: ScenarioSource
  calculation_version: string
  manual_name: boolean
}

// ─── Legacy PlannerInputs (alias) ─────────────────────────────────────────────
// Kept for backward compatibility with existing planner components.
// New code should use ScenarioInput directly.
export type PlannerInputs = ScenarioInput

// ─── Calculation Output Types ─────────────────────────────────────────────────

export interface BridgeYear {
  year: number
  age: number
  spending: number
  otherIncome: number
  netNeeded: number
  taxableStart: number
  rothStart: number
  k401Start: number
  fromTaxable: number
  fromRoth: number
  from401k: number
  taxableEnd: number
  rothEnd: number
  k401End: number
  totalEnd: number
}

export interface Post595Year {
  year: number
  age: number
  spending: number
  ssIncome: number
  otherIncome: number
  netWithdrawal: number
  portfolioBalance: number
  rothBalance: number
}

export interface RiskFlag {
  label: string
  status: 'ok' | 'warning' | 'danger' | 'advisory'
  value: string
  detail: string
}

export interface MonteCarloResult {
  successRate: number
  median: number
  p10: number
  p90: number
}

export interface PlannerResults {
  bridgeYears: BridgeYear[]
  post595Years: Post595Year[]
  riskFlags: RiskFlag[]
  monteCarlo: MonteCarloResult
  withdrawalRate: number
  bridgeLength: number
  portfolioAt90: number
}

// ─── DB Row → ScenarioInput ───────────────────────────────────────────────────
// Centralised mapping so every consumer reads the same way.

export function scenarioInputFromDbRow(row: Record<string, any>): ScenarioInput {
  return {
    currentAge:     row.current_age     ?? 45,
    retireAge:      row.retire_age      ?? 55,
    ssAge:          row.ss_age          ?? 67,
    lifeExpectancy: row.life_expectancy ?? 90,
    filingStatus:   row.filing_status   ?? 'MFJ',
    state:          row.state           ?? 'TX',
    stateTaxRate:   row.state_tax_rate  ?? 0,
    taxable:        row.taxable         ?? 0,
    k401:           row.k401            ?? 0,
    roth:           row.roth            ?? 0,
    cash:           row.cash            ?? 0,
    spending:       row.spending        ?? 0,
    inflation:      row.inflation       ?? 0.025,
    otherIncome:    row.other_income    ?? 0,
    ssBenefit:      row.ss_benefit      ?? 0,
    returnRate:     row.return_rate     ?? 0.065,
    volatility:     row.volatility      ?? 0.12,
    partTimeIncome: row.part_time_income ?? (row.risk_flags?.partTimeIncome ?? 0),
    partTimeYears:  row.part_time_years  ?? (row.risk_flags?.partTimeYears  ?? 0),
    healthcareCost: row.healthcare_cost  ?? (row.risk_flags?.healthcareCost ?? 0),
  }
}

// ─── ScenarioInput → DB columns ───────────────────────────────────────────────
// Returns a flat object ready for Supabase insert/update.

export function scenarioInputToDbColumns(inputs: ScenarioInput) {
  return {
    current_age:      inputs.currentAge,
    retire_age:       inputs.retireAge,
    ss_age:           inputs.ssAge,
    life_expectancy:  inputs.lifeExpectancy,
    filing_status:    inputs.filingStatus,
    state:            inputs.state,
    state_tax_rate:   inputs.stateTaxRate,
    taxable:          inputs.taxable,
    k401:             inputs.k401,
    roth:             inputs.roth,
    cash:             inputs.cash,
    spending:         inputs.spending,
    inflation:        inputs.inflation,
    other_income:     inputs.otherIncome,
    ss_benefit:       inputs.ssBenefit,
    return_rate:      inputs.returnRate,
    volatility:       inputs.volatility,
    part_time_income: inputs.partTimeIncome ?? 0,
    part_time_years:  inputs.partTimeYears  ?? 0,
    healthcare_cost:  inputs.healthcareCost ?? 0,
  }
}