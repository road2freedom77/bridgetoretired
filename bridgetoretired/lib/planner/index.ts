import { PlannerInputs, PlannerResults } from './types'
import { calcBridge } from './bridge'
import { calcPost595, getPortfolioAt90 } from './post595'
import { runMonteCarlo } from './monteCarlo'
import { calcRiskFlags } from './riskFlags'

export function runPlan(inputs: PlannerInputs): PlannerResults {
  // 1. Bridge years
  const bridgeYears = calcBridge(inputs)

  // 2. Post-59½ projection
  const post595Years = calcPost595(inputs, bridgeYears)

  // 3. Monte Carlo
  const monteCarlo = runMonteCarlo(inputs, bridgeYears)

  // 4. Risk flags
  const riskFlags = calcRiskFlags(inputs, bridgeYears, post595Years, monteCarlo)

  // 5. Key metrics
  const totalPortfolio = inputs.taxable + inputs.cash + inputs.k401 + inputs.roth
  const withdrawalRate = inputs.spending / totalPortfolio
  const bridgeLength = Math.max(0, 59.5 - inputs.retireAge)
  const portfolioAt90 = getPortfolioAt90(post595Years)

  return {
    bridgeYears,
    post595Years,
    riskFlags,
    monteCarlo,
    withdrawalRate,
    bridgeLength,
    portfolioAt90,
  }
}

export type { PlannerInputs, PlannerResults } from './types'