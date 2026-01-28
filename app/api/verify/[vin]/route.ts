import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

// Rate limiting map (in production, use Redis)
const verificationAttempts = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
    const now = Date.now()
    const limit = verificationAttempts.get(ip)

    if (!limit || now > limit.resetAt) {
        // Reset or create new limit (100 requests per minute)
        verificationAttempts.set(ip, { count: 1, resetAt: now + 60000 })
        return true
    }

    if (limit.count >= 100) {
        return false
    }

    limit.count++
    return true
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ vin: string }> }
) {
    try {
        // Get client IP for rate limiting
        const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"

        // Check rate limit
        if (!checkRateLimit(ip)) {
            return NextResponse.json(
                {
                    error: "Rate limit exceeded",
                    message: "Too many verification attempts. Please try again later.",
                },
                { status: 429 }
            )
        }

        // Await params in Next.js 15
        const { vin } = await params

        // Validate VIN
        if (!vin) {
            return NextResponse.json(
                { error: "VIN is required" },
                { status: 400 }
            )
        }

        console.log("🔍 Verifying voter card:", vin, "from IP:", ip)

        // Find application by ID (VIN is the application ID)
        const application = await db.voterApplication.findUnique({
            where: { id: vin },
            select: {
                id: true,
                firstName: true,
                surname: true,
                applicationRef: true,
                status: true,
                state: true,
                lga: true,
                voterCardId: true,
                reviewedAt: true,
            },
        })

        if (!application) {
            console.log("❌ Voter card not found:", vin)
            return NextResponse.json(
                {
                    valid: false,
                    message: "Voter card not found in our records",
                },
                { status: 404 }
            )
        }

        // Check if approved
        if (application.status !== "APPROVED") {
            console.log("⚠️ Voter card not approved:", vin, "status:", application.status)
            return NextResponse.json(
                {
                    valid: false,
                    message: "This voter card is not valid. Application status: " + application.status,
                },
                { status: 200 }
            )
        }

        console.log("✅ Valid voter card verified:", vin)

        // Return minimal, non-sensitive information
        return NextResponse.json(
            {
                valid: true,
                voter: {
                    name: `${application.firstName} ${application.surname}`,
                    vin: application.id,
                    cardId: application.voterCardId,
                    state: application.state,
                    lga: application.lga,
                    status: "ACTIVE",
                    verifiedAt: new Date().toISOString(),
                },
            },
            { status: 200 }
        )
    } catch (error) {
        console.error("❌ Verification error:", error)

        return NextResponse.json(
            {
                error: "Verification failed",
                message: "An error occurred while verifying the voter card",
            },
            { status: 500 }
        )
    }
}
