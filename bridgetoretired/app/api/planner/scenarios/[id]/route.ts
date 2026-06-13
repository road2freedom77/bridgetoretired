import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'

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
    const { name, inputs, results } = body

    const { data, error } = await supabaseAdmin
      .from('scenarios')
      .update({
        name,
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
        monte_carlo_success: results?.monteCarlo?.successRate,
        withdrawal_rate: results?.withdrawalRate,
        portfolio_at_90: results?.portfolioAt90,
        risk_flags: results?.riskFlags,
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