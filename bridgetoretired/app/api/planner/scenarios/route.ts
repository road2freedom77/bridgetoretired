import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'

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
    const { name, inputs, results } = body

    // Ensure user exists in our users table
    await supabaseAdmin
      .from('users')
      .upsert({ id: userId, email: body.email || '' }, { onConflict: 'id' })

    // Check scenario limit (5 per user)
    const { count } = await supabaseAdmin
      .from('scenarios')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (count && count >= 5) {
      return NextResponse.json(
        { error: 'Maximum 5 scenarios allowed. Delete one to save a new scenario.' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('scenarios')
      .insert({
        user_id: userId,
        name: name || 'My Plan',
        // INPUTS
        current_age: inputs.currentAge,
        retire_age: inputs.retireAge,
        ss_age: inputs.ssAge,
        life_expectancy: inputs.lifeExpectancy,
        filing_status: inputs.filingStatus,
        state: inputs.state,
        state_tax_rate: inputs.stateTaxRate,
        taxable: inputs.taxable,
        k401: inputs.k401,
        roth: inputs.roth,
        cash: inputs.cash,
        spending: inputs.spending,
        inflation: inputs.inflation,
        other_income: inputs.otherIncome,
        ss_benefit: inputs.ssBenefit,
        return_rate: inputs.returnRate,
        volatility: inputs.volatility,
        // Cached outputs
        monte_carlo_success: results?.monteCarlo?.successRate,
        withdrawal_rate: results?.withdrawalRate,
        portfolio_at_90: results?.portfolioAt90,
        risk_flags: results?.riskFlags,
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