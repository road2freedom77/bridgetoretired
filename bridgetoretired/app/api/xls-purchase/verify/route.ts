import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase'
import { createHmac } from 'crypto'

const XLS_PRICE_ID = 'price_1TxoRzGkDMVwlubm2qzU5XkV'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-02-24.acacia',
  })
}

// Generate a signed, time-limited download URL
// Format: /api/xls-download?token=<hmac>&exp=<timestamp>
function generateDownloadToken(sessionId: string): { token: string; exp: number } {
  const secret = process.env.XLS_DOWNLOAD_SECRET!
  const exp = Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
  const payload = `${sessionId}:${exp}`
  const token = createHmac('sha256', secret).update(payload).digest('hex')
  return { token, exp }
}

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('session_id')

  if (!sessionId) {
    return NextResponse.json({ error: 'Missing session_id' }, { status: 400 })
  }

  try {
    const stripe = getStripe()

    // Retrieve and verify the Stripe session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items'],
    })

    // Must be paid
    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 402 })
    }

    // Must be for the XLS product specifically
    const lineItems = session.line_items?.data ?? []
    const isXlsPurchase = lineItems.some(
      item => item.price?.id === XLS_PRICE_ID
    )

    if (!isXlsPurchase) {
      return NextResponse.json({ error: 'Invalid product' }, { status: 403 })
    }

    const email = session.customer_details?.email ?? ''
    const customerId = session.customer as string | null
    const ref = session.client_reference_id ?? null

    // Record in Supabase (upsert — safe to call multiple times)
    await supabaseAdmin
      .from('xls_purchases')
      .upsert({
        stripe_session_id: sessionId,
        stripe_customer_id: customerId ?? null,
        email,
        product_version: 'v3',
        ref,
      }, { onConflict: 'stripe_session_id' })

    // Generate signed download token
    const { token, exp } = generateDownloadToken(sessionId)

    return NextResponse.json({
      success: true,
      email,
      downloadToken: token,
      downloadExp: exp,
    })
  } catch (err: any) {
    console.error('XLS verify error:', err)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}