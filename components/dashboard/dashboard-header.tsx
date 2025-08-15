"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { LanguageSelector } from "@/components/language-selector"
import { ThemeToggle } from "@/components/theme-toggle"
import { Stethoscope, LogOut, User, Settings } from "lucide-react"
import { useTranslation, type Language } from "@/lib/i18n"
import type { User as UserType } from "@/lib/auth"

interface DashboardHeaderProps {
  user: UserType
  language: Language
  onLanguageChange: (language: Language) => void
}

export function DashboardHeader({ user, language, onLanguageChange }: DashboardHeaderProps) {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system")
  const router = useRouter()
  const t = useTranslation(language)

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Stethoscope className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">{t.appTitle}</h1>
            <p className="text-xs text-muted-foreground">{t.appSubtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <nav className="hidden md:flex items-center gap-4 mr-4">
            <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
              Dashboard
            </Button>
            <Button variant="ghost" size="sm" onClick={() => router.push("/analysis")}>
              Analysis
            </Button>
            <Button variant="ghost" size="sm" onClick={() => router.push("/reports")}>
              Reports
            </Button>
          </nav>

          <LanguageSelector currentLanguage={language} onLanguageChange={onLanguageChange} />
          <ThemeToggle currentTheme={theme} onThemeChange={setTheme} />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {getInitials(user.firstName, user.lastName)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">{`${user.firstName} ${user.lastName}`}</p>
                  <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                {t.logout}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
