import { NextRequest, NextResponse } from 'next/server'
import { clerkClient } from '@clerk/nextjs/server'
import Stripe from 'stripe'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-02-24.acacia',
  })
}

export async function POST(req: NextRequest) {
  const stripe        = getStripe()
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!
  const body          = await req.text()
  const sig           = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const clerk = await clerkClient()

  switch (event.type) {

    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      const customerId   = subscription.customer as string
      const isActive     = subscription.status === 'active' || subscription.status === 'trialing'

      const users = await clerk.users.getUserList({
        externalId: [customerId],
      })

      let clerkUserId: string | null = null

      if (users.data.length > 0) {
        clerkUserId = users.data[0].id
      } else {
        const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer
        if (customer.email) {
          const byEmail = await clerk.users.getUserList({ emailAddress: [customer.email] })
          if (byEmail.data.length > 0) clerkUserId = byEmail.data[0].id
        }
      }

      if (clerkUserId) {
        await clerk.users.updateUserMetadata(clerkUserId, {
          publicMetadata: {
            isPro:              isActive,
            stripeCustomerId:   customerId,
            subscriptionStatus: subscription.status,
            subscriptionId:     subscription.id,
          }
        })
        console.log(`User ${clerkUserId} Pro status set to ${isActive}`)
      }
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      const customerId   = subscription.customer as string

      const users = await clerk.users.getUserList({ externalId: [customerId] })
      let clerkUserId: string | null = null

      if (users.data.length > 0) {
        clerkUserId = users.data[0].id
      } else {
        const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer
        if (customer.email) {
          const byEmail = await clerk.users.getUserList({ emailAddress: [customer.email] })
          if (byEmail.data.length > 0) clerkUserId = byEmail.data[0].id
        }
      }

      if (clerkUserId) {
        await clerk.users.updateUserMetadata(clerkUserId, {
          publicMetadata: {
            isPro:              false,
            subscriptionStatus: 'canceled',
          }
        })
        console.log(`User ${clerkUserId} Pro access revoked`)
      }
      break
    }

    case 'checkout.session.completed': {
      const session    = event.data.object as Stripe.Checkout.Session
      const customerId = session.customer as string
      const clerkId    = session.metadata?.clerkUserId

      if (clerkId) {
        await clerk.users.updateUserMetadata(clerkId, {
          publicMetadata: {
            isPro:            true,
            stripeCustomerId: customerId,
          }
        })
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
