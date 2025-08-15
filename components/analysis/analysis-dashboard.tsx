"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Activity, FileText, TrendingUp, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import { useLanguage } from "@/lib/i18n"

interface AnalysisDashboardProps {
  reports: any[]
  stats: {
    total_analyses: number
    high_confidence: number
    medium_confidence: number
    low_confidence: number
    avg_confidence: number
  }
}

export function AnalysisDashboard({ reports, stats }: AnalysisDashboardProps) {
  const { t } = useLanguage()
  const [selectedReport, setSelectedReport] = useState<any>(null)

  const confidenceData = [
    { name: "High (80-100%)", value: Number.parseInt(stats.high_confidence), color: "#10b981" },
    { name: "Medium (60-79%)", value: Number.parseInt(stats.medium_confidence), color: "#f59e0b" },
    { name: "Low (0-59%)", value: Number.parseInt(stats.low_confidence), color: "#ef4444" },
  ]

  const analysisTypeData = reports.reduce((acc: any[], report) => {
    const type = report.image_type || "Unknown"
    const existing = acc.find((item) => item.name === type)
    if (existing) {
      existing.value += 1
    } else {
      acc.push({ name: type, value: 1 })
    }
    return acc
  }, [])

  const getSeverityColor = (findings: any[]) => {
    if (!findings || findings.length === 0) return "bg-gray-100 text-gray-800"

    const severities = findings.map((f) => f.severity)
    if (severities.includes("Severe")) return "bg-red-100 text-red-800"
    if (severities.includes("Moderate")) return "bg-orange-100 text-orange-800"
    if (severities.includes("Mild")) return "bg-yellow-100 text-yellow-800"
    return "bg-green-100 text-green-800"
  }

  return (
    <div className="space-y-6">
      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Analyses</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_analyses}</div>
            <p className="text-xs text-muted-foreground">Medical images analyzed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(Number.parseFloat(stats.avg_confidence) || 0)}%</div>
            <Progress value={Number.parseFloat(stats.avg_confidence) || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Confidence</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.high_confidence}</div>
            <p className="text-xs text-muted-foreground">80%+ confidence</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Needs Review</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.low_confidence}</div>
            <p className="text-xs text-muted-foreground">Below 60% confidence</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="reports" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="reports">Analysis Reports</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Reports List */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Recent Analysis Reports</h3>
              {reports.map((report) => {
                const findings = JSON.parse(report.findings || "[]")
                return (
                  <Card
                    key={report.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedReport(report)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">
                            {report.image_type} - {report.body_part}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(report.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge className={getSeverityColor(findings)}>{findings[0]?.severity || "Normal"}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Confidence: {report.confidence_score}%</span>
                        <Progress value={report.confidence_score} className="w-20" />
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Selected Report Details */}
            <div>
              {selectedReport ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Analysis Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <img
                        src={selectedReport.original_image_url || "/placeholder.svg"}
                        alt="Original"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <img
                        src={selectedReport.enhanced_image_url || "/placeholder.svg"}
                        alt="Enhanced"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium">Key Findings</h4>
                      {JSON.parse(selectedReport.findings || "[]").map((finding: any, index: number) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <p className="font-medium text-sm">{finding.description}</p>
                            <Badge variant="outline">{finding.severity}</Badge>
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Confidence: {finding.confidence}%</span>
                            <span>Location: {finding.location}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Recommendations</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {JSON.parse(selectedReport.recommendations || "[]").map((rec: string, index: number) => (
                          <li key={index}>{rec}</li>
                        ))}
                      </ul>
                    </div>

                    <Button className="w-full">
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Full Report
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Select a report to view details</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Confidence Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={confidenceData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {confidenceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Analysis by Image Type</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analysisTypeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Analysis Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reports.slice(0, 10).map((report, index) => (
                  <div key={report.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium">{report.image_type} analysis completed</p>
                      <p className="text-sm text-muted-foreground">{new Date(report.created_at).toLocaleString()}</p>
                    </div>
                    <Badge variant="outline">{report.confidence_score}%</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
