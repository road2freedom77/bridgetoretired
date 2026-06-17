import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json()

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 })
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 })
    }

    await resend.emails.send({
      from: 'BridgeToRetired <noreply@bridgetoretired.com>',
      to: 'bridgetoretired@gmail.com',
      reply_to: email,
      subject: `[Contact] ${subject}`,
      html: `
        <div style="font-family: monospace; max-width: 600px; margin: 0 auto; padding: 32px; background: #0D1420; color: #ffffff; border-radius: 8px;">
          <div style="font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #E8B84B; margin-bottom: 8px;">New Contact Message</div>
          <h2 style="font-size: 20px; color: #ffffff; margin: 0 0 24px; font-family: Georgia, serif;">${subject}</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <tr>
              <td style="font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: rgba(255,255,255,0.35); padding: 8px 0 4px; border-bottom: 1px solid rgba(255,255,255,0.06);">From</td>
              <td style="font-size: 13px; color: rgba(255,255,255,0.8); padding: 8px 0 4px; border-bottom: 1px solid rgba(255,255,255,0.06);">${name}</td>
            </tr>
            <tr>
              <td style="font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: rgba(255,255,255,0.35); padding: 8px 0 4px; border-bottom: 1px solid rgba(255,255,255,0.06);">Email</td>
              <td style="font-size: 13px; color: rgba(255,255,255,0.8); padding: 8px 0 4px; border-bottom: 1px solid rgba(255,255,255,0.06);">${email}</td>
            </tr>
            <tr>
              <td style="font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: rgba(255,255,255,0.35); padding: 8px 0 4px;">Subject</td>
              <td style="font-size: 13px; color: rgba(255,255,255,0.8); padding: 8px 0 4px;">${subject}</td>
            </tr>
          </table>
          <div style="font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: rgba(255,255,255,0.35); margin-bottom: 8px;">Message</div>
          <div style="font-size: 14px; color: rgba(255,255,255,0.7); line-height: 1.7; background: rgba(255,255,255,0.04); border-radius: 6px; padding: 16px; white-space: pre-wrap;">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
          <div style="margin-top: 24px; font-size: 10px; color: rgba(255,255,255,0.2);">Sent from bridgetoretired.com/contact · Reply-To is set to sender's email</div>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Contact form error:', err)
    return NextResponse.json({ error: 'Failed to send message. Please try again.' }, { status: 500 })
  }
}