import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { query } from "@/lib/storage"
import { ReportsOverview } from "@/components/reports/reports-overview"

async function getReportsData(userId: number) {
  const reportsResult = await query(`SELECT * FROM medical_reports WHERE user_id = $1 ORDER BY created_at DESC`, [
    userId,
  ])

  // Simulate monthly stats for demo
  const monthlyStats = [
    { month: new Date().toISOString(), report_count: reportsResult.rows.length, avg_confidence: 85 },
    {
      month: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      report_count: Math.floor(reportsResult.rows.length / 2),
      avg_confidence: 82,
    },
  ]

  // Simulate body part stats for demo
  const bodyPartStats = [
    { body_part: "Chest", count: Math.floor(reportsResult.rows.length * 0.4), avg_confidence: 87 },
    { body_part: "Abdomen", count: Math.floor(reportsResult.rows.length * 0.3), avg_confidence: 83 },
    { body_part: "Head", count: Math.floor(reportsResult.rows.length * 0.3), avg_confidence: 89 },
  ]

  return {
    reports: reportsResult.rows,
    monthlyStats,
    bodyPartStats,
  }
}

export default async function ReportsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const reportsData = await getReportsData(user.id)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Medical Reports Dashboard</h1>
          <p className="text-gray-600">Generate, view, and manage comprehensive medical analysis reports</p>
        </div>

        <ReportsOverview
          reports={reportsData.reports}
          monthlyStats={reportsData.monthlyStats}
          bodyPartStats={reportsData.bodyPartStats}
        />
      </div>
    </div>
  )
}
