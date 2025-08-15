"use client"

import { useState } from "react"
import Link from "next/link"
import { RegisterForm } from "@/components/auth/register-form"
import { LanguageSelector } from "@/components/language-selector"
import { ThemeToggle } from "@/components/theme-toggle"
import type { Language } from "@/lib/i18n"

export default function RegisterPage() {
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
          <RegisterForm language={language} onLanguageChange={setLanguage} />

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {"Already have an account? "}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
