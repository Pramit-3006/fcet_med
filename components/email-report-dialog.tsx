"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, Send, CheckCircle, AlertCircle } from "lucide-react"
import { useTranslation, type Language } from "@/lib/i18n"

interface EmailReportDialogProps {
  reportId: string
  userEmail: string
  language: Language
  children: React.ReactNode
}

export function EmailReportDialog({ reportId, userEmail, language, children }: EmailReportDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState(userEmail)
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const t = useTranslation(language)

  const handleSendEmail = async () => {
    if (!email || !email.includes("@")) {
      setStatus("error")
      setMessage("Please enter a valid email address")
      return
    }

    setIsLoading(true)
    setStatus("idle")

    try {
      const response = await fetch("/api/send-report-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reportId,
          email,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus("success")
        setMessage("Report sent successfully to your email!")
        setTimeout(() => {
          setIsOpen(false)
          setStatus("idle")
          setMessage("")
        }, 2000)
      } else {
        setStatus("error")
        setMessage(data.error || "Failed to send email")
      }
    } catch (error) {
      setStatus("error")
      setMessage("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Medical Report
          </DialogTitle>
          <DialogDescription>
            Send this medical analysis report to your email address for your records.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {status !== "idle" && (
            <Alert className={status === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              {status === "success" ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={status === "success" ? "text-green-800" : "text-red-800"}>
                {message}
              </AlertDescription>
            </Alert>
          )}

          <div className="text-sm text-muted-foreground">
            <p>The email will include:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Complete analysis results</li>
              <li>Key findings and recommendations</li>
              <li>Confidence scores and risk assessment</li>
              <li>Medical disclaimers</li>
              <li>Link to view full report online</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSendEmail} disabled={isLoading || status === "success"}>
            {isLoading ? (
              <>
                <Send className="mr-2 h-4 w-4 animate-pulse" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Report
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
