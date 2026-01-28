import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { generateVoterCard } from "@/lib/voter-card-react"

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    console.log("📥 VOTER CARD DOWNLOAD REQUEST RECEIVED")
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

    try {
        const { id } = await params
        console.log("   Application ID:", id)

        if (!id) {
            return NextResponse.json({ error: "Application ID is required" }, { status: 400 })
        }

        // Check authentication
        const session = await auth()
        if (!session?.user) {
            console.log("❌ Unauthorized - no session")
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
        console.log("✅ User authenticated:", session.user.email)

        // Fetch application
        const application = await db.voterApplication.findUnique({
            where: { id },
        })

        if (!application) {
            console.log("❌ Application not found")
            return NextResponse.json({ error: "Application not found" }, { status: 404 })
        }
        console.log("✅ Application found:", application.applicationRef)

        // Authorization
        const isOwner = application.userId === session.user.id
        const isAdmin = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN"

        if (!isOwner && !isAdmin) {
            console.log("❌ Forbidden - user doesn't own this application")
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }
        console.log("✅ Authorization passed")

        // Check if approved
        if (application.status !== "APPROVED") {
            console.log("❌ Application not approved, status:", application.status)
            return NextResponse.json(
                { error: "Application must be approved first", status: application.status },
                { status: 400 }
            )
        }
        console.log("✅ Application is approved")

        // CRITICAL: Always generate FRESH PDF (ignore old cached URL)
        // This ensures all users get the latest design even if they downloaded before
        console.log("🔄 FORCING FRESH PDF GENERATION...")
        if (application.voterCardPdfUrl) {
            console.log("   ⚠️  Old PDF URL exists (will be replaced):", application.voterCardPdfUrl)
        }

        // Generate voter card with latest design
        const voterCardData = {
            firstName: application.firstName,
            middleName: application.middleName || undefined,
            surname: application.surname,
            dateOfBirth: application.dateOfBirth,
            gender: application.gender,
            state: application.state,
            lga: application.lga,
            ward: application.ward || "Ward 01",
            vin: application.id,
            applicationRef: application.applicationRef,
            passportPhotoUrl: application.passportPhotoUrl,
            issueDate: application.reviewedAt || new Date(),
        }

        console.log("📞 Calling generateVoterCard...")
        const pdfUrl = await generateVoterCard(voterCardData, application.id)

        // Update database with new PDF URL
        console.log("💾 Updating database with fresh PDF URL...")
        await db.voterApplication.update({
            where: { id },
            data: {
                voterCardPdfUrl: pdfUrl,
                voterCardId: `VC-${application.applicationRef}`,
            },
        })

        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        console.log("✅ SUCCESS! Redirecting to FRESH PDF")
        console.log("   New URL:", pdfUrl)
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

        return NextResponse.redirect(pdfUrl)
    } catch (error) {
        console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        console.error("❌ VOTER CARD DOWNLOAD FAILED!")
        console.error("   Error:", error)
        if (error instanceof Error) {
            console.error("   Message:", error.message)
            console.error("   Stack:", error.stack)
        }
        console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

        return NextResponse.json(
            {
                error: "Failed to generate voter card",
                message: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        )
    }
}
