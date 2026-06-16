/**
 * 72t / SEPP Calculation Engine
 * Based on IRS Notice 2022-6 (effective Jan 1, 2023)
 * Three methods: RMD, Fixed Amortization, Fixed Annuitization
 */

// ── Life expectancy tables (IRS Notice 2022-6, Appendix A) ──

// Single Life Expectancy Table — §1.401(a)(9)-9(b)
const SINGLE_LIFE_TABLE: Record<number, number> = {
  40: 45.7, 41: 44.7, 42: 43.6, 43: 42.6, 44: 41.6,
  45: 40.7, 46: 39.7, 47: 38.7, 48: 37.9, 49: 37.1,
  50: 36.2, 51: 35.3, 52: 34.3, 53: 33.4, 54: 32.5,
  55: 31.6, 56: 30.6, 57: 29.8, 58: 28.9, 59: 28.0,
  60: 27.1, 61: 26.2, 62: 25.4, 63: 24.5, 64: 23.7,
  65: 22.9, 66: 22.0, 67: 21.2, 68: 20.4, 69: 19.6,
  70: 18.8, 71: 18.0, 72: 17.2, 73: 16.4, 74: 15.6,
  75: 14.8, 76: 14.1, 77: 13.3, 78: 12.6, 79: 11.9,
  80: 11.2, 81: 10.5, 82: 9.9,  83: 9.2,  84: 8.6,
  85: 8.1,
}

// Uniform Lifetime Table — §1.401(a)(9)-9(c)
const UNIFORM_LIFETIME_TABLE: Record<number, number> = {
  40: 43.6, 41: 42.7, 42: 41.7, 43: 40.7, 44: 39.8,
  45: 38.8, 46: 37.9, 47: 37.0, 48: 36.0, 49: 35.1,
  50: 34.2, 51: 33.3, 52: 32.3, 53: 31.4, 54: 30.5,
  55: 29.6, 56: 28.7, 57: 27.9, 58: 27.0, 59: 26.1,
  60: 25.2, 61: 24.4, 62: 23.5, 63: 22.7, 64: 21.8,
  65: 21.0, 66: 20.2, 67: 19.4, 68: 18.6, 69: 17.8,
  70: 27.4, 71: 26.5, 72: 25.5, 73: 24.6, 74: 23.7,
  75: 22.9, 76: 22.0, 77: 21.2, 78: 20.3, 79: 19.5,
  80: 18.7, 81: 17.9, 82: 17.1, 83: 16.3, 84: 15.5,
  85: 14.8,
}

// Annuity factor table (Notice 2022-6 Appendix B)
// Key: `${age}_${ratePercent}` e.g. "50_5"
const ANNUITY_FACTORS: Record<string, number> = {
  '40_1': 40.19, '40_2': 33.25, '40_3': 27.84, '40_4': 23.59, '40_5': 20.21, '40_6': 17.49, '40_7': 15.29, '40_8': 13.49,
  '41_1': 39.61, '41_2': 32.77, '41_3': 27.44, '41_4': 23.26, '41_5': 19.93, '41_6': 17.25, '41_7': 15.09, '41_8': 13.32,
  '42_1': 39.02, '42_2': 32.28, '42_3': 27.03, '42_4': 22.92, '42_5': 19.64, '42_6': 17.00, '42_7': 14.88, '42_8': 13.14,
  '43_1': 38.42, '43_2': 31.78, '43_3': 26.61, '43_4': 22.57, '43_5': 19.34, '43_6': 16.74, '43_7': 14.67, '43_8': 12.96,
  '44_1': 37.81, '44_2': 31.27, '44_3': 26.18, '44_4': 22.21, '44_5': 19.04, '44_6': 16.48, '44_7': 14.45, '44_8': 12.77,
  '45_1': 37.19, '45_2': 30.74, '45_3': 25.74, '45_4': 21.84, '45_5': 18.73, '45_6': 16.21, '45_7': 14.22, '45_8': 12.58,
  '46_1': 36.56, '46_2': 30.21, '46_3': 25.29, '46_4': 21.46, '46_5': 18.41, '46_6': 15.94, '46_7': 13.99, '46_8': 12.38,
  '47_1': 35.92, '47_2': 29.66, '47_3': 24.83, '47_4': 21.07, '47_5': 18.09, '47_6': 15.66, '47_7': 13.75, '47_8': 12.18,
  '48_1': 35.27, '48_2': 29.10, '48_3': 24.36, '48_4': 20.67, '48_5': 17.76, '48_6': 15.38, '48_7': 13.51, '48_8': 11.97,
  '49_1': 34.61, '49_2': 28.53, '49_3': 23.88, '49_4': 20.26, '49_5': 17.42, '49_6': 15.09, '49_7': 13.26, '49_8': 11.76,
  '50_1': 33.94, '50_2': 27.95, '50_3': 23.39, '50_4': 19.85, '50_5': 17.08, '50_6': 14.80, '50_7': 13.01, '50_8': 11.54,
  '51_1': 33.26, '51_2': 27.36, '51_3': 22.89, '51_4': 19.43, '51_5': 16.73, '51_6': 14.50, '51_7': 12.75, '51_8': 11.32,
  '52_1': 32.57, '52_2': 26.76, '52_3': 22.38, '52_4': 19.00, '52_5': 16.37, '52_6': 14.19, '52_7': 12.49, '52_8': 11.09,
  '53_1': 31.87, '53_2': 26.15, '53_3': 21.86, '53_4': 18.56, '53_5': 16.01, '53_6': 13.88, '53_7': 12.22, '53_8': 10.86,
  '54_1': 31.16, '54_2': 25.53, '54_3': 21.33, '54_4': 18.12, '54_5': 15.64, '54_6': 13.57, '54_7': 11.95, '54_8': 10.62,
  '55_1': 30.44, '55_2': 24.90, '55_3': 20.79, '55_4': 17.67, '55_5': 15.27, '55_6': 13.25, '55_7': 11.68, '55_8': 10.38,
  '56_1': 29.71, '56_2': 24.27, '56_3': 20.25, '56_4': 17.21, '56_5': 14.89, '56_6': 12.93, '56_7': 11.40, '56_8': 10.14,
  '57_1': 28.98, '57_2': 23.62, '57_3': 19.70, '57_4': 16.75, '57_5': 14.51, '57_6': 12.60, '57_7': 11.12, '57_8': 9.89,
  '58_1': 28.24, '58_2': 22.97, '58_3': 19.14, '58_4': 16.28, '58_5': 14.12, '58_6': 12.27, '58_7': 10.83, '58_8': 9.64,
  '59_1': 27.49, '59_2': 22.31, '59_3': 18.57, '59_4': 15.80, '59_5': 13.73, '59_6': 11.94, '59_7': 10.54, '59_8': 9.38,
  '60_1': 26.73, '60_2': 21.64, '60_3': 18.00, '60_4': 15.32, '60_5': 13.33, '60_6': 11.60, '60_7': 10.24, '60_8': 9.12,
}

export type LifeTable = 'uniform' | 'single' | 'joint'

export interface SEPPInputs {
  accountBalance: number
  currentAge: number
  beneficiaryAge?: number
  interestRate: number
  lifeTable: LifeTable
  midTermAFR?: number
}

export interface SEPPResult {
  method: 'rmd' | 'amortization' | 'annuitization'
  annualPayment: number
  monthlyPayment: number
  lifeExpectancyFactor: number
  lockInEndAge: number
  lockInEndYear: number
  minimumDuration: number
  notes: string[]
}

export interface SEPPComparison {
  rmd: SEPPResult
  amortization: SEPPResult
  annuitization: SEPPResult | null
  maxRateAllowed: number
  recommendedMethod: 'rmd' | 'amortization' | 'annuitization'
}

export function calcMaxAllowedRate(midTermAFR: number): number {
  return Math.max(0.05, midTermAFR * 1.20)
}

export function getLifeExpectancyFactor(
  age: number,
  table: LifeTable,
  beneficiaryAge?: number
): number {
  const roundedAge = Math.floor(age)
  const clampedAge = Math.min(Math.max(roundedAge, 40), 85)

  if (table === 'single') {
    return SINGLE_LIFE_TABLE[clampedAge] ?? 8.1
  }
  if (table === 'uniform') {
    return UNIFORM_LIFETIME_TABLE[clampedAge] ?? 8.6
  }
  // Joint — use the larger of the two single life factors
  if (beneficiaryAge !== undefined) {
    const ownerFactor = SINGLE_LIFE_TABLE[clampedAge] ?? 8.1
    const beneFactor = SINGLE_LIFE_TABLE[Math.min(Math.max(Math.floor(beneficiaryAge), 40), 85)] ?? 8.1
    return Math.max(ownerFactor, beneFactor)
  }
  return SINGLE_LIFE_TABLE[clampedAge] ?? 8.1
}

export function calcLockIn(currentAge: number): { endAge: number; years: number } {
  const fiveYearEnd = currentAge + 5
  const endAge = Math.max(fiveYearEnd, 59.5)
  return { endAge, years: endAge - currentAge }
}

export function calcRMD(inputs: SEPPInputs): SEPPResult {
  const factor = getLifeExpectancyFactor(inputs.currentAge, inputs.lifeTable, inputs.beneficiaryAge)
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

export function calcAmortization(inputs: SEPPInputs): SEPPResult {
  const factor = getLifeExpectancyFactor(inputs.currentAge, inputs.lifeTable, inputs.beneficiaryAge)
  const r = inputs.interestRate
  const n = factor

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

export function calcAnnuitization(inputs: SEPPInputs): SEPPResult | null {
  const age = Math.floor(inputs.currentAge)
  const ratePercent = Math.round(inputs.interestRate * 100)
  const key = `${age}_${ratePercent}`

  let annuityFactor = ANNUITY_FACTORS[key]

  if (!annuityFactor) {
    const lowerRate = Math.floor(inputs.interestRate * 100)
    const upperRate = Math.ceil(inputs.interestRate * 100)
    const lowerKey = `${age}_${lowerRate}`
    const upperKey = `${age}_${upperRate}`

    if (ANNUITY_FACTORS[lowerKey] && ANNUITY_FACTORS[upperKey]) {
      const t = (inputs.interestRate * 100) - lowerRate
      annuityFactor = ANNUITY_FACTORS[lowerKey] * (1 - t) + ANNUITY_FACTORS[upperKey] * t
    } else {
      return null
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
      'Can produce higher or lower payment than amortization depending on age and rate',
      'Payment fixed for duration of SEPP',
    ],
  }
}

export function calcSEPPComparison(inputs: SEPPInputs): SEPPComparison {
  const rmd = calcRMD(inputs)
  const amortization = calcAmortization(inputs)
  const annuitization = calcAnnuitization(inputs)

  const maxRateAllowed = inputs.midTermAFR
    ? calcMaxAllowedRate(inputs.midTermAFR)
    : 0.05

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

export interface SplitStrategy {
  primaryBalance: number
  reserveBalance: number
  primaryAnnualPayment: number
  rationale: string
}

export function calcAccountSplit(inputs: SEPPInputs, targetAnnualIncome: number): SplitStrategy {
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