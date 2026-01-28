import PDFDocument from "pdfkit"
import QRCode from "qrcode"
import { put } from "@vercel/blob"

// Validate environment variables on module load
function validateEnvironment() {
    const required = {
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
        BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
    }

    const missing = Object.entries(required)
        .filter(([_, value]) => !value)
        .map(([key]) => key)

    if (missing.length > 0) {
        console.error("❌ Missing required environment variables:", missing.join(", "))
        console.error("PDF generation will fail without these variables!")
    }

    return missing.length === 0
}

// Run validation
const envValid = validateEnvironment()

export interface VoterCardData {
    // Personal Info
    firstName: string
    middleName?: string
    surname: string
    dateOfBirth: Date
    gender: string

    // Location
    state: string
    lga: string
    ward: string

    // Identification
    vin: string // Voter Identification Number (application ID)
    applicationRef: string

    // Media
    passportPhotoUrl: string

    // Metadata
    issueDate: Date
}

/**
 * Generate a QR code as a data URL
 * QR code contains verification URL for the voter card
 */
async function generateQRCode(vin: string): Promise<string> {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL
        if (!baseUrl) {
            throw new Error("NEXT_PUBLIC_APP_URL environment variable is not set")
        }

        const verificationUrl = `${baseUrl}/verify/${vin}`
        console.log("📱 Generating QR code for:", verificationUrl)

        // Generate QR code with high error correction
        const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
            errorCorrectionLevel: "H", // 30% recovery
            type: "image/png",
            width: 200,
            margin: 1,
        })

        console.log("✅ QR code generated successfully")
        return qrCodeDataUrl
    } catch (error) {
        console.error("❌ QR code generation error:", error)
        throw new Error(`Failed to generate QR code: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
}

/**
 * Generate Polling Unit Code in INEC format: SS-LL-WW-PPP
 * This is a simplified version - in production, this would come from INEC database
 */
function generatePollingUnitCode(state: string, lga: string, ward: string): string {
    // For now, generate a placeholder code
    // In production, this would be fetched from a proper INEC database
    const stateCode = "25" // Lagos example
    const lgaCode = "15" // Ikeja example
    const wardCode = ward.replace(/\D/g, "").padStart(2, "0").slice(0, 2) || "01"
    const puCode = "001" // Polling unit

    return `${stateCode}-${lgaCode}-${wardCode}-${puCode}`
}

/**
 * Format date as DD/MM/YYYY
 */
function formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, "0")
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
}

/**
 * Generate a professional INEC-compliant voter card PDF
 */
export async function generateVoterCardPDF(data: VoterCardData): Promise<Buffer> {
    return new Promise(async (resolve, reject) => {
        try {
            // Create PDF document (credit card size: 85.6mm x 53.98mm at 300 DPI)
            const doc = new PDFDocument({
                size: [242.65, 153], // Points (1mm = 2.83465 points)
                margins: { top: 10, bottom: 10, left: 10, right: 10 },
            })

            const chunks: Buffer[] = []
            doc.on("data", (chunk) => chunks.push(chunk))
            doc.on("end", () => resolve(Buffer.concat(chunks)))
            doc.on("error", reject)

            // Generate QR code
            const qrCodeDataUrl = await generateQRCode(data.vin)
            const pollingUnitCode = generatePollingUnitCode(data.state, data.lga, data.ward)

            // Calculate expiry date (10 years from issue)
            const expiryDate = new Date(data.issueDate)
            expiryDate.setFullYear(expiryDate.getFullYear() + 10)

            // Colors
            const primaryGreen = "#16a34a"
            const darkGreen = "#15803d"
            const textDark = "#1f2937"
            const textLight = "#6b7280"

            // Header Background
            doc
                .rect(0, 0, 242.65, 35)
                .fillAndStroke(primaryGreen, darkGreen)

            // Header Text
            doc
                .fontSize(10)
                .fillColor("#ffffff")
                .font("Helvetica-Bold")
                .text("EASYVOTER", 15, 8, { width: 100 })
                .fontSize(7)
                .font("Helvetica")
                .text("PERMANENT VOTER CARD", 15, 20, { width: 150 })

            // Nigeria Flag Colors (optional decoration)
            doc.rect(200, 8, 8, 20).fill("#008751") // Green
            doc.rect(208, 8, 8, 20).fill("#ffffff") // White
            doc.rect(216, 8, 8, 20).fill("#008751") // Green

            // Reset to white background
            doc.fillColor(textDark)

            // Passport Photo Placeholder (left side)
            const photoX = 15
            const photoY = 45
            const photoWidth = 35
            const photoHeight = 45

            try {
                // Try to load and embed the passport photo
                doc.image(data.passportPhotoUrl, photoX, photoY, {
                    width: photoWidth,
                    height: photoHeight,
                    fit: [photoWidth, photoHeight],
                })
            } catch (error) {
                // Fallback: draw a placeholder rectangle
                doc
                    .rect(photoX, photoY, photoWidth, photoHeight)
                    .stroke(textLight)
                doc
                    .fontSize(6)
                    .fillColor(textLight)
                    .text("PHOTO", photoX, photoY + 18, { width: photoWidth, align: "center" })
            }

            // Personal Details (right of photo)
            const detailsX = photoX + photoWidth + 10
            let currentY = photoY

            // Helper function to add a field
            const addField = (label: string, value: string, bold: boolean = false) => {
                doc
                    .fontSize(5)
                    .fillColor(textLight)
                    .font("Helvetica")
                    .text(label, detailsX, currentY, { width: 120 })

                currentY += 6

                doc
                    .fontSize(7)
                    .fillColor(textDark)
                    .font(bold ? "Helvetica-Bold" : "Helvetica")
                    .text(value.toUpperCase(), detailsX, currentY, { width: 120 })

                currentY += 10
            }

            // Add personal information
            addField("SURNAME", data.surname, true)
            addField("FIRST NAME", data.firstName, true)
            if (data.middleName) {
                addField("MIDDLE NAME", data.middleName)
            }
            addField("DATE OF BIRTH", formatDate(data.dateOfBirth))
            addField("GENDER", data.gender)

            // Location Details (below photo)
            currentY = photoY + photoHeight + 8

            doc
                .fontSize(6)
                .fillColor(textDark)
                .font("Helvetica-Bold")
                .text(`VIN: ${data.vin}`, 15, currentY, { width: 150 })

            currentY += 8

            doc
                .fontSize(5)
                .fillColor(textLight)
                .font("Helvetica")
                .text(`STATE: ${data.state.toUpperCase()}`, 15, currentY, { width: 100 })

            currentY += 6

            doc.text(`LGA: ${data.lga.toUpperCase()}`, 15, currentY, { width: 100 })

            currentY += 6

            doc.text(`WARD: ${data.ward.toUpperCase()}`, 15, currentY, { width: 100 })

            currentY += 6

            doc.text(`PU CODE: ${pollingUnitCode}`, 15, currentY, { width: 100 })

            // QR Code (bottom right)
            const qrSize = 35
            const qrX = 242.65 - qrSize - 10
            const qrY = 153 - qrSize - 10

            doc.image(qrCodeDataUrl, qrX, qrY, {
                width: qrSize,
                height: qrSize,
            })

            // Footer Information (bottom left)
            const footerY = 153 - 20
            doc
                .fontSize(4)
                .fillColor(textLight)
                .font("Helvetica")
                .text(`REF: ${data.applicationRef}`, 15, footerY, { width: 80 })
                .text(`ISSUED: ${formatDate(data.issueDate)}`, 15, footerY + 5, { width: 80 })
                .text(`VALID: 10 YEARS`, 15, footerY + 10, { width: 80 })

            // Finalize PDF
            doc.end()
        } catch (error) {
            console.error("PDF generation error:", error)
            reject(error)
        }
    })
}

/**
 * Generate voter card and upload to Vercel Blob storage
 */
export async function generateAndUploadVoterCard(
    data: VoterCardData,
    applicationId: string
): Promise<string> {
    try {
        console.log("🎫 Starting voter card generation...")
        console.log("   VIN:", data.vin)
        console.log("   Name:", `${data.firstName} ${data.surname}`)
        console.log("   Application ID:", applicationId)

        // Validate environment
        if (!envValid) {
            throw new Error("Environment variables not properly configured. Check NEXT_PUBLIC_APP_URL and BLOB_READ_WRITE_TOKEN")
        }

        // Validate passport photo URL
        console.log("📸 Validating passport photo URL:", data.passportPhotoUrl)
        if (!data.passportPhotoUrl || !data.passportPhotoUrl.startsWith("http")) {
            console.warn("⚠️ Invalid passport photo URL, will use placeholder")
        }

        // Generate PDF
        console.log("📄 Generating PDF document...")
        const pdfBuffer = await generateVoterCardPDF(data)
        console.log("✅ PDF generated successfully, size:", pdfBuffer.length, "bytes")

        // Upload to Vercel Blob
        const filename = `voter-cards/${applicationId}-${Date.now()}.pdf`
        console.log("☁️ Uploading to Vercel Blob:", filename)

        const blob = await put(filename, pdfBuffer, {
            access: "public",
            contentType: "application/pdf",
        })

        console.log("✅ Upload successful!")
        console.log("   Blob URL:", blob.url)

        return blob.url
    } catch (error) {
        console.error("❌ Voter card generation FAILED:")
        console.error("   Error:", error)
        if (error instanceof Error) {
            console.error("   Message:", error.message)
            console.error("   Stack:", error.stack)
        }
        throw new Error(`Failed to generate voter card: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
}
