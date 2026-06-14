import { PlannerInputs, BridgeYear } from './types'

export interface TaxYear {
  year: number
  age: number
  grossIncome: number
  stdDeduction: number
  taxableIncome: number
  federalTax: number
  stateTax: number
  totalTax: number
  effectiveRate: number
}

// 2026 federal brackets
const MFJ_BRACKETS = [
  { rate: 0.10, from: 0,       to: 23850 },
  { rate: 0.12, from: 23850,   to: 96950 },
  { rate: 0.22, from: 96950,   to: 206700 },
  { rate: 0.24, from: 206700,  to: 394600 },
  { rate: 0.32, from: 394600,  to: 501050 },
  { rate: 0.35, from: 501050,  to: 751600 },
  { rate: 0.37, from: 751600,  to: Infinity },
]

const SINGLE_BRACKETS = [
  { rate: 0.10, from: 0,       to: 11925 },
  { rate: 0.12, from: 11925,   to: 48475 },
  { rate: 0.22, from: 48475,   to: 103350 },
  { rate: 0.24, from: 103350,  to: 197300 },
  { rate: 0.32, from: 197300,  to: 250525 },
  { rate: 0.35, from: 250525,  to: 375800 },
  { rate: 0.37, from: 375800,  to: Infinity },
]

const STD_DEDUCTION = { MFJ: 30000, Single: 15000 }

function calcFederalTax(taxableIncome: number, filingStatus: 'MFJ' | 'Single'): number {
  if (taxableIncome <= 0) return 0
  const brackets = filingStatus === 'MFJ' ? MFJ_BRACKETS : SINGLE_BRACKETS
  let tax = 0
  for (const bracket of brackets) {
    if (taxableIncome <= bracket.from) break
    const taxable = Math.min(taxableIncome, bracket.to) - bracket.from
    tax += taxable * bracket.rate
  }
  return tax
}

export function calcTaxEstimate(
  inputs: PlannerInputs,
  bridgeYears: BridgeYear[]
): TaxYear[] {
  if (bridgeYears.length === 0) return []

  return bridgeYears.map(y => {
    // Gross income = 401k draws + Roth conversions (simplified: just 401k draws for now)
    const grossIncome = y.from401k + y.fromRoth

    const stdDeduction = STD_DEDUCTION[inputs.filingStatus]
    const taxableIncome = Math.max(0, grossIncome - stdDeduction)
    const federalTax = calcFederalTax(taxableIncome, inputs.filingStatus)
    const stateTax = taxableIncome * inputs.stateTaxRate
    const totalTax = federalTax + stateTax
    const effectiveRate = grossIncome > 0 ? totalTax / grossIncome : 0

    return {
      year: y.year,
      age: y.age,
      grossIncome,
      stdDeduction,
      taxableIncome,
      federalTax,
      stateTax,
      totalTax,
      effectiveRate,
    }
  })
}