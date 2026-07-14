import { NextResponse } from "next/server"
import { Resend } from "resend"

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function POST(req) {
  try {
    if (!resend) {
      return NextResponse.json(
        { error: "Email service is not configured. Set RESEND_API_KEY to send emails." },
        { status: 503 }
      )
    }
    const { to, subject, text } = await req.json()

    if (!to || !subject || !text) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { data, error } = await resend.emails.send({
      from: "Maka Travels Admin <noreply@makatravels.com>", // Make sure you verify your domain on Resend
      to,
      subject,
      text,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error sending email:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
