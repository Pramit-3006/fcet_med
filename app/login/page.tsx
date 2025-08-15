"use client"

import { useState } from "react"
import Link from "next/link"
import { LoginForm } from "@/components/auth/login-form"
import { LanguageSelector } from "@/components/language-selector"
import { ThemeToggle } from "@/components/theme-toggle"
import type { Language } from "@/lib/i18n"

export default function LoginPage() {
  const [language, setLanguage] = useState<Language>("en")
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system")

  return (
    <div className="min-h-screen medical-gradient flex flex-col">
      {/* Header */}
      <header className="p-4 flex justify-between items-center">
        <div />
        <div className="flex items-center gap-2">
          <LanguageSelector currentLanguage={language} onLanguageChange={setLanguage} />
          <ThemeToggle currentTheme={theme} onThemeChange={setTheme} />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <LoginForm language={language} />

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {"Don't have an account? "}
              <Link href="/register" className="text-primary hover:underline font-medium">
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
