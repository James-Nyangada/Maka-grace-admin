import { NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(req) {
  try {
    // In a real application, you would fetch real data from your DB here
    // e.g. const newBookings = await BookingModel.find({ createdAt: { $gte: lastMonday } })

    const weeklySummaryHtml = `
      <h2>Weekly Booking Summary</h2>
      <p>Hello Marykala,</p>
      <p>Here is the weekly summary of bookings for Maka Travels:</p>
      <ul>
        <li><strong>New Bookings:</strong> 15</li>
        <li><strong>Total Revenue:</strong> $12,500</li>
        <li><strong>Most Popular Package:</strong> Bali Adventure</li>
      </ul>
      <p>Please log in to the dashboard to view full details.</p>
    `

    const { data, error } = await resend.emails.send({
      from: "Maka Travels System <noreply@makatravels.com>",
      to: "marykala@example.com", // Replace with the actual email
      subject: "Weekly Booking Summary",
      html: weeklySummaryHtml,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: "Weekly summary sent." })
  } catch (error) {
    console.error("Error sending weekly summary:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
