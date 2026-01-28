import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        if (!id) {
            return NextResponse.json(
                { error: "User ID is required" },
                { status: 400 }
            )
        }

        const session = await auth()

        // Only SUPER_ADMIN can delete users
        if (!session?.user || session.user.role !== "SUPER_ADMIN") {
            return NextResponse.json(
                { error: "Unauthorized. Only Super Admins can delete users." },
                { status: 401 }
            )
        }

        // Prevent self-deletion
        if (session.user.id === id) {
            return NextResponse.json(
                { error: "You cannot delete your own account" },
                { status: 403 }
            )
        }

        // Check if user exists
        const user = await db.user.findUnique({
            where: { id },
            include: {
                application: true,
            },
        })

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            )
        }

        // Delete user (cascade will handle related records)
        await db.user.delete({
            where: { id },
        })

        // Create audit log
        await db.auditLog.create({
            data: {
                userId: session.user.id,
                action: "USER_DELETED",
                entityType: "User",
                entityId: id,
                metadata: {
                    deletedUserEmail: user.email,
                    deletedUserRole: user.role,
                    hadApplication: !!user.application,
                },
            },
        })

        return NextResponse.json({
            success: true,
            message: `User ${user.email} deleted successfully`,
        })
    } catch (error) {
        console.error("User deletion error:", error)

        return NextResponse.json(
            { error: "Failed to delete user" },
            { status: 500 }
        )
    }
}
