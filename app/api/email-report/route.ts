import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function POST(request: NextRequest) {
  try {
    const { reportId } = await request.json()

    if (!reportId) {
      return NextResponse.json({ error: "Report ID is required" }, { status: 400 })
    }

    // Get report details
    const reportResult = await sql`
      SELECT 
        mr.*,
        mi.image_type,
        mi.body_part,
        u.email,
        u.full_name
      FROM medical_reports mr
      JOIN medical_images mi ON mr.image_id = mi.id
      JOIN users u ON mr.user_id = u.id
      WHERE mr.id = ${reportId}
    `

    if (reportResult.rows.length === 0) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 })
    }

    const report = reportResult.rows[0]

    // In a real application, you would integrate with an email service like SendGrid, Resend, etc.
    // For now, we'll simulate the email sending process
    console.log(`Sending email report to: ${report.email}`)
    console.log(`Report: ${report.image_type} - ${report.body_part}`)
    console.log(`Confidence: ${report.confidence_score}%`)

    // Update usage tracking
    await sql`
      INSERT INTO user_usage (user_id, action_type, details, created_at)
      VALUES (${report.user_id}, 'email_report', ${JSON.stringify({ reportId, email: report.email })}, NOW())
    `

    return NextResponse.json({
      success: true,
      message: "Report sent successfully to your email",
    })
  } catch (error) {
    console.error("Email report error:", error)
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
}
