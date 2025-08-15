"use client"

import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import { FileText, Download, Search, Calendar, TrendingUp, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import { useTranslation, type Language } from "@/lib/i18n"
import type { User } from "@/lib/auth"

interface Report {
  id: string
  imageType: string
  bodyPart: string
  diagnosis: string
  confidenceScore: number
  riskLevel: "low" | "medium" | "high"
  status: "completed" | "processing" | "pending"
  createdAt: string
  findings: string[]
  recommendations: string[]
}

interface ReportsClientProps {
  user: User
}

export function ReportsClient({ user }: ReportsClientProps) {
  const [language, setLanguage] = useState<Language>((user.preferredLanguage as Language) || "en")
  const [reports, setReports] = useState<Report[]>([])
  const [filteredReports, setFilteredReports] = useState<Report[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterRisk, setFilterRisk] = useState("all")
  const t = useTranslation(language)

  // Mock reports data
  useEffect(() => {
    const mockReports: Report[] = [
      {
        id: "1",
        imageType: "Chest X-Ray",
        bodyPart: "Chest",
        diagnosis: "Normal chest radiograph",
        confidenceScore: 0.92,
        riskLevel: "low",
        status: "completed",
        createdAt: "2024-01-15T10:30:00Z",
        findings: ["Clear lung fields", "Normal heart size", "No acute abnormalities"],
        recommendations: ["Continue routine screening", "Maintain healthy lifestyle"],
      },
      {
        id: "2",
        imageType: "CT Scan",
        bodyPart: "Chest",
        diagnosis: "Possible pneumonia in lower left lobe",
        confidenceScore: 0.78,
        riskLevel: "medium",
        status: "completed",
        createdAt: "2024-01-14T14:20:00Z",
        findings: ["Ground glass opacity in LLL", "Mild pleural thickening", "No cavitation"],
        recommendations: ["Follow-up CT in 4-6 weeks", "Consider antibiotic therapy", "Clinical correlation advised"],
      },
      {
        id: "3",
        imageType: "MRI",
        bodyPart: "Brain",
        diagnosis: "Small vessel disease",
        confidenceScore: 0.85,
        riskLevel: "low",
        status: "completed",
        createdAt: "2024-01-13T09:15:00Z",
        findings: ["Scattered T2 hyperintensities", "Age-related changes", "No mass effect"],
        recommendations: ["Routine follow-up", "Monitor blood pressure", "Lifestyle modifications"],
      },
    ]
    setReports(mockReports)
    setFilteredReports(mockReports)
  }, [])

  // Filter reports based on search and filters
  useEffect(() => {
    const filtered = reports.filter((report) => {
      const matchesSearch =
        report.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.imageType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.bodyPart.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesType = filterType === "all" || report.imageType.toLowerCase().includes(filterType.toLowerCase())
      const matchesRisk = filterRisk === "all" || report.riskLevel === filterRisk

      return matchesSearch && matchesType && matchesRisk
    })
    setFilteredReports(filtered)
  }, [reports, searchTerm, filterType, filterRisk])

  // Chart data
  const riskDistribution = [
    { name: "Low Risk", value: reports.filter((r) => r.riskLevel === "low").length, color: "#10b981" },
    { name: "Medium Risk", value: reports.filter((r) => r.riskLevel === "medium").length, color: "#f59e0b" },
    { name: "High Risk", value: reports.filter((r) => r.riskLevel === "high").length, color: "#ef4444" },
  ]

  const monthlyReports = [
    { month: "Oct", count: 8 },
    { month: "Nov", count: 12 },
    { month: "Dec", count: 15 },
    { month: "Jan", count: 18 },
  ]

  const confidenceData = [
    { range: "90-100%", count: reports.filter((r) => r.confidenceScore >= 0.9).length },
    { range: "80-89%", count: reports.filter((r) => r.confidenceScore >= 0.8 && r.confidenceScore < 0.9).length },
    { range: "70-79%", count: reports.filter((r) => r.confidenceScore >= 0.7 && r.confidenceScore < 0.8).length },
    { range: "60-69%", count: reports.filter((r) => r.confidenceScore >= 0.6 && r.confidenceScore < 0.7).length },
  ]

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "processing":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "pending":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} language={language} onLanguageChange={setLanguage} />

      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="medical-fade-in">
          <h2 className="text-3xl font-bold mb-2">Medical Reports Dashboard</h2>
          <p className="text-muted-foreground">View, analyze, and export your medical image analysis reports</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="reports">All Reports</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="medical-fade-in">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{reports.length}</div>
                  <p className="text-xs text-muted-foreground">+2 from last week</p>
                </CardContent>
              </Card>

              <Card className="medical-fade-in" style={{ animationDelay: "0.1s" }}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.round((reports.reduce((acc, r) => acc + r.confidenceScore, 0) / reports.length) * 100)}%
                  </div>
                  <p className="text-xs text-muted-foreground">+3% from last week</p>
                </CardContent>
              </Card>

              <Card className="medical-fade-in" style={{ animationDelay: "0.2s" }}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">High Risk Cases</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{reports.filter((r) => r.riskLevel === "high").length}</div>
                  <p className="text-xs text-muted-foreground">Requires attention</p>
                </CardContent>
              </Card>

              <Card className="medical-fade-in" style={{ animationDelay: "0.3s" }}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">This Month</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">18</div>
                  <p className="text-xs text-muted-foreground">+25% from last month</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="medical-slide-up">
                <CardHeader>
                  <CardTitle>Risk Distribution</CardTitle>
                  <CardDescription>Distribution of risk levels across all reports</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={riskDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {riskDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="medical-slide-up" style={{ animationDelay: "0.1s" }}>
                <CardHeader>
                  <CardTitle>Monthly Trends</CardTitle>
                  <CardDescription>Number of reports generated per month</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyReports}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            {/* Filters */}
            <Card className="medical-fade-in">
              <CardHeader>
                <CardTitle>Filter Reports</CardTitle>
              </CardHeader>
              <CardContent>
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
                      <SelectValue placeholder="Image Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="x-ray">X-Ray</SelectItem>
                      <SelectItem value="ct">CT Scan</SelectItem>
                      <SelectItem value="mri">MRI</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterRisk} onValueChange={setFilterRisk}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Risk Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Risk Levels</SelectItem>
                      <SelectItem value="low">Low Risk</SelectItem>
                      <SelectItem value="medium">Medium Risk</SelectItem>
                      <SelectItem value="high">High Risk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Reports List */}
            <div className="space-y-4">
              {filteredReports.map((report, index) => (
                <Card key={report.id} className="medical-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(report.status)}
                          <h3 className="font-semibold text-lg">{report.diagnosis}</h3>
                          <Badge className={getRiskBadgeColor(report.riskLevel)}>
                            {report.riskLevel.toUpperCase()} RISK
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{report.imageType}</span>
                          <span>•</span>
                          <span>{report.bodyPart}</span>
                          <span>•</span>
                          <span>Confidence: {Math.round(report.confidenceScore * 100)}%</span>
                          <span>•</span>
                          <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <h4 className="font-medium text-sm">Key Findings:</h4>
                            <ul className="text-sm text-muted-foreground list-disc list-inside">
                              {report.findings.slice(0, 2).map((finding, i) => (
                                <li key={i}>{finding}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <FileText className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card className="medical-fade-in">
              <CardHeader>
                <CardTitle>Confidence Score Distribution</CardTitle>
                <CardDescription>Distribution of AI confidence scores across all reports</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={confidenceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
