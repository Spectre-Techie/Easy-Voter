import { NextResponse } from "next/server"
import { hash, compare } from "bcryptjs"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(request: Request) {
    try {
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const { currentPassword, newPassword } = await request.json()

        if (!currentPassword || !newPassword) {
            return NextResponse.json(
                { error: "All fields are required" },
                { status: 400 }
            )
        }

        if (newPassword.length < 8) {
            return NextResponse.json(
                { error: "Password must be at least 8 characters" },
                { status: 400 }
            )
        }

        // Get user with password
        const user = await db.user.findUnique({
            where: { id: session.user.id },
        })

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            )
        }

        // Verify current password
        const isValid = await compare(currentPassword, user.passwordHash)

        if (!isValid) {
            return NextResponse.json(
                { error: "Current password is incorrect" },
                { status: 400 }
            )
        }

        // Hash new password
        const hashedPassword = await hash(newPassword, 10)

        // Update password
        await db.user.update({
            where: { id: user.id },
            data: {
                passwordHash: hashedPassword,
            },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Password change error:", error)
        return NextResponse.json(
            { error: "Failed to change password" },
            { status: 500 }
        )
    }
}
