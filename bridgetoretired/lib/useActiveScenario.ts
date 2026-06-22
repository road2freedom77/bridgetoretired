import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'

export interface ActiveScenarioData {
  id:          string
  name:        string
  retire_age:  number
  current_age: number
  ss_age:      number
  life_expectancy: number
  taxable:     number
  k401:        number
  roth:        number
  cash:        number
  spending:    number
  inflation:   number
  other_income:number
  ss_benefit:  number
  return_rate: number
  volatility:  number
  risk_flags:  any
}

export function useActiveScenario() {
  const { user, isLoaded } = useUser()
  const isPro = (user?.publicMetadata as any)?.isPro === true

  const [active,  setActive]  = useState<ActiveScenarioData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoaded || !isPro) { setLoading(false); return }

    const fetch_ = async () => {
      try {
        const res  = await fetch('/api/planner/scenarios')
        const data = await res.json()
        if (data.scenarios) {
          const found = data.scenarios.find((s: any) => s.is_active === true)
          setActive(found ?? null)
        }
      } catch (err) {
        console.error('useActiveScenario error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetch_()
  }, [isLoaded, isPro])

  return { active, loading }
}