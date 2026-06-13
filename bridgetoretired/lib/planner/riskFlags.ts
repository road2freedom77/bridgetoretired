import { PlannerInputs, BridgeYear, Post595Year, MonteCarloResult, RiskFlag } from './types'

export function calcRiskFlags(
  inputs: PlannerInputs,
  bridgeYears: BridgeYear[],
  post595Years: Post595Year[],
  monteCarlo: MonteCarloResult
): RiskFlag[] {
  const flags: RiskFlag[] = []
  const totalPortfolio = inputs.taxable + inputs.cash + inputs.k401 + inputs.roth
  const withdrawalRate = inputs.spending / totalPortfolio

  // 1. Withdrawal rate
  flags.push({
    label: 'Withdrawal rate ≤ 4%?',
    status: withdrawalRate <= 0.04 ? 'ok' : 'warning',
    value: withdrawalRate <= 0.04
      ? `✓ OK`
      : `⚠ HIGH — ${(withdrawalRate * 100).toFixed(1)}%`,
    detail: withdrawalRate <= 0.04
      ? `Initial rate ${(withdrawalRate * 100).toFixed(1)}% within guideline.`
      : `Exceeds 4% rule. At a 35+ yr horizon target 3.3%. Reduce spending or grow portfolio.`,
  })

  // 2. Taxable funds bridge
  const bridgeGap = bridgeYears.some(y => y.from401k > 0)
  const bridgeFunded = bridgeYears.length === 0 || !bridgeGap
  flags.push({
    label: 'Taxable funds entire bridge?',
    status: bridgeFunded ? 'ok' : 'warning',
    value: bridgeFunded ? '✓ FUNDED' : '⚠ GAP',
    detail: bridgeYears.length === 0
      ? 'No bridge needed — retiring at or after 59½.'
      : bridgeFunded
      ? 'Taxable+cash covers every bridge year.'
      : 'Bridge dips into Roth/401k — see BRIDGE tab for which years.',
  })

  // 3. Penalty risk
  const penaltyAmount = bridgeYears.reduce((sum, y) => sum + y.from401k, 0)
  flags.push({
    label: 'No 401k draws before 59½?',
    status: penaltyAmount === 0 ? 'ok' : 'danger',
    value: penaltyAmount === 0 ? '✓ CLEAN' : '✗ PENALTY RISK',
    detail: penaltyAmount === 0
      ? 'No early 401k withdrawals.'
      : `401k tapped during bridge = 10% penalty unless using 72(t). Total: $${Math.round(penaltyAmount).toLocaleString()}`,
  })

  // 4. Cash buffer
  const cashYears = (inputs.taxable + inputs.cash) / inputs.spending
  flags.push({
    label: 'Cash buffer ≥ 1 year?',
    status: cashYears >= 1 ? 'ok' : 'warning',
    value: cashYears >= 1 ? '✓ OK' : '⚠ THIN',
    detail: `Cash covers ${cashYears.toFixed(1)} years of spending. 1–2 yrs protects against selling in a downturn.`,
  })

  // 5. ACA cliff — simplified check based on income
  const bridgeIncome = inputs.otherIncome + (inputs.spending * 0.6)
  const acaCliff = inputs.filingStatus === 'MFJ' ? 81760 : 51760
  const acaOk = bridgeIncome < acaCliff
  flags.push({
    label: 'ACA cliff clear in all bridge years?',
    status: acaOk ? 'ok' : 'warning',
    value: acaOk ? '✓ OK' : '⚠ REVIEW',
    detail: acaOk
      ? 'MAGI under est. 400% FPL cliff every bridge year.'
      : 'Bridge income may push MAGI above ACA cliff — may reduce or eliminate premium tax credits.',
  })

  // 6. SS delay opportunity
  const ssDelayGain = inputs.ssAge < 70
    ? Math.round(inputs.ssBenefit * 0.08 * (70 - inputs.ssAge))
    : 0
  flags.push({
    label: 'SS delay opportunity',
    status: inputs.ssAge >= 70 ? 'ok' : 'advisory',
    value: inputs.ssAge >= 70 ? '✓ MAXED' : '💡 CONSIDER 70',
    detail: inputs.ssAge >= 70
      ? 'Claiming at 70 = maximum benefit.'
      : `Delaying from ${inputs.ssAge} to 70 adds ~$${ssDelayGain.toLocaleString()}/yr permanently (8%/yr).`,
  })

  // 7. IRMAA
  const irmaaThreshold = inputs.filingStatus === 'MFJ' ? 212000 : 106000
  const irmaaRisk = inputs.spending + inputs.otherIncome > irmaaThreshold
  flags.push({
    label: 'IRMAA Medicare trigger?',
    status: irmaaRisk ? 'warning' : 'ok',
    value: irmaaRisk ? '⚠ REVIEW' : '✓ OK',
    detail: `2026 IRMAA starts at $${irmaaThreshold.toLocaleString()} (${inputs.filingStatus}) MAGI. Large Roth conversions near Medicare age can trigger surcharges.`,
  })

  // 8. Portfolio survives to life expectancy
  const last = post595Years[post595Years.length - 1]
  const survives = last
    ? (last.portfolioBalance + last.rothBalance) > 0
    : false
  const balanceAtEnd = last
    ? Math.round(last.portfolioBalance + last.rothBalance)
    : 0
  flags.push({
    label: 'Portfolio survives to life expectancy?',
    status: survives ? 'ok' : 'danger',
    value: survives ? '✓ FUNDED' : '✗ DEPLETED',
    detail: survives
      ? `Projected $${balanceAtEnd.toLocaleString()} at age ${inputs.lifeExpectancy}.`
      : 'Deterministic projection depletes — reduce spending or delay retirement.',
  })

  // 9. Monte Carlo
  const mc = monteCarlo.successRate
  const mcStatus = mc >= 0.9 ? 'ok' : mc >= 0.75 ? 'warning' : 'warning'
  flags.push({
    label: 'Monte Carlo success ≥ 80%?',
    status: mcStatus,
    value: mc >= 0.8 ? `✓ ${Math.round(mc * 100)}%` : `⚠ ${Math.round(mc * 100)}%`,
    detail: mc >= 0.9
      ? 'Robust across randomized sequences.'
      : mc >= 0.75
      ? 'Acceptable — needs spending flexibility in bad markets.'
      : 'Fragile — plan fails too often under sequence risk.',
  })

  return flags
}