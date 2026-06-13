import { PlannerInputs, BridgeYear } from './types'

export function calcBridge(inputs: PlannerInputs): BridgeYear[] {
  const bridgeLength = Math.max(0, 59.5 - inputs.retireAge)
  const years: BridgeYear[] = []
  const startYear = new Date().getFullYear() + (inputs.retireAge - inputs.currentAge)

  let taxable = inputs.taxable + inputs.cash
  let roth = inputs.roth
  let k401 = inputs.k401

  for (let i = 0; i < Math.min(Math.ceil(bridgeLength), 15); i++) {
    const age = inputs.retireAge + i
    if (age >= 59.5) break

    const spending = inputs.spending * Math.pow(1 + inputs.inflation, i)
    const otherIncome = inputs.otherIncome
    const netNeeded = Math.max(0, spending - otherIncome)

    const fromTaxable = Math.min(netNeeded, taxable)
    const fromRoth = Math.min(netNeeded - fromTaxable, roth)
    const from401k = Math.min(netNeeded - fromTaxable - fromRoth, k401)

    const taxableEnd = Math.max(0, taxable - fromTaxable) * (1 + inputs.returnRate)
    const rothEnd = Math.max(0, roth - fromRoth) * (1 + inputs.returnRate)
    const k401End = Math.max(0, k401 - from401k) * (1 + inputs.returnRate)

    years.push({
      year: startYear + i,
      age,
      spending,
      otherIncome,
      netNeeded,
      taxableStart: taxable,
      rothStart: roth,
      k401Start: k401,
      fromTaxable,
      fromRoth,
      from401k,
      taxableEnd,
      rothEnd,
      k401End,
      totalEnd: taxableEnd + rothEnd + k401End,
    })

    taxable = taxableEnd
    roth = rothEnd
    k401 = k401End
  }

  return years
}

export function getBridgeEndBalances(
  inputs: PlannerInputs,
  bridgeYears: BridgeYear[]
): { taxable: number; roth: number; k401: number } {
  if (bridgeYears.length === 0) {
    return {
      taxable: inputs.taxable + inputs.cash,
      roth: inputs.roth,
      k401: inputs.k401,
    }
  }
  const last = bridgeYears[bridgeYears.length - 1]
  return {
    taxable: last.taxableEnd,
    roth: last.rothEnd,
    k401: last.k401End,
  }
}