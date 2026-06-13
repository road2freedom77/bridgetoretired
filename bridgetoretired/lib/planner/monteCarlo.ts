import { PlannerInputs, BridgeYear, MonteCarloResult } from './types'
import { getBridgeEndBalances } from './bridge'

function randomNormal(mean: number, std: number): number {
  // Box-Muller transform
  const u1 = Math.random()
  const u2 = Math.random()
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
  return mean + std * z
}

export function runMonteCarlo(
  inputs: PlannerInputs,
  bridgeYears: BridgeYear[],
  sims = 200
): MonteCarloResult {
  const { taxable, roth, k401 } = getBridgeEndBalances(inputs, bridgeYears)
  const startBalance = taxable + roth + k401
  const startAge = Math.max(59.5, inputs.retireAge)
  const retirementYears = inputs.lifeExpectancy - startAge
  const bridgeCount = bridgeYears.length

  const finalBalances: number[] = []

  for (let s = 0; s < sims; s++) {
    let balance = startBalance

    for (let y = 0; y < Math.ceil(retirementYears); y++) {
      const age = startAge + y
      if (age > inputs.lifeExpectancy) break

      const yearsFromRetire = (inputs.retireAge - inputs.currentAge) + 
        bridgeCount + y
      const spending = inputs.spending * 
        Math.pow(1 + inputs.inflation, yearsFromRetire)

      const ss = age >= inputs.ssAge
        ? inputs.ssBenefit * Math.pow(1 + inputs.inflation, yearsFromRetire)
        : 0

      const withdrawal = Math.max(0, spending - ss - inputs.otherIncome)
      const annualReturn = randomNormal(inputs.returnRate, inputs.volatility)

      balance = Math.max(0, (balance - withdrawal) * (1 + annualReturn))
    }

    finalBalances.push(balance)
  }

  finalBalances.sort((a, b) => a - b)

  const successes = finalBalances.filter(b => b > 0).length
  const successRate = successes / sims

  return {
    successRate,
    median: finalBalances[Math.floor(sims * 0.5)],
    p10: finalBalances[Math.floor(sims * 0.1)],
    p90: finalBalances[Math.floor(sims * 0.9)],
  }
}