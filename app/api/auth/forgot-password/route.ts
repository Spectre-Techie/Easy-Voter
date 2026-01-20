import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { resetPasswordSchema } from "@/lib/validations"
import { z } from "zod"
import crypto from "crypto"

/**
 * POST /api/auth/forgot-password
 * Generate reset token and send email
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json()

        // Validate request body
        const validatedData = resetPasswordSchema.parse(body)

        // Find user by email
        const user = await db.user.findUnique({
            where: {
                email: validatedData.email,
            },
        })

        // Always return success to prevent email enumeration
        // Don't reveal if email exists or not
        if (!user) {
            return NextResponse.json(
                { message: "If an account exists with this email, you will receive a password reset link" },
                { status: 200 }
            )
        }

        // Generate secure random token
        const resetToken = crypto.randomBytes(32).toString("hex")
        const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now

        // Save token to database
        await db.user.update({
            where: { id: user.id },
            data: {
                resetToken,
                resetTokenExpiry,
            },
        })

        // Send reset email via Resend
        const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`

        try {
            const { Resend } = await import("resend")
            const resend = new Resend(process.env.RESEND_API_KEY)

            await resend.emails.send({
                from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
                to: user.email,
                subject: "Reset Your EasyVoter Password",
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="utf-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    </head>
                    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                            <h1 style="color: white; margin: 0;">EasyVoter</h1>
                        </div>
                        
                        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                            <h2 style="color: #333; margin-top: 0;">Reset Your Password</h2>
                            
                            <p>Hello,</p>
                            
                            <p>We received a request to reset your password for your EasyVoter account. Click the button below to create a new password:</p>
                            
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${resetUrl}" style="background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Reset Password</a>
                            </div>
                            
                            <p>Or copy and paste this link into your browser:</p>
                            <p style="background: white; padding: 12px; border-radius: 5px; word-break: break-all; font-size: 14px;">
                                ${resetUrl}
                            </p>
                            
                            <p style="color: #666; font-size: 14px; margin-top: 30px;">
                                <strong>This link will expire in 1 hour.</strong>
                            </p>
                            
                            <p style="color: #666; font-size: 14px;">
                                If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
                            </p>
                            
                            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                            
                            <p style="color: #999; font-size: 12px; text-align: center;">
                                This is an automated email from EasyVoter. Please do not reply to this email.
                            </p>
                        </div>
                    </body>
                    </html>
                `,
            })
        } catch (emailError) {
            console.error("Failed to send reset email:", emailError)
            // Don't fail the request if email fails - token is still saved
        }

        return NextResponse.json(
            { message: "If an account exists with this email, you will receive a password reset link" },
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
        console.error("Forgot password error:", error)
        return NextResponse.json(
            { error: "An error occurred while processing your request" },
            { status: 500 }
        )
    }
}
