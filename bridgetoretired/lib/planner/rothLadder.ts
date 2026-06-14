import { PlannerInputs, BridgeYear } from './types'

export interface RothLadderYear {
  year: number
  age: number
  bracketSpaceLeft: number
  suggestedConversion: number
  taxOnConversion: number
  magi: number
  acaCliff: number
  acaStatus: 'ok' | 'over'
  unlocksYear: number
}

// 2026 12% bracket top
const BRACKET_12_TOP = { MFJ: 96950, Single: 48475 }

// 2026 ACA 400% FPL estimate
const ACA_CLIFF = { MFJ: 81760, Single: 51760 }

function calc12Tax(taxableIncome: number, filingStatus: 'MFJ' | 'Single'): number {
  if (taxableIncome <= 0) return 0
  const stdDed = filingStatus === 'MFJ' ? 30000 : 15000
  const bracketStart = filingStatus === 'MFJ' ? 23850 : 11925
  const bracketEnd = filingStatus === 'MFJ' ? 96950 : 48475

  // Tax on conversion at 12% marginal
  const taxable = Math.max(0, taxableIncome - stdDed)
  const inBracket = Math.max(0, Math.min(taxable, bracketEnd) - bracketStart)
  return inBracket * 0.12
}

export function calcRothLadder(
  inputs: PlannerInputs,
  bridgeYears: BridgeYear[]
): RothLadderYear[] {
  if (bridgeYears.length === 0) return []

  const stdDed = inputs.filingStatus === 'MFJ' ? 30000 : 15000
  const bracket12Top = BRACKET_12_TOP[inputs.filingStatus]
  const acaCliff = ACA_CLIFF[inputs.filingStatus]

  return bridgeYears.map((y, i) => {
    // Bridge income = 401k draws (taxable income source)
    const bridgeIncome = y.from401k

    // Taxable income before conversion
    const taxableBeforeConv = Math.max(0, bridgeIncome - stdDed)

    // 12% bracket space remaining after bridge income
    const bracketSpaceLeft = Math.max(0, bracket12Top - taxableBeforeConv - stdDed)

    // ACA cliff headroom
    const acaHeadroom = Math.max(0, acaCliff - bridgeIncome)

    // Suggested conversion = min of bracket space and ACA headroom
    const suggestedConversion = Math.min(bracketSpaceLeft, acaHeadroom)

    // Tax on conversion at 12%
    const taxOnConversion = suggestedConversion * 0.12

    // MAGI = bridge income + conversion
    const magi = bridgeIncome + suggestedConversion

    // ACA cliff check
    const acaStatus: 'ok' | 'over' = magi >= acaCliff ? 'over' : 'ok'

    // 5-year unlock rule — conversion unlocks in year + 5
    const unlocksYear = y.year + 5

    return {
      year: y.year,
      age: y.age,
      bracketSpaceLeft,
      suggestedConversion,
      taxOnConversion,
      magi,
      acaCliff,
      acaStatus,
      unlocksYear,
    }
  })
}