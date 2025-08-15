"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Download, Mail, FileText, Calendar, User, Activity } from "lucide-react"

interface DetailedReportProps {
  report: any
  onBack: () => void
  onEmail: () => void
  onDownload: () => void
}

export function DetailedReport({ report, onBack, onEmail, onDownload }: DetailedReportProps) {
  const findings = JSON.parse(report.findings || "[]")
  const recommendations = JSON.parse(report.recommendations || "[]")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Reports
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onEmail}>
            <Mail className="h-4 w-4 mr-2" />
            Email Report
          </Button>
          <Button onClick={onDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Report Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">Medical Analysis Report</CardTitle>
              <p className="text-muted-foreground mt-2">
                {report.image_type} - {report.body_part}
              </p>
            </div>
            <Badge
              variant={findings[0]?.severity === "Normal" ? "secondary" : "destructive"}
              className="text-lg px-4 py-2"
            >
              {findings[0]?.severity || "Normal"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Report Date</p>
                <p className="font-medium">{new Date(report.created_at).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Analyzed by</p>
                <p className="font-medium">{report.doctor_name || "AI System"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Confidence Score</p>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{report.confidence_score}%</p>
                  <Progress value={report.confidence_score} className="w-16" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Images Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Image Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Original Image</h4>
              <img
                src={report.original_image_url || "/placeholder.svg"}
                alt="Original medical image"
                className="w-full h-64 object-cover rounded-lg border"
              />
            </div>
            <div>
              <h4 className="font-medium mb-3">Enhanced Image</h4>
              <img
                src={report.enhanced_image_url || "/placeholder.svg"}
                alt="Enhanced medical image"
                className="w-full h-64 object-cover rounded-lg border"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Findings */}
      <Card>
        <CardHeader>
          <CardTitle>Clinical Findings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {findings.map((finding: any, index: number) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-medium">{finding.description}</h4>
                  <Badge variant={finding.severity === "Normal" ? "secondary" : "destructive"}>
                    {finding.severity}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Confidence</p>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{finding.confidence}%</p>
                      <Progress value={finding.confidence} className="w-16" />
                    </div>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Location</p>
                    <p className="font-medium">{finding.location}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Severity Level</p>
                    <p className="font-medium">{finding.severity}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Clinical Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recommendations.map((recommendation: string, index: number) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <p>{recommendation}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-orange-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-orange-900 mb-2">Medical Disclaimer</h4>
              <p className="text-sm text-orange-800">
                This AI-generated analysis is for educational and informational purposes only. It should not be used as
                a substitute for professional medical diagnosis, treatment, or advice. Always consult with qualified
                healthcare professionals for medical decisions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
