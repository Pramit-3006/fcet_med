import { redirect } from "next/navigation"
import { sql } from "@vercel/postgres"
import { cookies } from "next/headers"
import { AnalysisDashboard } from "@/components/analysis/analysis-dashboard"

async function getUser() {
  const cookieStore = cookies()
  const sessionToken = cookieStore.get("session")?.value

  if (!sessionToken) {
    return null
  }

  const result = await sql`
    SELECT u.id, u.email, u.full_name 
    FROM users u
    JOIN user_sessions s ON u.id = s.user_id
    WHERE s.session_token = ${sessionToken} AND s.expires_at > NOW()
  `

  return result.rows[0] || null
}

async function getAnalysisData(userId: string) {
  const reports = await sql`
    SELECT 
      mr.*,
      mi.original_image_url,
      mi.enhanced_image_url,
      mi.image_type,
      mi.body_part,
      mi.uploaded_at
    FROM medical_reports mr
    JOIN medical_images mi ON mr.image_id = mi.id
    WHERE mr.user_id = ${userId}
    ORDER BY mr.created_at DESC
    LIMIT 20
  `

  const stats = await sql`
    SELECT 
      COUNT(*) as total_analyses,
      COUNT(CASE WHEN mr.confidence_score >= 80 THEN 1 END) as high_confidence,
      COUNT(CASE WHEN mr.confidence_score BETWEEN 60 AND 79 THEN 1 END) as medium_confidence,
      COUNT(CASE WHEN mr.confidence_score < 60 THEN 1 END) as low_confidence,
      AVG(mr.confidence_score) as avg_confidence
    FROM medical_reports mr
    WHERE mr.user_id = ${userId}
  `

  return {
    reports: reports.rows,
    stats: stats.rows[0] || {
      total_analyses: 0,
      high_confidence: 0,
      medium_confidence: 0,
      low_confidence: 0,
      avg_confidence: 0,
    },
  }
}

export default async function AnalysisPage() {
  const user = await getUser()

  if (!user) {
    redirect("/login")
  }

  const analysisData = await getAnalysisData(user.id)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Medical Analysis Dashboard</h1>
          <p className="text-gray-600">Comprehensive analysis results and insights</p>
        </div>

        <AnalysisDashboard reports={analysisData.reports} stats={analysisData.stats} />
      </div>
    </div>
  )
}
