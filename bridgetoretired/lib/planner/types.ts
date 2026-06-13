export interface PlannerInputs {
  currentAge: number
  retireAge: number
  ssAge: number
  lifeExpectancy: number
  filingStatus: 'MFJ' | 'Single'
  state: string
  stateTaxRate: number
  taxable: number
  k401: number
  roth: number
  cash: number
  spending: number
  inflation: number
  otherIncome: number
  ssBenefit: number
  returnRate: number
  volatility: number
}

export interface BridgeYear {
  year: number
  age: number
  spending: number
  otherIncome: number
  netNeeded: number
  taxableStart: number
  rothStart: number
  k401Start: number
  fromTaxable: number
  fromRoth: number
  from401k: number
  taxableEnd: number
  rothEnd: number
  k401End: number
  totalEnd: number
}

export interface Post595Year {
  year: number
  age: number
  spending: number
  ssIncome: number
  otherIncome: number
  netWithdrawal: number
  portfolioBalance: number
  rothBalance: number
}

export interface RiskFlag {
  label: string
  status: 'ok' | 'warning' | 'danger' | 'advisory'
  value: string
  detail: string
}

export interface MonteCarloResult {
  successRate: number
  median: number
  p10: number
  p90: number
}

export interface PlannerResults {
  bridgeYears: BridgeYear[]
  post595Years: Post595Year[]
  riskFlags: RiskFlag[]
  monteCarlo: MonteCarloResult
  withdrawalRate: number
  bridgeLength: number
  portfolioAt90: number
}