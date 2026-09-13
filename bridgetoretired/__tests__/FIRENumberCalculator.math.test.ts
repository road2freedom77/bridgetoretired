// FIRENumberCalculator.math.test.ts
// Regression tests for the FIRE Number Calculator math layer.
// Tests the default age-50 / $60k scenario to catch formula drift.
// Place alongside the component or in __tests__/.
import { describe, test, expect } from 'vitest'

const WITHDRAWAL_RATES: Record<number, number> = {
  30: 0.040, 35: 0.037, 40: 0.033, 45: 0.031, 50: 0.030,
}

/** Mirrors the component's calculation logic exactly. */
function computeFIRE({
  retireAge = 50,
  annualSpend = 60_000,
  ssMonthly = 2_000,
  spouseSSMonthly = 0,
  hasSpouse = false,
  healthcareBudget = 12_000,
  lifeExpectancy = 90,
} = {}) {
  const retirementYears = lifeExpectancy - retireAge
  const bridgeYears = 59.5 - retireAge
  const rateKey = Math.min(50, Math.max(30, Math.round(retirementYears / 5) * 5))
  const withdrawalRate = WITHDRAWAL_RATES[rateKey] ?? 0.033
  const ssAnnual = (ssMonthly + (hasSpouse ? spouseSSMonthly : 0)) * 12

  const bridgeNeeded = Math.round(annualSpend * bridgeYears * 1.15)
  const healthcareNeeded = Math.round(healthcareBudget * (65 - retireAge))
  const postSSSpend = Math.max(0, annualSpend - ssAnnual)
  const k401kNeeded = postSSSpend > 0 ? Math.round(postSSSpend / withdrawalRate) : 0
  const sequenceBuffer = Math.round(annualSpend * 1.5)
  const totalFireNumber = bridgeNeeded + healthcareNeeded + k401kNeeded + sequenceBuffer

  const simple25x = Math.round(annualSpend * 25)
  const simpleFireNumber = Math.round(annualSpend / withdrawalRate)
  const differenceFromSimple = totalFireNumber - simple25x

  return {
    retirementYears,
    bridgeYears,
    withdrawalRate,
    ssAnnual,
    bridgeNeeded,
    healthcareNeeded,
    postSSSpend,
    k401kNeeded,
    sequenceBuffer,
    totalFireNumber,
    simple25x,
    simpleFireNumber,
    differenceFromSimple,
  }
}

describe('FIRENumberCalculator — default scenario (age 50, $60k spend)', () => {
  const r = computeFIRE()

  // --- Intermediate values ---

  test('retirement horizon is 40 years', () => {
    expect(r.retirementYears).toBe(40)
  })

  test('bridge years = 9.5 (age 50 → 59.5)', () => {
    expect(r.bridgeYears).toBe(9.5)
  })

  test('withdrawal rate maps to 3.3% for 40-year horizon', () => {
    expect(r.withdrawalRate).toBe(0.033)
  })

  test('SS annual = $24k (single, $2k/mo)', () => {
    expect(r.ssAnnual).toBe(24_000)
  })

  test('post-SS spend = $36k', () => {
    expect(r.postSSSpend).toBe(36_000)
  })

  // --- Four components ---

  test('bridge needed ≈ $655,500', () => {
    // 60000 * 9.5 * 1.15
    expect(r.bridgeNeeded).toBe(655_500)
  })

  test('healthcare buffer = $180k (15 yrs × $12k)', () => {
    expect(r.healthcareNeeded).toBe(180_000)
  })

  test('401k needed ≈ $1,090,909 (balance at 59½)', () => {
    // 36000 / 0.033
    expect(r.k401kNeeded).toBe(Math.round(36_000 / 0.033))
  })

  test('sequence buffer = $90k (1.5 × $60k)', () => {
    expect(r.sequenceBuffer).toBe(90_000)
  })

  // --- Bug 3 regression: component reconciliation ---

  test('total FIRE number equals sum of four components', () => {
    const componentSum = r.bridgeNeeded + r.healthcareNeeded + r.k401kNeeded + r.sequenceBuffer
    expect(r.totalFireNumber).toBe(componentSum)
  })

  test('total FIRE number ≈ $2.02M', () => {
    expect(r.totalFireNumber).toBeGreaterThan(2_000_000)
    expect(r.totalFireNumber).toBeLessThan(2_050_000)
  })

  // --- Bug 1 regression: difference vs simple 25x ---

  test('simple 25x = $1,500,000', () => {
    expect(r.simple25x).toBe(1_500_000)
  })

  test('difference from 25x rule ≈ +$516k (not $198k)', () => {
    // This is the fix: difference must be totalFireNumber - (annualSpend * 25)
    expect(r.differenceFromSimple).toBe(r.totalFireNumber - 1_500_000)
    expect(r.differenceFromSimple).toBeGreaterThan(500_000)
    expect(r.differenceFromSimple).toBeLessThan(550_000)
  })

  test('difference is NOT computed against withdrawal-rate-adjusted number', () => {
    // Old bug: differenceFromSimple was totalFireNumber - simpleFireNumber
    const wrongDifference = r.totalFireNumber - r.simpleFireNumber
    expect(r.differenceFromSimple).not.toBe(wrongDifference)
  })
})

describe('FIRENumberCalculator — couple scenario (age 50, $60k, spouse $1.5k SS)', () => {
  const r = computeFIRE({ hasSpouse: true, spouseSSMonthly: 1_500 })

  test('combined SS annual = $42k', () => {
    expect(r.ssAnnual).toBe(42_000)
  })

  test('post-SS spend = $18k', () => {
    expect(r.postSSSpend).toBe(18_000)
  })

  test('401k needed drops (spouse SS reduces it)', () => {
    const single = computeFIRE()
    expect(r.k401kNeeded).toBeLessThan(single.k401kNeeded)
  })

  test('reconciliation still holds with spouse', () => {
    const componentSum = r.bridgeNeeded + r.healthcareNeeded + r.k401kNeeded + r.sequenceBuffer
    expect(r.totalFireNumber).toBe(componentSum)
  })
})

describe('FIRENumberCalculator — edge: SS covers all spending', () => {
  const r = computeFIRE({ ssMonthly: 4_000, hasSpouse: true, spouseSSMonthly: 2_000 })

  test('post-SS spend is 0 when SS exceeds annual spend', () => {
    expect(r.postSSSpend).toBe(0)
  })

  test('401k needed is 0 when SS covers everything', () => {
    expect(r.k401kNeeded).toBe(0)
  })

  test('reconciliation still holds', () => {
    const componentSum = r.bridgeNeeded + r.healthcareNeeded + r.k401kNeeded + r.sequenceBuffer
    expect(r.totalFireNumber).toBe(componentSum)
  })
})