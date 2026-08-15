// app/api/admin/blog/upload-image/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

const ADMIN_USER_ID = 'user_3Ev0Q9ORn9oZwaXGROJq4bniaBI'
const BUCKET = 'blog-images'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (userId !== ADMIN_USER_ID) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const alt = (formData.get('alt') as string) ?? ''

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Use JPEG, PNG, WebP, GIF, or SVG.' }, { status: 400 })
    }

    // 5MB limit
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Max 5MB.' }, { status: 400 })
    }

    // Sanitize filename: lowercase, hyphens, timestamp prefix for uniqueness
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
    const baseName = file.name
      .replace(/\.[^/.]+$/, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
    const timestamp = Date.now()
    const storagePath = `${baseName}-${timestamp}.${ext}`

    const buffer = Buffer.from(await file.arrayBuffer())

    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(storagePath, buffer, {
        contentType: file.type,
        cacheControl: '31536000',  // 1 year cache
        upsert: false,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const { data: urlData } = supabaseAdmin.storage
      .from(BUCKET)
      .getPublicUrl(storagePath)

    return NextResponse.json({
      url: urlData.publicUrl,
      path: storagePath,
      alt,
      token: `[[image:${urlData.publicUrl}|${alt}]]`,
    })
  } catch (err: any) {
    console.error('Image upload failed:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}