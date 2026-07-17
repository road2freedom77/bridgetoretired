import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const ADMIN_USER_ID = 'user_3Ev0Q9ORn9oZwaXGROJq4bniaBI'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  // NO try/catch around auth() — let the real error surface in Vercel logs
  const { userId } = await auth()

  console.log('=== /api/admin/blog POST ===')
  console.log('userId from auth():', userId)
  console.log('expected ADMIN_USER_ID:', ADMIN_USER_ID)
  console.log('match:', userId === ADMIN_USER_ID)
  console.log('SERVICE_ROLE_KEY present:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)
  console.log('SUPABASE_URL present:', !!process.env.NEXT_PUBLIC_SUPABASE_URL)

  if (userId !== ADMIN_USER_ID) {
    return NextResponse.json({ error: 'Unauthorized', userId }, { status: 401 })
  }

  const body = await req.json()
  const { id, ...record } = body

  let error
  if (id) {
    ;({ error } = await supabaseAdmin.from('blog_posts').update(record).eq('id', id))
  } else {
    ;({ error } = await supabaseAdmin.from('blog_posts').insert(record))
  }

  if (error) {
    console.error('Supabase error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const { userId } = await auth()
  if (userId !== ADMIN_USER_ID) {
    return NextResponse.json({ error: 'Unauthorized', userId }, { status: 401 })
  }

  const body = await req.json()
  const { id } = body
  const { error } = await supabaseAdmin.from('blog_posts').delete().eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function PATCH(req: NextRequest) {
  const { userId } = await auth()
  if (userId !== ADMIN_USER_ID) {
    return NextResponse.json({ error: 'Unauthorized', userId }, { status: 401 })
  }

  const body = await req.json()
  const { id, ...updates } = body
  const { error } = await supabaseAdmin
    .from('blog_posts')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}