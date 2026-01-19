import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { hashPassword } from "@/lib/password"
import { z } from "zod"

const resetPasswordApiSchema = z.object({
    token: z.string().min(1, "Reset token is required"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),
})

/**
 * POST /api/auth/reset-password
 * Reset password using valid token
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json()

        // Validate request body
        const validatedData = resetPasswordApiSchema.parse(body)

        // Find user with valid token
        const user = await prisma.user.findFirst({
            where: {
                resetToken: validatedData.token,
                resetTokenExpiry: {
                    gt: new Date(), // Token must not be expired
                },
            },
        })

        if (!user) {
            return NextResponse.json(
                { error: "Invalid or expired reset token" },
                { status: 400 }
            )
        }

        // Hash new password
        const passwordHash = await hashPassword(validatedData.password)

        // Update password and clear reset token
        await prisma.user.update({
            where: { id: user.id },
            data: {
                passwordHash,
                resetToken: null,
                resetTokenExpiry: null,
            },
        })

        return NextResponse.json(
            { message: "Password reset successfully" },
            { status: 200 }
        )
    } catch (error) {
        // Handle Zod validation errors
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    error: "Validation failed",
                    details: error.issues.map((err) => ({
                        field: err.path.join("."),
                        message: err.message,
                    })),
                },
                { status: 400 }
            )
        }

        // Handle unexpected errors
        console.error("Reset password error:", error)
        return NextResponse.json(
            { error: "An error occurred while resetting your password" },
            { status: 500 }
        )
    }
}
