"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Calendar, Eye } from "lucide-react"
import { useTranslation, type Language } from "@/lib/i18n"

interface Report {
  id: number
  imageType: string
  diagnosis: string
  confidenceScore: number
  createdAt: string
}

interface RecentReportsProps {
  language: Language
  reports: Report[]
}

export function RecentReports({ language, reports }: RecentReportsProps) {
  const t = useTranslation(language)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === "en" ? "en-US" : language, {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return "bg-green-500/10 text-green-700 dark:text-green-400"
    if (score >= 0.6) return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
    return "bg-red-500/10 text-red-700 dark:text-red-400"
  }

  return (
    <Card className="medical-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {t.recentReports}
        </CardTitle>
        <CardDescription>Your latest medical image analysis results</CardDescription>
      </CardHeader>
      <CardContent>
        {reports.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No reports yet. Upload your first medical image to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{report.imageType}</Badge>
                    <Badge className={getConfidenceColor(report.confidenceScore)}>
                      {Math.round(report.confidenceScore * 100)}% confidence
                    </Badge>
                  </div>
                  <p className="font-medium">{report.diagnosis}</p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {formatDate(report.createdAt)}
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
