import { NextRequest, NextResponse } from "next/server"
import { auth, isAdmin } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const reviewSchema = z.object({
    action: z.enum(["APPROVE", "REJECT"]),
    reviewNotes: z.string().optional(),
}).refine((data) => {
    // If rejecting, notes are required
    if (data.action === "REJECT" && !data.reviewNotes) {
        return false
    }
    return true
}, {
    message: "Review notes are required when rejecting an application",
    path: ["reviewNotes"],
})

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Await params in Next.js 15
        const { id } = await params

        // Validate ID exists
        if (!id) {
            return NextResponse.json(
                { error: "Application ID is required" },
                { status: 400 }
            )
        }

        const session = await auth()

        // Check authentication and admin role
        if (!session?.user || !isAdmin(session)) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const body = await request.json()
        const validatedData = reviewSchema.parse(body)

        // Check if application exists
        const application = await db.voterApplication.findUnique({
            where: { id },
        })

        if (!application) {
            return NextResponse.json(
                { error: "Application not found" },
                { status: 404 }
            )
        }

        // Check if application is already reviewed
        if (application.status !== "PENDING") {
            return NextResponse.json(
                { error: "Application has already been reviewed" },
                { status: 400 }
            )
        }

        // Update application status
        const updatedApplication = await db.voterApplication.update({
            where: { id },
            data: {
                status: validatedData.action === "APPROVE" ? "APPROVED" : "REJECTED",
                reviewNotes: validatedData.reviewNotes,
                reviewedById: session.user.id,
                reviewedAt: new Date(),
            },
        })

        // TODO: Send email notification to user about the decision

        return NextResponse.json({
            success: true,
            application: updatedApplication,
            message: `Application ${validatedData.action.toLowerCase()}d successfully`,
        })
    } catch (error) {
        console.error("Review error:", error)

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid review data", details: error.issues },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { error: "Failed to review application" },
            { status: 500 }
        )
    }
}
