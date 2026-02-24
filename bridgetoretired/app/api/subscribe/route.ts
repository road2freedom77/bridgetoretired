import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    // 1. Send welcome + download email to subscriber
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? 'hello@bridgetoretired.com',
      to: email,
      subject: 'Your Early Retirement Bridge Planner is here 🎯',
      html: `
        <div style="font-family: 'Georgia', serif; max-width: 560px; margin: 0 auto; background: #0a0c0f; color: #e8e0d0; padding: 40px 32px; border-radius: 8px;">
          <h1 style="font-size: 26px; font-weight: 700; color: #ffffff; margin-bottom: 8px; letter-spacing: -0.5px;">
            Your Bridge Planner is ready.
          </h1>
          <p style="color: rgba(255,255,255,0.55); font-size: 14px; margin-bottom: 28px; line-height: 1.7;">
            Thanks for joining BridgeToRetired. Here's everything you need to start modeling your early retirement bridge strategy.
          </p>

          <div style="background: #141c28; border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 24px; margin-bottom: 28px;">
            <p style="font-family: monospace; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #e8b84b; margin-bottom: 8px;">
              Free Download
            </p>
            <p style="font-size: 16px; font-weight: 600; color: #ffffff; margin-bottom: 4px;">
              Early Retirement Bridge Planner v2.xlsx
            </p>
            <p style="font-size: 12px; color: rgba(255,255,255,0.4); margin-bottom: 16px;">
              7 sheets · Taxable → 401k → Roth modeling · Inflation-adjusted · Risk flags
            </p>
            <a href="https://www.bridgetoretired.com/downloads/Bridge_Planner_v2_1.xlsx"
               style="display: inline-block; background: #e8b84b; color: #0a0c0f; font-weight: 700; font-size: 13px; padding: 12px 24px; border-radius: 4px; text-decoration: none;">
              Download Planner →
            </a>
          </div>

          <p style="font-size: 13px; color: rgba(255,255,255,0.45); line-height: 1.75; margin-bottom: 20px;">
            Next steps:<br/>
            1. Open the <strong style="color: rgba(255,255,255,0.7);">INPUTS</strong> tab and enter your numbers<br/>
            2. Check <strong style="color: rgba(255,255,255,0.7);">BRIDGE CLEAN</strong> for your year-by-year plan<br/>
            3. Review <strong style="color: rgba(255,255,255,0.7);">RISK FLAGS</strong> for automatic warnings<br/>
            4. Read: <a href="https://bridgetoretired.com/blog/what-is-retirement-bridge-strategy" style="color: #e8b84b;">What Is a Retirement Bridge Strategy?</a>
          </p>

          <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.06); margin: 24px 0;" />
          <p style="font-size: 11px; color: rgba(255,255,255,0.25); line-height: 1.6;">
            BridgeToRetired · <a href="https://bridgetoretired.com/unsubscribe" style="color: rgba(255,255,255,0.25);">Unsubscribe</a><br/>
            Not financial advice. Always consult a qualified financial advisor.
          </p>
        </div>
      `,
    })

    // 2. Notify yourself of new subscriber
    if (process.env.NOTIFY_EMAIL) {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? 'hello@bridgetoretired.com',
        to: process.env.NOTIFY_EMAIL,
        subject: `New subscriber: ${email}`,
        html: `<p>New subscriber on BridgeToRetired: <strong>${email}</strong></p>
               <p>Time: ${new Date().toISOString()}</p>`,
      })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Subscribe error:', err)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
