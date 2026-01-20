import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

/**
 * GET /api/auth/validate-reset-token
 * Validate if a reset token is valid and not expired
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const token = searchParams.get("token")

        if (!token) {
            return NextResponse.json(
                { error: "Reset token is required" },
                { status: 400 }
            )
        }

        // Find user with valid token
        const user = await db.user.findFirst({
            where: {
                resetToken: token,
                resetTokenExpiry: {
                    gt: new Date(), // Token must not be expired
                },
            },
            select: {
                id: true,
            },
        })

        if (!user) {
            return NextResponse.json(
                { error: "Invalid or expired reset token" },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { valid: true },
            { status: 200 }
        )
    } catch (error) {
        console.error("Validate reset token error:", error)
        return NextResponse.json(
            { error: "An error occurred while validating the token" },
            { status: 500 }
        )
    }
}
