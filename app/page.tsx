"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LanguageSelector } from "@/components/language-selector"
import { ThemeToggle } from "@/components/theme-toggle"
import { Stethoscope, Zap, Brain, FileText, Shield, Globe } from "lucide-react"
import { useTranslation, type Language } from "@/lib/i18n"

export default function HomePage() {
  const [language, setLanguage] = useState<Language>("en")
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system")
  const router = useRouter()
  const t = useTranslation(language)

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me")
        if (response.ok) {
          router.push("/dashboard")
        }
      } catch (error) {
        // User not logged in, stay on home page
      }
    }
    checkAuth()
  }, [router])

  const features = [
    {
      icon: <Zap className="h-6 w-6" />,
      title: "AI Enhancement",
      description: "Transform low-quality medical images into high-resolution, clear diagnostics",
    },
    {
      icon: <Brain className="h-6 w-6" />,
      title: "Smart Analysis",
      description: "Advanced AI identifies conditions and provides detailed medical insights",
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: "Comprehensive Reports",
      description: "Generate detailed reports with charts, tables, and professional formatting",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Secure & Private",
      description: "HIPAA-compliant platform ensuring your medical data stays protected",
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "Multi-Language",
      description: "Available in 9 languages for global healthcare accessibility",
    },
  ]

  return (
    <div className="min-h-screen medical-gradient">
      {/* Header */}
      <header className="p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Stethoscope className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold">{t.appTitle}</span>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSelector currentLanguage={language} onLanguageChange={setLanguage} />
          <ThemeToggle currentTheme={theme} onThemeChange={setTheme} />
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto medical-fade-in">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            {t.appTitle}
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t.appSubtitle} - Revolutionizing medical imaging with AI-powered enhancement and diagnostic capabilities
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8">
              <Link href="/register">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 bg-transparent">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 medical-slide-up">Advanced Medical AI Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="medical-fade-in hover:shadow-lg transition-all duration-300"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader>
                  <div className="p-2 bg-primary/10 rounded-lg w-fit mb-2">{feature.icon}</div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-2xl mx-auto medical-slide-up">
          <h2 className="text-3xl font-bold mb-6">Ready to Transform Medical Imaging?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join healthcare professionals worldwide who trust MediScan AI for accurate, enhanced medical image analysis.
          </p>
          <Button asChild size="lg" className="text-lg px-8">
            <Link href="/register">Start Free Trial</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t">
        <div className="max-w-6xl mx-auto text-center text-sm text-muted-foreground">
          <p>&copy; 2024 MediScan AI. Advanced Medical Image Analysis Platform.</p>
        </div>
      </footer>
    </div>
  )
}
