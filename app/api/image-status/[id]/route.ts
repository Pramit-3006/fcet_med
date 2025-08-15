import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const imageId = params.id

    const result = await sql`
      SELECT 
        status,
        enhancement_progress,
        enhancement_status,
        analysis_progress,
        analysis_data,
        enhanced_image_url
      FROM medical_images 
      WHERE id = ${imageId}
    `

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("Status check error:", error)
    return NextResponse.json({ error: "Status check failed" }, { status: 500 })
  }
}
