"use client"

import { useState } from "react"
import { Upload, X, Loader2, CheckCircle } from "lucide-react"

interface FileUploadProps {
    label: string
    required?: boolean
    accept?: string
    onUpload: (url: string, key: string) => void
    currentUrl?: string
}

export function FileUpload({ label, required, accept = "image/*", onUpload, currentUrl }: FileUploadProps) {
    const [file, setFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(currentUrl || null)
    const [uploading, setUploading] = useState(false)
    const [uploaded, setUploaded] = useState(!!currentUrl)
    const [error, setError] = useState<string | null>(null)

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (!selectedFile) return

        // Validate file size (5MB max)
        if (selectedFile.size > 5 * 1024 * 1024) {
            setError("File size must be less than 5MB")
            return
        }

        setFile(selectedFile)
        setError(null)

        // Create preview for images
        if (selectedFile.type.startsWith("image/")) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setPreview(reader.result as string)
            }
            reader.readAsDataURL(selectedFile)
        }

        // Auto-upload
        await uploadFile(selectedFile)
    }

    const uploadFile = async (fileToUpload: File) => {
        setUploading(true)
        setError(null)

        try {
            const formData = new FormData()
            formData.append("file", fileToUpload)

            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || "Upload failed")
            }

            const data = await response.json()
            onUpload(data.url, data.key)
            setUploaded(true)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Upload failed")
            setFile(null)
            setPreview(null)
        } finally {
            setUploading(false)
        }
    }

    const handleRemove = () => {
        setFile(null)
        setPreview(null)
        setUploaded(false)
        setError(null)
    }

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
                {label} {required && <span className="text-red-500">*</span>}
            </label>

            {!preview ? (
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-10 h-10 mb-3 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG, WebP or PDF (max 5MB)</p>
                    </div>
                    <input
                        type="file"
                        className="hidden"
                        accept={accept}
                        onChange={handleFileChange}
                        disabled={uploading}
                    />
                </label>
            ) : (
                <div className="relative">
                    <div className="relative w-full h-40 border-2 border-gray-300 rounded-lg overflow-hidden">
                        {preview.startsWith("data:") || preview.startsWith("http") ? (
                            <img
                                src={preview}
                                alt="Preview"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full bg-gray-100">
                                <p className="text-sm text-gray-600">File uploaded</p>
                            </div>
                        )}

                        {uploading && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                <Loader2 className="w-8 h-8 text-white animate-spin" />
                            </div>
                        )}

                        {uploaded && !uploading && (
                            <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                                <CheckCircle className="w-5 h-5" />
                            </div>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={handleRemove}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {error && (
                <p className="text-red-500 text-sm">{error}</p>
            )}

            {uploaded && !uploading && (
                <p className="text-green-600 text-sm flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    File uploaded successfully
                </p>
            )}
        </div>
    )
}
