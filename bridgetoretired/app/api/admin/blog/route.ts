import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const ADMIN_USER_ID = 'user_3Ev0Q9ORn9oZwaXGROJq4bniaBI'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function getAuthUserId(): Promise<string | null> {
  try {
    const { userId } = await auth()
    return userId
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthUserId()
    if (userId !== ADMIN_USER_ID) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { id, ...record } = body

    let error
    if (id) {
      ;({ error } = await supabaseAdmin.from('blog_posts').update(record).eq('id', id))
    } else {
      ;({ error } = await supabaseAdmin.from('blog_posts').insert(record))
    }

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('POST /api/admin/blog error:', err)
    return NextResponse.json({ error: err.message ?? 'Unknown error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userId = await getAuthUserId()
    if (userId !== ADMIN_USER_ID) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { id } = body
    const { error } = await supabaseAdmin.from('blog_posts').delete().eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('DELETE /api/admin/blog error:', err)
    return NextResponse.json({ error: err.message ?? 'Unknown error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const userId = await getAuthUserId()
    if (userId !== ADMIN_USER_ID) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { id, ...updates } = body
    const { error } = await supabaseAdmin
      .from('blog_posts')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('PATCH /api/admin/blog error:', err)
    return NextResponse.json({ error: err.message ?? 'Unknown error' }, { status: 500 })
  }
}