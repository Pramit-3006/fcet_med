"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Eye, Zap, Activity } from "lucide-react"
import { useLanguage } from "@/lib/i18n"

interface EnhancementViewerProps {
  imageId: string
  userId: string
  originalUrl: string
  onAnalysisComplete?: (reportId: string) => void
}

export function EnhancementViewer({ imageId, userId, originalUrl, onAnalysisComplete }: EnhancementViewerProps) {
  const { t } = useLanguage()
  const [enhancementStatus, setEnhancementStatus] = useState<{
    status: string
    progress: number
    enhancedUrl?: string
    statusMessage?: string
  }>({ status: "pending", progress: 0 })

  const [analysisStatus, setAnalysisStatus] = useState<{
    status: string
    progress: number
    analysis?: any
    reportId?: string
  }>({ status: "pending", progress: 0 })

  const [isEnhancing, setIsEnhancing] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const startEnhancement = async () => {
    setIsEnhancing(true)

    try {
      // Fetch original image
      const response = await fetch(originalUrl)
      const blob = await response.blob()

      const formData = new FormData()
      formData.append("file", blob, "medical-image.jpg")
      formData.append("imageId", imageId)
      formData.append("userId", userId)

      const enhanceResponse = await fetch("/api/enhance-image", {
        method: "POST",
        body: formData,
      })

      if (enhanceResponse.ok) {
        const result = await enhanceResponse.json()
        setEnhancementStatus({
          status: "completed",
          progress: 100,
          enhancedUrl: result.enhancedUrl,
          statusMessage: "Enhancement completed successfully",
        })
      }
    } catch (error) {
      console.error("Enhancement failed:", error)
      setEnhancementStatus({
        status: "failed",
        progress: 0,
        statusMessage: "Enhancement failed",
      })
    } finally {
      setIsEnhancing(false)
    }
  }

  const startAnalysis = async () => {
    setIsAnalyzing(true)

    try {
      const response = await fetch("/api/analyze-medical", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageId,
          userId,
          imageType: "X-ray",
          bodyPart: "Chest",
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setAnalysisStatus({
          status: "completed",
          progress: 100,
          analysis: result.analysis,
          reportId: result.reportId,
        })

        if (onAnalysisComplete && result.reportId) {
          onAnalysisComplete(result.reportId)
        }
      }
    } catch (error) {
      console.error("Analysis failed:", error)
      setAnalysisStatus({
        status: "failed",
        progress: 0,
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Poll for enhancement progress
  useEffect(() => {
    if (isEnhancing) {
      const interval = setInterval(async () => {
        try {
          const response = await fetch(`/api/image-status/${imageId}`)
          if (response.ok) {
            const status = await response.json()
            setEnhancementStatus((prev) => ({
              ...prev,
              progress: status.enhancement_progress || 0,
              statusMessage: status.enhancement_status,
            }))
          }
        } catch (error) {
          console.error("Status check failed:", error)
        }
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [isEnhancing, imageId])

  return (
    <div className="space-y-6">
      <Tabs defaultValue="enhancement" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="enhancement" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            {t("enhancement")}
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            {t("analysis")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="enhancement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-600" />
                {t("imageEnhancement")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {enhancementStatus.status === "pending" && (
                <Button
                  onClick={startEnhancement}
                  disabled={isEnhancing}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                >
                  {isEnhancing ? t("enhancing") : t("startEnhancement")}
                </Button>
              )}

              {isEnhancing && (
                <div className="space-y-2">
                  <Progress value={enhancementStatus.progress} className="w-full" />
                  <p className="text-sm text-muted-foreground">{enhancementStatus.statusMessage}</p>
                </div>
              )}

              {enhancementStatus.status === "completed" && enhancementStatus.enhancedUrl && (
                <div className="space-y-4">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {t("enhancementComplete")}
                  </Badge>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">{t("original")}</h4>
                      <img
                        src={originalUrl || "/placeholder.svg"}
                        alt="Original"
                        className="w-full h-48 object-cover rounded-lg border"
                      />
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">{t("enhanced")}</h4>
                      <img
                        src={enhancementStatus.enhancedUrl || "/placeholder.svg"}
                        alt="Enhanced"
                        className="w-full h-48 object-cover rounded-lg border"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      {t("download")}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      {t("fullView")}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-600" />
                {t("medicalAnalysis")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {analysisStatus.status === "pending" && (
                <Button
                  onClick={startAnalysis}
                  disabled={isAnalyzing || enhancementStatus.status !== "completed"}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                >
                  {isAnalyzing ? t("analyzing") : t("startAnalysis")}
                </Button>
              )}

              {isAnalyzing && (
                <div className="space-y-2">
                  <Progress value={analysisStatus.progress} className="w-full" />
                  <p className="text-sm text-muted-foreground">{t("analyzingImage")}</p>
                </div>
              )}

              {analysisStatus.status === "completed" && analysisStatus.analysis && (
                <div className="space-y-4">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {t("analysisComplete")}
                  </Badge>

                  <div className="space-y-3">
                    <h4 className="font-medium">{t("keyFindings")}</h4>
                    {analysisStatus.analysis.findings?.map((finding: any, index: number) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-medium">{finding.description}</p>
                          <Badge
                            variant={
                              finding.severity === "Normal"
                                ? "secondary"
                                : finding.severity === "Mild"
                                  ? "default"
                                  : finding.severity === "Moderate"
                                    ? "destructive"
                                    : "destructive"
                            }
                          >
                            {finding.severity}
                          </Badge>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>
                            {t("confidence")}: {finding.confidence}%
                          </span>
                          <span>
                            {t("location")}: {finding.location}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {analysisStatus.analysis.recommendations && (
                    <div className="space-y-2">
                      <h4 className="font-medium">{t("recommendations")}</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {analysisStatus.analysis.recommendations.map((rec: string, index: number) => (
                          <li key={index}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
