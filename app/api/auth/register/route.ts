import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { hashPassword } from "@/lib/password"
import { registerApiSchema } from "@/lib/validations"
import { z } from "zod"

/**
 * POST /api/auth/register
 * Register a new user account
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json()

        // Validate request body
        const validatedData = registerApiSchema.parse(body)

        // Check if user already exists
        const existingUser = await db.user.findUnique({
            where: {
                email: validatedData.email,
            },
        })

        if (existingUser) {
            return NextResponse.json(
                { error: "A user with this email already exists" },
                { status: 400 }
            )
        }

        // Hash password
        const passwordHash = await hashPassword(validatedData.password)

        // Create user
        const user = await db.user.create({
            data: {
                email: validatedData.email,
                passwordHash,
                role: "VOTER", // Default role is VOTER
            },
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
            },
        })

        return NextResponse.json(
            {
                message: "Account created successfully",
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                },
            },
            { status: 201 }
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
        console.error("Registration error:", error)
        return NextResponse.json(
            { error: "An error occurred during registration" },
            { status: 500 }
        )
    }
}
