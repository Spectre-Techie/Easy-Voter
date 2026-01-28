import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function DELETE() {
    try {
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        // Delete user (cascade will handle related records)
        await db.user.delete({
            where: { id: session.user.id },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Account deletion error:", error)
        return NextResponse.json(
            { error: "Failed to delete account" },
            { status: 500 }
        )
    }
}
