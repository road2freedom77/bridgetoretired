import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'
import { CALCULATION_VERSION, scenarioInputToDbColumns } from '@/lib/planner/types'
import { validateScenarioInput, validateScenarioName, validateSource } from '@/lib/planner/validate'

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabaseAdmin
      .from('scenarios')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ scenarios: data })
  } catch (err) {
    console.error('Get scenarios error:', err)
    return NextResponse.json({ error: 'Failed to fetch scenarios' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { inputs: rawInputs, results, email } = body

    // Validate name
    const nameResult = validateScenarioName(body.name)

    // Validate source — from explicit field or legacy risk_flags._source
    const source = validateSource(body.source ?? results?.riskFlags?._source)

    // Validate and clean inputs
    const validation = validateScenarioInput(rawInputs ?? {})
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Invalid scenario inputs', details: validation.errors },
        { status: 400 }
      )
    }

    const inputs = validation.cleaned

    // Ensure user exists in our users table
    await supabaseAdmin
      .from('users')
      .upsert({ id: userId, email: email || '' }, { onConflict: 'id' })

    // Count scenarios for this source (planner and compare each get 5 slots)
    const { count, error: countError } = await supabaseAdmin
      .from('scenarios')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('source', source)

    if (countError) throw countError

    if ((count ?? 0) >= 5) {
      return NextResponse.json(
        { error: 'Maximum 5 scenarios allowed. Delete one to save a new scenario.' },
        { status: 400 }
      )
    }

    // Build row
    const dbColumns = scenarioInputToDbColumns(inputs)

    const { data, error } = await supabaseAdmin
      .from('scenarios')
      .insert({
        user_id: userId,
        name: nameResult.name,
        ...dbColumns,
        // Cached calculation outputs
        monte_carlo_success: results?.monteCarlo?.successRate ?? null,
        withdrawal_rate:     results?.withdrawalRate ?? null,
        portfolio_at_90:     results?.portfolioAt90 ?? null,
        // Keep risk_flags for backward compat, but strip _source metadata
        risk_flags:          stripSourceMeta(results?.riskFlags),
        // New metadata columns
        source,
        calculation_version: CALCULATION_VERSION,
        manual_name:         true,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ scenario: data })
  } catch (err) {
    console.error('Save scenario error:', err)
    return NextResponse.json({ error: 'Failed to save scenario' }, { status: 500 })
  }
}

// Remove _source, partTimeYears, healthcareCost from risk_flags
// since they now have their own columns.
function stripSourceMeta(riskFlags: any): any {
  if (!riskFlags || typeof riskFlags !== 'object') return riskFlags
  const { _source, partTimeYears, healthcareCost, partTimeIncome, ...rest } = riskFlags
  // Return null if nothing meaningful remains
  return Object.keys(rest).length > 0 ? rest : null
}