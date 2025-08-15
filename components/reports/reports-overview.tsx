"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { FileText, Download, Mail, Search, TrendingUp, Activity, Users } from "lucide-react"
import { DetailedReport } from "./detailed-report"

interface ReportsOverviewProps {
  reports: any[]
  monthlyStats: any[]
  bodyPartStats: any[]
}

export function ReportsOverview({ reports, monthlyStats, bodyPartStats }: ReportsOverviewProps) {
  const [selectedReport, setSelectedReport] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterConfidence, setFilterConfidence] = useState("all")

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.image_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.body_part?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = filterType === "all" || report.image_type === filterType

    const matchesConfidence =
      filterConfidence === "all" ||
      (filterConfidence === "high" && report.confidence_score >= 80) ||
      (filterConfidence === "medium" && report.confidence_score >= 60 && report.confidence_score < 80) ||
      (filterConfidence === "low" && report.confidence_score < 60)

    return matchesSearch && matchesType && matchesConfidence
  })

  const totalReports = reports.length
  const avgConfidence = reports.reduce((sum, r) => sum + r.confidence_score, 0) / reports.length || 0
  const highConfidenceReports = reports.filter((r) => r.confidence_score >= 80).length

  const confidenceColors = ["#10b981", "#f59e0b", "#ef4444"]
  const confidenceData = [
    { name: "High (80-100%)", value: reports.filter((r) => r.confidence_score >= 80).length },
    {
      name: "Medium (60-79%)",
      value: reports.filter((r) => r.confidence_score >= 60 && r.confidence_score < 80).length,
    },
    { name: "Low (0-59%)", value: reports.filter((r) => r.confidence_score < 60).length },
  ]

  const monthlyChartData = monthlyStats.map((stat) => ({
    month: new Date(stat.month).toLocaleDateString("en-US", { month: "short", year: "numeric" }),
    reports: Number.parseInt(stat.report_count),
    confidence: Math.round(Number.parseFloat(stat.avg_confidence) || 0),
  }))

  const handleEmailReport = async (reportId: string) => {
    try {
      const response = await fetch("/api/email-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId }),
      })

      if (response.ok) {
        alert("Report sent to your email successfully!")
      } else {
        alert("Failed to send report. Please try again.")
      }
    } catch (error) {
      console.error("Email error:", error)
      alert("Failed to send report. Please try again.")
    }
  }

  const handleDownloadReport = async (reportId: string) => {
    try {
      const response = await fetch(`/api/download-report/${reportId}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `medical-report-${reportId}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error("Download error:", error)
      alert("Failed to download report. Please try again.")
    }
  }

  if (selectedReport) {
    return (
      <DetailedReport
        report={selectedReport}
        onBack={() => setSelectedReport(null)}
        onEmail={() => handleEmailReport(selectedReport.id)}
        onDownload={() => handleDownloadReport(selectedReport.id)}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReports}</div>
            <p className="text-xs text-muted-foreground">Generated reports</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(avgConfidence)}%</div>
            <p className="text-xs text-muted-foreground">Analysis accuracy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Confidence</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{highConfidenceReports}</div>
            <p className="text-xs text-muted-foreground">80%+ confidence</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Body Parts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bodyPartStats.length}</div>
            <p className="text-xs text-muted-foreground">Analyzed areas</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="reports" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="reports">Reports List</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search reports..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="X-ray">X-ray</SelectItem>
                    <SelectItem value="CT">CT Scan</SelectItem>
                    <SelectItem value="MRI">MRI</SelectItem>
                    <SelectItem value="Ultrasound">Ultrasound</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterConfidence} onValueChange={setFilterConfidence}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by confidence" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Confidence</SelectItem>
                    <SelectItem value="high">High (80-100%)</SelectItem>
                    <SelectItem value="medium">Medium (60-79%)</SelectItem>
                    <SelectItem value="low">Low (0-59%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Reports Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReports.map((report) => {
              const findings = JSON.parse(report.findings || "[]")
              const severity = findings[0]?.severity || "Normal"

              return (
                <Card key={report.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{report.image_type}</h3>
                          <p className="text-sm text-muted-foreground">{report.body_part}</p>
                        </div>
                        <Badge
                          variant={
                            severity === "Normal" ? "secondary" : severity === "Mild" ? "default" : "destructive"
                          }
                        >
                          {severity}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <img
                          src={report.original_image_url || "/placeholder.svg"}
                          alt="Original"
                          className="w-full h-20 object-cover rounded"
                        />
                        <img
                          src={report.enhanced_image_url || "/placeholder.svg"}
                          alt="Enhanced"
                          className="w-full h-20 object-cover rounded"
                        />
                      </div>

                      <div className="flex justify-between items-center text-sm">
                        <span>Confidence: {report.confidence_score}%</span>
                        <span>{new Date(report.created_at).toLocaleDateString()}</span>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 bg-transparent"
                          onClick={() => setSelectedReport(report)}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleEmailReport(report.id)}>
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDownloadReport(report.id)}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
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
                        <Cell key={`cell-${index}`} fill={confidenceColors[index]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Analysis by Body Part</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={bodyPartStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="body_part" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Report Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="reports" fill="#3b82f6" />
                  <Line yAxisId="right" type="monotone" dataKey="confidence" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
