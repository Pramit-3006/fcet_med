"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ImageUpload } from "@/components/image-upload"
import { RecentReports } from "@/components/dashboard/recent-reports"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, Zap, Brain, FileText, TrendingUp } from "lucide-react"
import { useTranslation, type Language } from "@/lib/i18n"
import type { User } from "@/lib/auth"

interface UploadedImage {
  url: string
  filename: string
  size: number
  type: string
}

interface DashboardClientProps {
  user: User
}

export function DashboardClient({ user }: DashboardClientProps) {
  const [language, setLanguage] = useState<Language>((user.preferredLanguage as Language) || "en")
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const t = useTranslation(language)

  // Mock recent reports data
  const recentReports = [
    {
      id: 1,
      imageType: "Chest X-Ray",
      diagnosis: "Normal chest radiograph",
      confidenceScore: 0.92,
      createdAt: "2024-01-15T10:30:00Z",
    },
    {
      id: 2,
      imageType: "CT Scan",
      diagnosis: "Possible pneumonia in lower left lobe",
      confidenceScore: 0.78,
      createdAt: "2024-01-14T14:20:00Z",
    },
  ]

  const handleImageUploaded = (image: UploadedImage) => {
    setUploadedImage(image)
    console.log("[v0] Image uploaded successfully:", image)
  }

  const handleProcessImage = async () => {
    if (!uploadedImage) return

    setIsProcessing(true)
    console.log("[v0] Starting image processing for:", uploadedImage.filename)

    // Simulate processing time
    setTimeout(() => {
      setIsProcessing(false)
      console.log("[v0] Image processing completed")
      // Here we would typically navigate to the results page
    }, 3000)
  }

  const stats = [
    {
      title: "Images Processed",
      value: "24",
      icon: <Upload className="h-4 w-4" />,
      change: "+12%",
    },
    {
      title: "Reports Generated",
      value: "18",
      icon: <FileText className="h-4 w-4" />,
      change: "+8%",
    },
    {
      title: "Avg. Confidence",
      value: "87%",
      icon: <Brain className="h-4 w-4" />,
      change: "+5%",
    },
    {
      title: "Processing Time",
      value: "2.3s",
      icon: <Zap className="h-4 w-4" />,
      change: "-15%",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} language={language} onLanguageChange={setLanguage} />

      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Welcome Section */}
        <div className="medical-fade-in">
          <h2 className="text-3xl font-bold mb-2">Welcome back, {user.firstName}!</h2>
          <p className="text-muted-foreground">
            Upload medical images for AI-powered enhancement and diagnostic analysis.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="medical-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                {stat.icon}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {stat.change} from last month
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="space-y-6">
            <Card className="medical-slide-up">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  {t.uploadNew}
                </CardTitle>
                <CardDescription>Upload X-rays, CT scans, MRIs, or other medical images for analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <ImageUpload language={language} onImageUploaded={handleImageUploaded} />

                {uploadedImage && (
                  <div className="mt-6 space-y-4">
                    <Alert>
                      <FileText className="h-4 w-4" />
                      <AlertDescription>
                        Image uploaded successfully: <strong>{uploadedImage.filename}</strong>
                      </AlertDescription>
                    </Alert>

                    <div className="flex gap-3">
                      <Button onClick={handleProcessImage} disabled={isProcessing} className="flex-1">
                        {isProcessing ? (
                          <>
                            <Zap className="mr-2 h-4 w-4 animate-pulse" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Brain className="mr-2 h-4 w-4" />
                            {t.enhanceImage} & {t.analyzeImage}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Reports */}
          <div>
            <RecentReports language={language} reports={recentReports} />
          </div>
        </div>
      </main>
    </div>
  )
}
