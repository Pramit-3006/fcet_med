import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/storage"
import { getCurrentUser } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { imageType, bodyPart, originalImageUrl } = await request.json()

    // Get current user
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await query(
      `INSERT INTO medical_reports (user_id, original_image_url, image_type, body_part, status, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [user.id, originalImageUrl, imageType, bodyPart, "uploaded", new Date().toISOString()],
    )

    return NextResponse.json({ reportId: result.rows[0].id })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to create report" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await query(`SELECT * FROM medical_reports WHERE user_id = $1 ORDER BY created_at DESC`, [user.id])

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 })
  }
}
