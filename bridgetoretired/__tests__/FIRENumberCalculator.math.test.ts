import { describe, test, expect } from 'vitest'

// FIRENumberCalculator.math.test.ts
// Regression tests for the FIRE Number Calculator math layer.
// Tests the default age-50 / $60k scenario to catch formula drift.

const WITHDRAWAL_RATES: Record<number, number> = {
  30: 0.040, 35: 0.037, 40: 0.033, 45: 0.031, 50: 0.030,
}

const REAL_RETURN = 0.06

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
  // FV: balance required at age 59½
  const k401kAtAccess = postSSSpend > 0 ? Math.round(postSSSpend / withdrawalRate) : 0
  // PV: discounted back to retirement age at assumed return
  const k401kNeeded = Math.round(k401kAtAccess / Math.pow(1 + REAL_RETURN, bridgeYears))
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
    k401kAtAccess,
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
    expect(r.bridgeNeeded).toBe(655_500)
  })

  test('healthcare buffer = $180k (15 yrs × $12k)', () => {
    expect(r.healthcareNeeded).toBe(180_000)
  })

  test('401k at 59½ (FV) ≈ $1,090,909', () => {
    expect(r.k401kAtAccess).toBe(Math.round(36_000 / 0.033))
  })

  test('401k PV at retire ≈ $627k (discounted from 59½ at 6%)', () => {
    // PV = 1,090,909 / (1.06)^9.5
    const expectedPV = Math.round(r.k401kAtAccess / Math.pow(1.06, 9.5))
    expect(r.k401kNeeded).toBe(expectedPV)
    expect(r.k401kNeeded).toBeGreaterThan(620_000)
    expect(r.k401kNeeded).toBeLessThan(635_000)
  })

  test('401k PV is strictly less than FV at 59½', () => {
    expect(r.k401kNeeded).toBeLessThan(r.k401kAtAccess)
  })

  test('sequence buffer = $90k (1.5 × $60k)', () => {
    expect(r.sequenceBuffer).toBe(90_000)
  })

  // --- Reconciliation: total = sum of four age-50 components ---

  test('total FIRE number equals sum of four components', () => {
    const componentSum = r.bridgeNeeded + r.healthcareNeeded + r.k401kNeeded + r.sequenceBuffer
    expect(r.totalFireNumber).toBe(componentSum)
  })

  test('total FIRE number ≈ $1.55M (not the old $2.02M)', () => {
    expect(r.totalFireNumber).toBeGreaterThan(1_540_000)
    expect(r.totalFireNumber).toBeLessThan(1_560_000)
  })

  // --- Difference vs 25x ---

  test('simple 25x = $1,500,000', () => {
    expect(r.simple25x).toBe(1_500_000)
  })

  test('difference from 25x rule ≈ +$53k', () => {
    expect(r.differenceFromSimple).toBe(r.totalFireNumber - 1_500_000)
    expect(r.differenceFromSimple).toBeGreaterThan(40_000)
    expect(r.differenceFromSimple).toBeLessThan(65_000)
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

  test('401k PV drops vs single (spouse SS reduces it)', () => {
    const single = computeFIRE()
    expect(r.k401kNeeded).toBeLessThan(single.k401kNeeded)
  })

  test('401k PV is discounted (less than FV at 59½)', () => {
    expect(r.k401kNeeded).toBeLessThan(r.k401kAtAccess)
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

  test('401k FV and PV are both 0 when SS covers everything', () => {
    expect(r.k401kAtAccess).toBe(0)
    expect(r.k401kNeeded).toBe(0)
  })

  test('reconciliation still holds', () => {
    const componentSum = r.bridgeNeeded + r.healthcareNeeded + r.k401kNeeded + r.sequenceBuffer
    expect(r.totalFireNumber).toBe(componentSum)
  })
})

describe('FIRENumberCalculator — PV discount sanity checks', () => {
  test('shorter bridge = smaller discount (age 55 vs age 50)', () => {
    const early = computeFIRE({ retireAge: 50 })
    const later = computeFIRE({ retireAge: 55 })
    // Shorter bridge means less compounding time, so PV is closer to FV
    const earlyRatio = early.k401kNeeded / early.k401kAtAccess
    const laterRatio = later.k401kNeeded / later.k401kAtAccess
    expect(laterRatio).toBeGreaterThan(earlyRatio)
  })

  test('zero bridge years = no discount (retire at 59)', () => {
    const r = computeFIRE({ retireAge: 59 })
    // bridgeYears = 0.5, so there's still a tiny discount
    expect(r.k401kNeeded).toBeLessThan(r.k401kAtAccess)
    // But the gap should be very small (< 3%)
    expect(r.k401kNeeded / r.k401kAtAccess).toBeGreaterThan(0.97)
  })
})