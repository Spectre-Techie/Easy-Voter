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

        console.log("📝 Updating application status to:", validatedData.action)

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

        console.log("✅ Application status updated to:", updatedApplication.status)
        console.log("🔍 Checking if action is APPROVE:", validatedData.action, "===", "APPROVE", "?", validatedData.action === "APPROVE")

        // Send email notification to user
        try {
            console.log("📧 Attempting to send email notification...")
            console.log("Recipient:", updatedApplication.email)
            console.log("Status:", updatedApplication.status)

            const { sendEmail, getApplicationApprovedEmail, getApplicationRejectedEmail } = await import("@/lib/email")

            const emailTemplate = validatedData.action === "APPROVE"
                ? getApplicationApprovedEmail({
                    name: `${updatedApplication.firstName} ${updatedApplication.surname}`,
                    applicationRef: updatedApplication.applicationRef,
                })
                : getApplicationRejectedEmail({
                    name: `${updatedApplication.firstName} ${updatedApplication.surname}`,
                    applicationRef: updatedApplication.applicationRef,
                    reason: validatedData.reviewNotes || "Please review your application details and documents.",
                })

            console.log("📨 Sending:", emailTemplate.subject)

            const result = await sendEmail({
                to: updatedApplication.email,
                subject: emailTemplate.subject,
                html: emailTemplate.html,
            })

            console.log("✅ Email sent:", result)
        } catch (emailError) {
            // Log email error but don't fail the request
            console.error("❌ Email error:", emailError)
            if (emailError instanceof Error) {
                console.error("Message:", emailError.message)
            }
        }

        console.log("🔍 About to check if should generate PDF...")
        console.log("   validatedData.action:", validatedData.action)
        console.log("   Is APPROVE?:", validatedData.action === "APPROVE")

        // Generate voter card PDF if approved
        if (validatedData.action === "APPROVE") {
            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
            console.log("🎫 ENTERED PDF GENERATION BLOCK!")
            console.log("   Application ID:", updatedApplication.id)
            console.log("   User:", `${updatedApplication.firstName} ${updatedApplication.surname}`)
            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

            try {
                console.log("📦 Importing voter-card module...")
                const { generateVoterCard } = await import("@/lib/voter-card-react")
                console.log("✅ Module imported successfully")

                const voterCardData = {
                    firstName: updatedApplication.firstName,
                    middleName: updatedApplication.middleName || undefined,
                    surname: updatedApplication.surname,
                    dateOfBirth: updatedApplication.dateOfBirth,
                    gender: updatedApplication.gender,
                    state: updatedApplication.state,
                    lga: updatedApplication.lga,
                    ward: updatedApplication.ward || "Ward 01",
                    vin: updatedApplication.id,
                    applicationRef: updatedApplication.applicationRef,
                    passportPhotoUrl: updatedApplication.passportPhotoUrl,
                    issueDate: new Date(),
                }

                console.log("📋 Voter card data prepared:")
                console.log(JSON.stringify(voterCardData, null, 2))
                console.log("📞 Calling generateVoterCard...")

                const pdfUrl = await generateVoterCard(voterCardData, updatedApplication.id)

                console.log("💾 PDF URL received:", pdfUrl)
                console.log("💾 Updating database with PDF URL...")

                // Update application with PDF URL
                await db.voterApplication.update({
                    where: { id: updatedApplication.id },
                    data: {
                        voterCardPdfUrl: pdfUrl,
                        voterCardId: `VC-${updatedApplication.applicationRef}`,
                    },
                })

                console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
                console.log("✅ PDF GENERATION COMPLETE!")
                console.log("   PDF URL:", pdfUrl)
                console.log("   Card ID:", `VC-${updatedApplication.applicationRef}`)
                console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
            } catch (pdfError) {
                // Log PDF generation error but don't fail the request
                console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
                console.error("❌ PDF GENERATION FAILED!")
                console.error("   Error:", pdfError)
                if (pdfError instanceof Error) {
                    console.error("   Message:", pdfError.message)
                    console.error("   Stack:", pdfError.stack)
                }
                console.error("   Note: Approval succeeded, but PDF will be generated on download")
                console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
            }
        } else {
            console.log("⏭️ Skipping PDF generation (action is not APPROVE)")
        }

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
