"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, X, FileImage, Loader2 } from "lucide-react"
import { useTranslation, type Language } from "@/lib/i18n"

interface UploadedImage {
  url: string
  filename: string
  size: number
  type: string
}

interface ImageUploadProps {
  language: Language
  onImageUploaded: (image: UploadedImage) => void
  maxSize?: number
}

export function ImageUpload({ language, onImageUploaded, maxSize = 10 * 1024 * 1024 }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState("")
  const [preview, setPreview] = useState<string | null>(null)
  const t = useTranslation(language)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return

      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please upload a valid image file")
        return
      }

      // Validate file size
      if (file.size > maxSize) {
        setError(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`)
        return
      }

      setError("")
      setUploading(true)
      setUploadProgress(0)

      // Create preview
      const previewUrl = URL.createObjectURL(file)
      setPreview(previewUrl)

      try {
        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval)
              return 90
            }
            return prev + 10
          })
        }, 200)

        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        clearInterval(progressInterval)
        setUploadProgress(100)

        if (!response.ok) {
          throw new Error("Upload failed")
        }

        const result = await response.json()
        onImageUploaded(result)

        // Clean up preview
        setTimeout(() => {
          setPreview(null)
          setUploadProgress(0)
        }, 1000)
      } catch (error) {
        console.error("Upload error:", error)
        setError("Upload failed. Please try again.")
        setPreview(null)
      } finally {
        setUploading(false)
      }
    },
    [maxSize, onImageUploaded],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".bmp", ".tiff", ".dicom"],
    },
    multiple: false,
    disabled: uploading,
  })

  const clearPreview = () => {
    if (preview) {
      URL.revokeObjectURL(preview)
      setPreview(null)
    }
    setError("")
  }

  return (
    <div className="space-y-4">
      <Card className="medical-fade-in">
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
              ${isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"}
              ${uploading ? "pointer-events-none opacity-50" : "hover:border-primary hover:bg-primary/5"}
            `}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-4">
              {uploading ? (
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
              ) : (
                <Upload className="h-12 w-12 text-muted-foreground" />
              )}

              <div className="space-y-2">
                <h3 className="text-lg font-semibold">
                  {uploading ? "Uploading..." : isDragActive ? "Drop image here" : t.uploadImage}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {uploading
                    ? "Processing your medical image..."
                    : "Drag and drop your X-ray, CT scan, MRI, or other medical images"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Supports: PNG, JPG, JPEG, GIF, BMP, TIFF, DICOM (Max: {Math.round(maxSize / 1024 / 1024)}MB)
                </p>
              </div>

              {!uploading && (
                <Button variant="outline" className="mt-2 bg-transparent">
                  <FileImage className="mr-2 h-4 w-4" />
                  Select File
                </Button>
              )}
            </div>
          </div>

          {uploading && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="medical-pulse" />
            </div>
          )}

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {preview && (
        <Card className="medical-slide-up">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-semibold">Image Preview</h4>
              <Button variant="ghost" size="sm" onClick={clearPreview}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="relative">
              <img
                src={preview || "/placeholder.svg"}
                alt="Preview"
                className="w-full max-h-64 object-contain rounded-lg border bg-muted/50"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
