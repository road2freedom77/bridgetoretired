import { NextRequest, NextResponse } from "next/server";

const RESEND_API_KEY = process.env.RESEND_API_KEY!;
const RESEND_AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID!;

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    // 1. Look up the contact by email in the Resend audience
    const listRes = await fetch(
      `https://api.resend.com/audiences/${RESEND_AUDIENCE_ID}/contacts`,
      {
        headers: { Authorization: `Bearer ${RESEND_API_KEY}` },
      }
    );

    if (!listRes.ok) {
      console.error("Failed to fetch contacts from Resend");
      return NextResponse.json({ error: "Failed to process request." }, { status: 500 });
    }

    const listData = await listRes.json();
    const contact = listData.data?.find(
      (c: { email: string; id: string }) =>
        c.email.toLowerCase() === email.toLowerCase()
    );

    if (!contact) {
      // Return success anyway — don't reveal whether the email exists
      return NextResponse.json({ success: true });
    }

    // 2. Mark as unsubscribed
    const updateRes = await fetch(
      `https://api.resend.com/audiences/${RESEND_AUDIENCE_ID}/contacts/${contact.id}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ unsubscribed: true }),
      }
    );

    if (!updateRes.ok) {
      const err = await updateRes.json();
      console.error("Resend PATCH error:", err);
      return NextResponse.json({ error: "Failed to unsubscribe." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Unsubscribe error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}