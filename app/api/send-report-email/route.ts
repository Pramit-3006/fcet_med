import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { query } from "@/lib/storage"
import { sendReportEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { reportId, email } = await request.json()

    if (!reportId || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Fetch the report from storage
    const reportResult = await query(
      `SELECT mr.*, u.email as user_email, u.first_name, u.last_name, u.preferred_language
       FROM medical_reports mr
       JOIN users u ON mr.user_id = u.id
       WHERE mr.id = $1 AND mr.user_id = $2`,
      [reportId, user.id],
    )

    if (reportResult.rows.length === 0) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 })
    }

    const reportData = reportResult.rows[0]

    // Prepare report data for email
    const report = {
      id: reportData.id,
      patientName: `${reportData.first_name} ${reportData.last_name}`,
      imageType: reportData.image_type,
      bodyPart: reportData.body_part,
      diagnosis: reportData.analysis_results?.diagnosis || "Analysis pending",
      confidenceScore: reportData.confidence_score || 0,
      riskLevel: reportData.analysis_results?.riskLevel || "unknown",
      findings: reportData.analysis_results?.findings || [],
      recommendations: reportData.analysis_results?.recommendations || [],
      createdAt: reportData.created_at,
    }

    // Send email
    const emailSent = await sendReportEmail(email, report, reportData.preferred_language || "en")

    if (emailSent) {
      // Log email sent in storage
      await query(
        `INSERT INTO email_logs (user_id, report_id, recipient_email, sent_at, status)
         VALUES ($1, $2, $3, NOW(), 'sent')`,
        [user.id, reportId, email],
      )

      return NextResponse.json({ success: true, message: "Report sent successfully" })
    } else {
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
    }
  } catch (error) {
    console.error("Send report email error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
