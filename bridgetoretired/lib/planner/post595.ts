import { PlannerInputs, Post595Year, BridgeYear } from './types'
import { getBridgeEndBalances } from './bridge'

export function calcPost595(
  inputs: PlannerInputs,
  bridgeYears: BridgeYear[]
): Post595Year[] {
  const years: Post595Year[] = []
  const { taxable, roth, k401 } = getBridgeEndBalances(inputs, bridgeYears)
  
  const startAge = Math.max(59.5, inputs.retireAge)
  const startYear = new Date().getFullYear() + 
    (inputs.retireAge - inputs.currentAge) + bridgeYears.length
  const totalYears = inputs.lifeExpectancy - startAge

  let portfolio = taxable + k401  // combined non-Roth
  let rothBalance = roth

  for (let i = 0; i < Math.ceil(totalYears); i++) {
    const age = startAge + i
    if (age > inputs.lifeExpectancy) break

    const yearsFromRetire = (inputs.retireAge - inputs.currentAge) + 
      bridgeYears.length + i
    const spending = inputs.spending * 
      Math.pow(1 + inputs.inflation, yearsFromRetire)
    
    const ssIncome = age >= inputs.ssAge
      ? inputs.ssBenefit * Math.pow(1 + inputs.inflation, yearsFromRetire)
      : 0

    const otherIncome = inputs.otherIncome

    // Draw from portfolio first, preserve Roth
    let netWithdrawal = Math.max(0, spending - ssIncome - otherIncome)
    
    // If portfolio depleted, draw from Roth
    if (netWithdrawal > portfolio && rothBalance > 0) {
      const fromRoth = Math.min(netWithdrawal - portfolio, rothBalance)
      rothBalance = Math.max(0, rothBalance - fromRoth)
      netWithdrawal = Math.min(netWithdrawal, portfolio + fromRoth)
    }

    const portfolioWithdrawal = Math.min(netWithdrawal, portfolio)
    portfolio = Math.max(0, (portfolio - portfolioWithdrawal) * 
      (1 + inputs.returnRate))
    rothBalance = rothBalance * (1 + inputs.returnRate)

    years.push({
      year: startYear + i,
      age,
      spending,
      ssIncome,
      otherIncome,
      netWithdrawal,
      portfolioBalance: portfolio,
      rothBalance,
    })
  }

  return years
}

export function getPortfolioAt90(post595Years: Post595Year[]): number {
  const at90 = post595Years.find(y => Math.floor(y.age) === 90)
  if (at90) return at90.portfolioBalance + at90.rothBalance
  const last = post595Years[post595Years.length - 1]
  return last ? last.portfolioBalance + last.rothBalance : 0
}