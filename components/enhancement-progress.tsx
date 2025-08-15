"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useI18n } from "@/lib/i18n"
import { Loader2, CheckCircle, AlertCircle, Download, Mail } from "lucide-react"

interface EnhancementProgressProps {
  reportId: string
  onComplete?: (report: any) => void
}

export function EnhancementProgress({ reportId, onComplete }: EnhancementProgressProps) {
  const { t } = useI18n()
  const [report, setReport] = useState<any>(null)
  const [progress, setProgress] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const pollReport = async () => {
      try {
        const response = await fetch(`/api/reports/${reportId}`)
        const reportData = await response.json()
        setReport(reportData)

        // Update progress based on status
        switch (reportData.status) {
          case "uploaded":
            setProgress(20)
            break
          case "enhancing":
            setProgress(50)
            break
          case "enhanced":
            setProgress(75)
            break
          case "completed":
            setProgress(100)
            setIsLoading(false)
            onComplete?.(reportData)
            return
        }

        // Continue polling if not completed
        if (reportData.status !== "completed") {
          setTimeout(pollReport, 2000)
        }
      } catch (error) {
        console.error("Failed to fetch report:", error)
        setIsLoading(false)
      }
    }

    pollReport()
  }, [reportId, onComplete])

  const getStatusIcon = () => {
    if (report?.status === "completed") {
      return <CheckCircle className="h-5 w-5 text-green-500" />
    }
    if (isLoading) {
      return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
    }
    return <AlertCircle className="h-5 w-5 text-yellow-500" />
  }

  const getStatusText = () => {
    switch (report?.status) {
      case "uploaded":
        return t("processing.uploaded")
      case "enhancing":
        return t("processing.enhancing")
      case "enhanced":
        return t("processing.enhanced")
      case "completed":
        return t("processing.completed")
      default:
        return t("processing.initializing")
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          {t("enhancement.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Section */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{getStatusText()}</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Results Section */}
        {report?.status === "completed" && (
          <Tabs defaultValue="comparison" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="comparison">{t("results.comparison")}</TabsTrigger>
              <TabsTrigger value="analysis">{t("results.analysis")}</TabsTrigger>
              <TabsTrigger value="report">{t("results.report")}</TabsTrigger>
            </TabsList>

            <TabsContent value="comparison" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">{t("images.original")}</h4>
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={report.original_image_url || "/placeholder.svg"}
                      alt="Original"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">{t("images.enhanced")}</h4>
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={report.enhanced_image_url || "/placeholder.svg"}
                      alt="Enhanced"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-4">
              {report.analysis_results && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {t("analysis.confidence")}: {report.confidence_score}%
                    </Badge>
                    <Badge
                      variant={
                        report.analysis_results.riskLevel === "low"
                          ? "default"
                          : report.analysis_results.riskLevel === "medium"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {t(`risk.${report.analysis_results.riskLevel}`)}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium mb-2">{t("analysis.findings")}</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                        {report.analysis_results.findings?.map((finding: string, index: number) => (
                          <li key={index}>{finding}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">{t("analysis.recommendations")}</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                        {report.analysis_results.recommendations?.map((rec: string, index: number) => (
                          <li key={index}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="report" className="space-y-4">
              <div className="flex gap-2">
                <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                  <Download className="h-4 w-4" />
                  {t("actions.download")}
                </Button>
                <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                  <Mail className="h-4 w-4" />
                  {t("actions.email")}
                </Button>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">{t("report.disclaimer")}</p>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}
