/**
 * 72t / SEPP Calculation Engine
 * Based on IRS Notice 2022-6 (effective Jan 1, 2023)
 * Three methods: RMD, Fixed Amortization, Fixed Annuitization
 */

// ── Life expectancy tables (IRS Notice 2022-6, Appendix A) ──
// Uniform Lifetime Table (most common — single account owner)
const UNIFORM_LIFETIME_TABLE: Record<number, number> = {
  72: 27.4, 73: 26.5, 74: 25.5, 75: 24.6, 76: 23.7, 77: 22.9,
  78: 22.0, 79: 21.1, 80: 20.2, 81: 19.4, 82: 18.5, 83: 17.7,
  84: 16.8, 85: 16.0, 86: 15.2, 87: 14.4, 88: 13.7, 89: 12.9,
  90: 12.2, 91: 11.5, 92: 10.8, 93: 10.1, 94: 9.5, 95: 8.9,
  // Extended for early retirees using single life
  50: 36.2, 51: 35.3, 52: 34.3, 53: 33.4, 54: 32.5, 55: 31.6,
  56: 30.6, 57: 29.8, 58: 28.9, 59: 28.0, 60: 27.1, 61: 26.2,
  62: 25.4, 63: 24.5, 64: 23.7, 65: 22.9, 66: 22.0, 67: 21.2,
  68: 20.4, 69: 19.5, 70: 18.8, 71: 17.9,
}

// Single Life Expectancy Table (IRS Notice 2022-6)
const SINGLE_LIFE_TABLE: Record<number, number> = {
  50: 36.2, 51: 35.3, 52: 34.3, 53: 33.4, 54: 32.5, 55: 31.6,
  56: 30.6, 57: 29.8, 58: 28.9, 59: 28.0, 60: 27.1, 61: 26.2,
  62: 25.4, 63: 24.5, 64: 23.7, 65: 22.9, 66: 22.0, 67: 21.2,
  68: 20.4, 69: 19.5, 70: 18.8, 71: 17.9, 72: 17.0, 73: 16.3,
  74: 15.5, 75: 14.8, 76: 14.1, 77: 13.3, 78: 12.7, 79: 12.0,
  80: 11.4, 81: 10.8, 82: 10.2, 83: 9.7, 84: 9.1, 85: 8.6,
}

// Annuity factor table (Notice 2022-6 Appendix B — interpolated)
// Key: `${age}_${ratePercent}` e.g. "50_5"
const ANNUITY_FACTORS: Record<string, number> = {
  '50_1': 34.84, '50_2': 29.64, '50_3': 25.46, '50_4': 22.09,
  '50_5': 19.34, '50_6': 17.08, '50_7': 15.22, '50_8': 13.65,
  '51_1': 34.33, '51_2': 29.19, '51_3': 25.07, '51_4': 21.76,
  '51_5': 19.05, '51_6': 16.84, '51_7': 15.01, '51_8': 13.47,
  '52_1': 33.81, '52_2': 28.73, '52_3': 24.67, '52_4': 21.42,
  '52_5': 18.76, '52_6': 16.59, '52_7': 14.80, '52_8': 13.29,
  '53_1': 33.28, '53_2': 28.26, '53_3': 24.26, '53_4': 21.07,
  '53_5': 18.45, '53_6': 16.33, '53_7': 14.57, '53_8': 13.09,
  '54_1': 32.74, '54_2': 27.78, '54_3': 23.84, '54_4': 20.72,
  '54_5': 18.14, '54_6': 16.06, '54_7': 14.34, '54_8': 12.89,
  '55_1': 32.18, '55_2': 27.28, '55_3': 23.41, '55_4': 20.35,
  '55_5': 17.82, '55_6': 15.79, '55_7': 14.10, '55_8': 12.68,
  '56_1': 31.61, '56_2': 26.77, '56_3': 22.97, '56_4': 19.97,
  '56_5': 17.49, '56_6': 15.50, '56_7': 13.85, '56_8': 12.46,
  '57_1': 31.03, '57_2': 26.25, '57_3': 22.51, '57_4': 19.58,
  '57_5': 17.15, '57_6': 15.21, '57_7': 13.59, '57_8': 12.24,
  '58_1': 30.43, '58_2': 25.71, '58_3': 22.05, '58_4': 19.18,
  '58_5': 16.80, '58_6': 14.91, '58_7': 13.33, '58_8': 12.00,
  '59_1': 29.82, '59_2': 25.16, '59_3': 21.57, '59_4': 18.77,
  '59_5': 16.44, '59_6': 14.60, '59_7': 13.06, '59_8': 11.76,
  '60_1': 29.20, '60_2': 24.60, '60_3': 21.08, '60_4': 18.35,
  '60_5': 16.08, '60_6': 14.29, '60_7': 12.78, '60_8': 11.52,
}

export type LifeTable = 'uniform' | 'single' | 'joint'

export interface SEPPInputs {
  accountBalance: number
  currentAge: number
  beneficiaryAge?: number       // for joint table
  interestRate: number          // decimal e.g. 0.05
  lifeTable: LifeTable
  midTermAFR?: number           // current month's AFR, decimal
}

export interface SEPPResult {
  method: 'rmd' | 'amortization' | 'annuitization'
  annualPayment: number
  monthlyPayment: number
  lifeExpectancyFactor: number
  lockInEndAge: number          // longer of 5 years or 59½
  lockInEndYear: number
  minimumDuration: number       // years locked in
  notes: string[]
}

export interface SEPPComparison {
  rmd: SEPPResult
  amortization: SEPPResult
  annuitization: SEPPResult | null  // null if age not in table
  maxRateAllowed: number
  recommendedMethod: 'rmd' | 'amortization' | 'annuitization'
}

// ── Rate cap helper (Notice 2022-6) ──
export function calcMaxAllowedRate(midTermAFR: number): number {
  // Max is the greater of 5% or 120% of federal mid-term AFR
  return Math.max(0.05, midTermAFR * 1.20)
}

// ── Life expectancy factor lookup ──
export function getLifeExpectancyFactor(
  age: number,
  table: LifeTable,
  beneficiaryAge?: number
): number {
  const roundedAge = Math.floor(age)

  if (table === 'single' || table === 'uniform') {
    const t = table === 'single' ? SINGLE_LIFE_TABLE : UNIFORM_LIFETIME_TABLE
    return t[roundedAge] ?? t[Math.min(roundedAge, 85)] ?? 8.6
  }

  // Joint — use lower of two ages' single life factors (simplified)
  if (beneficiaryAge !== undefined) {
    const ownerFactor = SINGLE_LIFE_TABLE[roundedAge] ?? 8.6
    const beneFactor = SINGLE_LIFE_TABLE[Math.floor(beneficiaryAge)] ?? 8.6
    return Math.max(ownerFactor, beneFactor)
  }

  return SINGLE_LIFE_TABLE[roundedAge] ?? 8.6
}

// ── Lock-in end calculation ──
export function calcLockIn(currentAge: number): {
  endAge: number
  years: number
} {
  const fiveYearEnd = currentAge + 5
  const endAge = Math.max(fiveYearEnd, 59.5)
  return {
    endAge,
    years: endAge - currentAge,
  }
}

// ── Method 1: RMD ──
export function calcRMD(inputs: SEPPInputs): SEPPResult {
  const factor = getLifeExpectancyFactor(
    inputs.currentAge,
    inputs.lifeTable,
    inputs.beneficiaryAge
  )
  const annualPayment = inputs.accountBalance / factor
  const lockIn = calcLockIn(inputs.currentAge)
  const currentYear = new Date().getFullYear()

  return {
    method: 'rmd',
    annualPayment,
    monthlyPayment: annualPayment / 12,
    lifeExpectancyFactor: factor,
    lockInEndAge: lockIn.endAge,
    lockInEndYear: currentYear + Math.ceil(lockIn.years),
    minimumDuration: lockIn.years,
    notes: [
      'Payment recalculates annually as balance changes — amount varies year to year',
      'Lowest of three methods but most flexible — you can switch to RMD from amortization once',
      'Use as escape valve if financial situation changes',
    ],
  }
}

// ── Method 2: Fixed Amortization ──
export function calcAmortization(inputs: SEPPInputs): SEPPResult {
  const factor = getLifeExpectancyFactor(
    inputs.currentAge,
    inputs.lifeTable,
    inputs.beneficiaryAge
  )
  const r = inputs.interestRate
  const n = factor // periods = life expectancy years

  // Standard amortization: PMT = PV * r / (1 - (1+r)^-n)
  let annualPayment: number
  if (r === 0) {
    annualPayment = inputs.accountBalance / n
  } else {
    annualPayment = inputs.accountBalance * r / (1 - Math.pow(1 + r, -n))
  }

  const lockIn = calcLockIn(inputs.currentAge)
  const currentYear = new Date().getFullYear()

  return {
    method: 'amortization',
    annualPayment,
    monthlyPayment: annualPayment / 12,
    lifeExpectancyFactor: factor,
    lockInEndAge: lockIn.endAge,
    lockInEndYear: currentYear + Math.ceil(lockIn.years),
    minimumDuration: lockIn.years,
    notes: [
      'Fixed payment every year — easiest to plan around',
      'Higher rate = higher allowed payment',
      'Most commonly used method',
      `Payment locks in at $${Math.round(annualPayment).toLocaleString()}/yr until age ${lockIn.endAge}`,
    ],
  }
}

// ── Method 3: Fixed Annuitization ──
export function calcAnnuitization(inputs: SEPPInputs): SEPPResult | null {
  const age = Math.floor(inputs.currentAge)
  const ratePercent = Math.round(inputs.interestRate * 100)
  const key = `${age}_${ratePercent}`

  // Try exact rate, then interpolate between nearest rates
  let annuityFactor = ANNUITY_FACTORS[key]

  if (!annuityFactor) {
    // Try to interpolate between available rates
    const lowerRate = Math.floor(inputs.interestRate * 100)
    const upperRate = Math.ceil(inputs.interestRate * 100)
    const lowerKey = `${age}_${lowerRate}`
    const upperKey = `${age}_${upperRate}`

    if (ANNUITY_FACTORS[lowerKey] && ANNUITY_FACTORS[upperKey]) {
      const t = (inputs.interestRate * 100) - lowerRate
      annuityFactor = ANNUITY_FACTORS[lowerKey] * (1 - t) +
                      ANNUITY_FACTORS[upperKey] * t
    } else {
      return null // age/rate combo not in table
    }
  }

  const annualPayment = inputs.accountBalance / annuityFactor
  const lockIn = calcLockIn(inputs.currentAge)
  const currentYear = new Date().getFullYear()

  return {
    method: 'annuitization',
    annualPayment,
    monthlyPayment: annualPayment / 12,
    lifeExpectancyFactor: annuityFactor,
    lockInEndAge: lockIn.endAge,
    lockInEndYear: currentYear + Math.ceil(lockIn.years),
    minimumDuration: lockIn.years,
    notes: [
      'Similar to amortization but uses IRS mortality table instead of life expectancy',
      'Typically produces highest payment of three methods',
      'Payment fixed for duration of SEPP',
    ],
  }
}

// ── Full comparison ──
export function calcSEPPComparison(inputs: SEPPInputs): SEPPComparison {
  const rmd = calcRMD(inputs)
  const amortization = calcAmortization(inputs)
  const annuitization = calcAnnuitization(inputs)

  const maxRateAllowed = inputs.midTermAFR
    ? calcMaxAllowedRate(inputs.midTermAFR)
    : 0.05 // default to 5% floor

  // Recommend highest payment method
  const amounts = [
    { method: 'rmd' as const, amount: rmd.annualPayment },
    { method: 'amortization' as const, amount: amortization.annualPayment },
    ...(annuitization ? [{ method: 'annuitization' as const, amount: annuitization.annualPayment }] : []),
  ]
  const recommended = amounts.reduce((a, b) => a.amount > b.amount ? a : b)

  return {
    rmd,
    amortization,
    annuitization,
    maxRateAllowed,
    recommendedMethod: recommended.method,
  }
}

// ── Account splitting helper ──
export interface SplitStrategy {
  primaryBalance: number
  reserveBalance: number
  primaryAnnualPayment: number
  rationale: string
}

export function calcAccountSplit(
  inputs: SEPPInputs,
  targetAnnualIncome: number
): SplitStrategy {
  // Find the balance needed to generate target income via amortization
  const factor = getLifeExpectancyFactor(inputs.currentAge, inputs.lifeTable)
  const r = inputs.interestRate
  const n = factor

  let amortFactor: number
  if (r === 0) {
    amortFactor = 1 / n
  } else {
    amortFactor = r / (1 - Math.pow(1 + r, -n))
  }

  const primaryBalance = targetAnnualIncome / amortFactor
  const reserveBalance = Math.max(0, inputs.accountBalance - primaryBalance)

  return {
    primaryBalance: Math.round(primaryBalance),
    reserveBalance: Math.round(reserveBalance),
    primaryAnnualPayment: targetAnnualIncome,
    rationale: `Split $${Math.round(primaryBalance).toLocaleString()} into a new IRA for the SEPP. Keep $${Math.round(reserveBalance).toLocaleString()} in the original account — accessible penalty-free at 59½ or via a second SEPP later.`,
  }
}