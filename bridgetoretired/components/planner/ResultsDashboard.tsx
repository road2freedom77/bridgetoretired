'use client'

import { PlannerInputs, PlannerResults } from '@/lib/planner/types'
import { useState } from 'react'
import RiskFlagsTab from './tabs/RiskFlagsTab'
import BridgeTab from './tabs/BridgeTab'
import MonteCarloTab from './tabs/MonteCarloTab'
import OverviewTab from './tabs/OverviewTab'
import TaxEstimateTab from './tabs/TaxEstimateTab'
import RothLadderTab from './tabs/RothLadderTab'

interface Props {
  results: PlannerResults
  inputs: PlannerInputs
}

const TABS = ['Overview', 'Bridge', 'Tax Estimate', 'Roth Ladder', 'Monte Carlo', 'Risk Flags']

export default function ResultsDashboard({ results, inputs }: Props) {
  const [activeTab, setActiveTab] = useState('Overview')

  return (
    <div className="bg-ink border border-white/[0.07] rounded-xl overflow-hidden h-full flex flex-col">
      {/* Tab bar */}
      <div className="flex border-b border-white/[0.06] bg-navy/50 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-3 font-mono text-[10px] tracking-widest uppercase transition-colors border-b-2 whitespace-nowrap ${
              activeTab === tab
                ? 'text-gold border-gold'
                : 'text-white/30 border-transparent hover:text-white/60'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'Overview' && (
          <OverviewTab results={results} inputs={inputs} />
        )}
        {activeTab === 'Bridge' && (
          <BridgeTab results={results} />
        )}
        {activeTab === 'Tax Estimate' && (
          <TaxEstimateTab results={results} inputs={inputs} />
        )}
        {activeTab === 'Roth Ladder' && (
          <RothLadderTab results={results} inputs={inputs} />
        )}
        {activeTab === 'Monte Carlo' && (
          <MonteCarloTab results={results} />
        )}
        {activeTab === 'Risk Flags' && (
          <RiskFlagsTab results={results} />
        )}
      </div>
    </div>
  )
}