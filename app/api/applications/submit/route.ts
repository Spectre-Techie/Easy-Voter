import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { voterApplicationSchema } from "@/lib/validations"

// Generate unique application reference number
function generateApplicationRef(): string {
    const year = new Date().getFullYear()
    const random = Math.floor(Math.random() * 1000000).toString().padStart(6, "0")
    return `EV-${year}-${random}`
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const body = await request.json()

        // Validate the application data
        const validatedData = voterApplicationSchema.parse(body)

        // Check if user already has an application
        const existingApplication = await db.voterApplication.findUnique({
            where: { userId: session.user.id },
        })

        let application

        if (existingApplication) {
            // Allow reapplication only if previous was REJECTED
            if (existingApplication.status === "REJECTED") {
                console.log("🔄 Reapplication detected for rejected application:", existingApplication.id)

                // Update the existing application with new data
                application = await db.voterApplication.update({
                    where: { id: existingApplication.id },
                    data: {
                        // Personal Information
                        surname: validatedData.surname,
                        firstName: validatedData.firstName,
                        middleName: validatedData.middleName,
                        dateOfBirth: validatedData.dateOfBirth,
                        gender: validatedData.gender,
                        phoneNumber: validatedData.phoneNumber,
                        email: validatedData.email,
                        occupation: validatedData.occupation,
                        nin: validatedData.nin,

                        // Address Information
                        state: validatedData.state,
                        lga: validatedData.lga,
                        ward: validatedData.ward,
                        pollingUnit: validatedData.pollingUnit,
                        streetAddress: validatedData.streetAddress,
                        landmark: validatedData.landmark,

                        // Document Upload
                        idPhotoUrl: validatedData.idPhotoUrl,
                        idPhotoKey: validatedData.idPhotoKey,
                        passportPhotoUrl: validatedData.passportPhotoUrl,
                        passportPhotoKey: validatedData.passportPhotoKey,
                        proofOfAddressUrl: validatedData.proofOfAddressUrl,
                        proofOfAddressKey: validatedData.proofOfAddressKey,

                        // Additional Information
                        disability: validatedData.disability,
                        preferredLanguage: validatedData.preferredLanguage,
                        previousVoterCard: validatedData.previousVoterCard,

                        // Reset review fields
                        status: "PENDING",
                        submittedAt: new Date(),
                        reviewNotes: null,
                        reviewedById: null,
                        reviewedAt: null,
                        voterCardPdfUrl: null,
                        voterCardId: null,
                    },
                })

                console.log("✅ Application updated successfully for reapplication")
            } else {
                // Block if application is PENDING or APPROVED
                return NextResponse.json(
                    {
                        error: "You already have an active voter application",
                        status: existingApplication.status,
                    },
                    { status: 400 }
                )
            }
        } else {
            // Generate application reference for new applications
            const applicationRef = generateApplicationRef()

            // Create new voter application
            application = await db.voterApplication.create({
                data: {
                    userId: session.user.id,
                    applicationRef,

                    // Personal Information
                    surname: validatedData.surname,
                    firstName: validatedData.firstName,
                    middleName: validatedData.middleName,
                    dateOfBirth: validatedData.dateOfBirth,
                    gender: validatedData.gender,
                    phoneNumber: validatedData.phoneNumber,
                    email: validatedData.email,
                    occupation: validatedData.occupation,
                    nin: validatedData.nin,

                    // Address Information
                    state: validatedData.state,
                    lga: validatedData.lga,
                    ward: validatedData.ward,
                    pollingUnit: validatedData.pollingUnit,
                    streetAddress: validatedData.streetAddress,
                    landmark: validatedData.landmark,

                    // Document Upload
                    idPhotoUrl: validatedData.idPhotoUrl,
                    idPhotoKey: validatedData.idPhotoKey,
                    passportPhotoUrl: validatedData.passportPhotoUrl,
                    passportPhotoKey: validatedData.passportPhotoKey,
                    proofOfAddressUrl: validatedData.proofOfAddressUrl,
                    proofOfAddressKey: validatedData.proofOfAddressKey,

                    // Additional Information
                    disability: validatedData.disability,
                    preferredLanguage: validatedData.preferredLanguage,
                    previousVoterCard: validatedData.previousVoterCard,

                    // Set status to PENDING (submitted)
                    status: "PENDING",
                    submittedAt: new Date(),
                },
            })
        }

        // TODO: Send confirmation email
        // TODO: Send SMS notification (if enabled)

        return NextResponse.json({
            success: true,
            applicationRef: application.applicationRef,
            message: "Application submitted successfully",
        })
    } catch (error) {
        console.error("Application submission error:", error)

        if (error instanceof Error && error.name === "ZodError") {
            return NextResponse.json(
                { error: "Invalid application data", details: error.message },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { error: "Failed to submit application" },
            { status: 500 }
        )
    }
}
