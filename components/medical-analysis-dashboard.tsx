"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useI18n } from "@/lib/i18n"
import { Activity, Brain, FileText, TrendingUp, AlertTriangle, CheckCircle, Clock } from "lucide-react"

interface AnalysisData {
  findings: string[]
  riskLevel: "low" | "medium" | "high"
  confidenceScore: number
  recommendations: string[]
  summary: string
}

interface MedicalAnalysisDashboardProps {
  analysisData: AnalysisData
  imageType: string
  bodyPart: string
}

export function MedicalAnalysisDashboard({ analysisData, imageType, bodyPart }: MedicalAnalysisDashboardProps) {
  const { t } = useI18n()

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "text-green-600 bg-green-50 border-green-200"
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "high":
        return "text-red-600 bg-red-50 border-red-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case "low":
        return <CheckCircle className="h-4 w-4" />
      case "medium":
        return <Clock className="h-4 w-4" />
      case "high":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Analysis Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">{t("analysis.confidence")}</p>
                <p className="text-2xl font-bold">{analysisData.confidenceScore}%</p>
              </div>
            </div>
            <Progress value={analysisData.confidenceScore} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              {getRiskIcon(analysisData.riskLevel)}
              <div>
                <p className="text-sm font-medium">{t("analysis.riskLevel")}</p>
                <Badge className={getRiskColor(analysisData.riskLevel)}>{t(`risk.${analysisData.riskLevel}`)}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium">{t("analysis.imageType")}</p>
                <p className="text-lg font-semibold">{imageType}</p>
                <p className="text-sm text-gray-500">{bodyPart}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis */}
      <Tabs defaultValue="findings" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="findings">{t("analysis.findings")}</TabsTrigger>
          <TabsTrigger value="recommendations">{t("analysis.recommendations")}</TabsTrigger>
          <TabsTrigger value="summary">{t("analysis.summary")}</TabsTrigger>
        </TabsList>

        <TabsContent value="findings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                {t("analysis.keyFindings")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {analysisData.findings.map((finding, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <p className="text-sm leading-relaxed">{finding}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                {t("analysis.clinicalRecommendations")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {analysisData.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                    <p className="text-sm leading-relaxed">{recommendation}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {t("analysis.executiveSummary")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed mb-4">{analysisData.summary}</p>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800">
                  <strong>{t("disclaimer.title")}:</strong> {t("disclaimer.text")}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
