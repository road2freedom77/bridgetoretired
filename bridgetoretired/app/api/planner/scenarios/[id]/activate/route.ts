import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Clear any existing active scenario for this user
    await supabaseAdmin
      .from('scenarios')
      .update({ is_active: false })
      .eq('user_id', userId)

    // Set the new active scenario
    const { data, error } = await supabaseAdmin
      .from('scenarios')
      .update({ is_active: true })
      .eq('id', params.id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ scenario: data })
  } catch (err) {
    console.error('Activate scenario error:', err)
    return NextResponse.json({ error: 'Failed to activate scenario' }, { status: 500 })
  }
}