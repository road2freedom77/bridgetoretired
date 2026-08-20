import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'
import { CALCULATION_VERSION, scenarioInputToDbColumns } from '@/lib/planner/types'
import { validateScenarioInput, validateScenarioName } from '@/lib/planner/validate'

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabaseAdmin
      .from('scenarios')
      .delete()
      .eq('id', params.id)
      .eq('user_id', userId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Delete scenario error:', err)
    return NextResponse.json({ error: 'Failed to delete scenario' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { inputs: rawInputs, results } = body

    // Validate name
    const nameResult = validateScenarioName(body.name)

    // Validate and clean inputs
    const validation = validateScenarioInput(rawInputs ?? {})
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Invalid scenario inputs', details: validation.errors },
        { status: 400 }
      )
    }

    const inputs = validation.cleaned
    const dbColumns = scenarioInputToDbColumns(inputs)

    const { data, error } = await supabaseAdmin
      .from('scenarios')
      .update({
        name: nameResult.name,
        ...dbColumns,
        // Cached calculation outputs
        monte_carlo_success: results?.monteCarlo?.successRate ?? null,
        withdrawal_rate:     results?.withdrawalRate ?? null,
        portfolio_at_90:     results?.portfolioAt90 ?? null,
        // Keep risk_flags for backward compat, strip metadata
        risk_flags:          stripSourceMeta(results?.riskFlags),
        // Update version on every save
        calculation_version: CALCULATION_VERSION,
        // Mark name as manually set if explicitly provided
        manual_name:         typeof body.name === 'string' && body.name.trim().length > 0,
updated_at:          new Date().toISOString(),
      })
      .eq('id', params.id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ scenario: data })
  } catch (err) {
    console.error('Update scenario error:', err)
    return NextResponse.json({ error: 'Failed to update scenario' }, { status: 500 })
  }
}

function stripSourceMeta(riskFlags: any): any {
  if (!riskFlags || typeof riskFlags !== 'object') return riskFlags
  const { _source, partTimeYears, healthcareCost, partTimeIncome, ...rest } = riskFlags
  return Object.keys(rest).length > 0 ? rest : null
}