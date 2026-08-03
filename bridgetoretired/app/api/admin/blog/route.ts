import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

const ADMIN_USER_ID = 'user_3Ev0Q9ORn9oZwaXGROJq4bniaBI'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function revalidateBlog(slug?: string) {
  revalidatePath('/')
  revalidatePath('/blog')
  if (slug) revalidatePath(`/blog/${slug}`)
}

export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (userId !== ADMIN_USER_ID) {
    return NextResponse.json({ error: 'Unauthorized', userId }, { status: 401 })
  }

  const { data, error } = await supabaseAdmin
    .from('blog_posts')
    .select('id, slug, title, category, published, published_at, featured, read_time, description, updated_at, content')
    .order('published_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ posts: data })
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
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

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidateBlog(record.slug)
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const { userId } = await auth()
  if (userId !== ADMIN_USER_ID) {
    return NextResponse.json({ error: 'Unauthorized', userId }, { status: 401 })
  }

  const body = await req.json()
  const { id, slug } = body
  const { error } = await supabaseAdmin.from('blog_posts').delete().eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidateBlog(slug)
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

  revalidateBlog(updates.slug)
  return NextResponse.json({ ok: true })
}