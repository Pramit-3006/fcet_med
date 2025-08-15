import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/storage"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const reportId = params.id

    const result = await query(`SELECT * FROM medical_reports WHERE id = $1`, [Number.parseInt(reportId)])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to fetch report" }, { status: 500 })
  }
}
