"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle, XCircle, Loader2, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ReviewFormProps {
    applicationId: string
    currentStatus: string
}

export function ReviewForm({ applicationId, currentStatus }: ReviewFormProps) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [reviewNotes, setReviewNotes] = useState("")

    const handleReview = async (action: "APPROVE" | "REJECT") => {
        if (action === "REJECT" && !reviewNotes.trim()) {
            toast.error("Please provide review notes when rejecting an application")
            return
        }

        setIsSubmitting(true)

        try {
            const response = await fetch(`/api/admin/applications/${applicationId}/review`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action,
                    reviewNotes: reviewNotes.trim() || undefined,
                }),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || "Failed to review application")
            }

            toast.success(`Application ${action.toLowerCase()}d successfully`)
            router.refresh()
            router.push("/admin/applications")
        } catch (error) {
            console.error("Review error:", error)
            toast.error(error instanceof Error ? error.message : "Failed to review application")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (currentStatus !== "PENDING") {
        return (
            <Card className="border-2">
                <CardHeader className="bg-gray-50 border-b">
                    <CardTitle className="text-lg sm:text-xl">Review Status</CardTitle>
                    <CardDescription>This application has been reviewed</CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-center py-4">
                        <Badge
                            variant={currentStatus === "APPROVED" ? "default" : "destructive"}
                            className="text-base sm:text-lg px-4 py-2"
                        >
                            {currentStatus}
                        </Badge>
                    </div>
                    <p className="text-sm text-center text-gray-600 mt-4">
                        This application has already been {currentStatus.toLowerCase()}.
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-2 border-orange-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-yellow-50 border-b border-orange-200">
                <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                    Review Application
                </CardTitle>
                <CardDescription>Approve or reject this voter registration</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                {/* Info Alert */}
                <Alert className="bg-blue-50 border-blue-200">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-sm text-blue-800">
                        Review all information carefully before making a decision. Notes are required for rejection.
                    </AlertDescription>
                </Alert>

                {/* Review Notes */}
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                        Review Notes
                        <span className="text-red-500 ml-1">*</span>
                        <span className="text-xs font-normal text-gray-500 ml-2">
                            (Required for rejection)
                        </span>
                    </label>
                    <Textarea
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        placeholder="Enter detailed review notes here...&#10;&#10;For rejection, explain the reason clearly.&#10;For approval, you may add any relevant comments."
                        rows={6}
                        className="w-full resize-none text-sm sm:text-base"
                        disabled={isSubmitting}
                    />
                    <p className="text-xs text-gray-500">
                        {reviewNotes.length} characters
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                    <Button
                        onClick={() => handleReview("APPROVE")}
                        disabled={isSubmitting}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-6 text-base sm:text-lg shadow-md hover:shadow-lg transition-all"
                    >
                        {isSubmitting ? (
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        ) : (
                            <CheckCircle className="w-5 h-5 mr-2" />
                        )}
                        Approve Application
                    </Button>

                    <Button
                        onClick={() => handleReview("REJECT")}
                        disabled={isSubmitting}
                        variant="destructive"
                        className="w-full font-semibold py-6 text-base sm:text-lg shadow-md hover:shadow-lg transition-all"
                    >
                        {isSubmitting ? (
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        ) : (
                            <XCircle className="w-5 h-5 mr-2" />
                        )}
                        Reject Application
                    </Button>
                </div>

                {/* Helper Text */}
                <p className="text-xs text-center text-gray-500 pt-2">
                    This action cannot be undone. The applicant will be notified of your decision.
                </p>
            </CardContent>
        </Card>
    )
}
