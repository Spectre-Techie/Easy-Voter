import { NextRequest, NextResponse } from "next/server"
import { auth, isAdmin } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const roleSchema = z.object({
    role: z.enum(["VOTER", "ADMIN", "SUPER_ADMIN"]),
})

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Await params in Next.js 15
        const { id } = await params

        if (!id) {
            return NextResponse.json(
                { error: "User ID is required" },
                { status: 400 }
            )
        }

        const session = await auth()

        // Check authentication and super admin role
        if (!session?.user || session.user.role !== "SUPER_ADMIN") {
            return NextResponse.json(
                { error: "Unauthorized. Only Super Admins can change roles." },
                { status: 401 }
            )
        }

        // Prevent self role change
        if (session.user.id === id) {
            return NextResponse.json(
                { error: "You cannot change your own role" },
                { status: 403 }
            )
        }

        const body = await request.json()
        const validatedData = roleSchema.parse(body)

        // Check if user exists
        const user = await db.user.findUnique({
            where: { id },
        })

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            )
        }

        // Update user role
        const updatedUser = await db.user.update({
            where: { id },
            data: {
                role: validatedData.role,
            },
        })

        // Create audit log
        await db.auditLog.create({
            data: {
                userId: session.user.id,
                action: "ROLE_CHANGED",
                entityType: "User",
                entityId: id,
                metadata: {
                    previousRole: user.role,
                    newRole: validatedData.role,
                    targetUserEmail: user.email,
                },
            },
        })

        return NextResponse.json({
            success: true,
            user: {
                id: updatedUser.id,
                email: updatedUser.email,
                role: updatedUser.role,
            },
            message: `Role changed to ${validatedData.role} successfully`,
        })
    } catch (error) {
        console.error("Role change error:", error)

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid role data", details: error.issues },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { error: "Failed to change role" },
            { status: 500 }
        )
    }
}
