import { NextRequest, NextResponse } from 'next/server'
import { runPlan } from '@/lib/planner'
import { PlannerInputs } from '@/lib/planner/types'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const inputs: PlannerInputs = body

    // Basic validation
    if (!inputs.currentAge || !inputs.retireAge || !inputs.spending) {
      return NextResponse.json(
        { error: 'Missing required inputs' },
        { status: 400 }
      )
    }

    if (inputs.retireAge <= inputs.currentAge) {
      return NextResponse.json(
        { error: 'Retirement age must be greater than current age' },
        { status: 400 }
      )
    }

    if (inputs.lifeExpectancy <= inputs.retireAge) {
      return NextResponse.json(
        { error: 'Life expectancy must be greater than retirement age' },
        { status: 400 }
      )
    }

    const results = runPlan(inputs)

    return NextResponse.json({ success: true, results })
  } catch (err) {
    console.error('Calculate error:', err)
    return NextResponse.json(
      { error: 'Failed to calculate plan' },
      { status: 500 }
    )
  }
}