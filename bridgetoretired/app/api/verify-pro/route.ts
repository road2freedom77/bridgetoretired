import { NextRequest, NextResponse } from 'next/server'
import { clerkClient } from '@clerk/nextjs/server'

function getStripe() {
  const Stripe = require('stripe')
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-02-24.acacia',
  })
}

export async function POST(req: NextRequest) {
  try {
    const { userId, email } = await req.json()
    if (!userId || !email) {
      return NextResponse.json({ error: 'Missing userId or email' }, { status: 400 })
    }

    const stripe = getStripe()

    // Search Stripe for customers with this email
    const customers = await stripe.customers.list({ email, limit: 5 })

    let isPro = false
    let stripeCustomerId = null

    for (const customer of customers.data) {
      const subscriptions = await stripe.subscriptions.list({
        customer: customer.id,
        status: 'active',
        limit: 1,
      })
      if (subscriptions.data.length > 0) {
        isPro = true
        stripeCustomerId = customer.id
        break
      }
      // Also check trialing
      const trialing = await stripe.subscriptions.list({
        customer: customer.id,
        status: 'trialing',
        limit: 1,
      })
      if (trialing.data.length > 0) {
        isPro = true
        stripeCustomerId = customer.id
        break
      }
    }

    if (isPro && stripeCustomerId) {
      const clerk = await clerkClient()
      await clerk.users.updateUserMetadata(userId, {
        publicMetadata: {
          isPro: true,
          stripeCustomerId,
        }
      })
      console.log(`User ${userId} granted Pro via email match: ${email}`)
    }

    return NextResponse.json({ isPro, stripeCustomerId })
  } catch (err: any) {
    console.error('verify-pro error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
