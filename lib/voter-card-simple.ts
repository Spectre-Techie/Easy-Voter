import PDFDocument from "pdfkit"
import QRCode from "qrcode"
import { put } from "@vercel/blob"

export interface VoterCardData {
    firstName: string
    middleName?: string
    surname: string
    dateOfBirth: Date
    gender: string
    state: string
    lga: string
    ward: string
    vin: string
    applicationRef: string
    passportPhotoUrl: string
    issueDate: Date
}

/**
 * Simple, working PDF generation
 */
export async function generateVoterCard(data: VoterCardData, applicationId: string): Promise<string> {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    console.log("🎫 STARTING VOTER CARD GENERATION")
    console.log("   Application ID:", applicationId)
    console.log("   Name:", `${data.firstName} ${data.surname}`)
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

    try {
        // Step 1: Generate QR Code
        console.log("📱 Step 1: Generating QR code...")
        const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, '')
        const verificationUrl = `${baseUrl}/verify/${data.vin}`
        const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
            errorCorrectionLevel: "H",
            width: 200,
        })
        console.log("✅ QR code generated:", verificationUrl)

        // Step 2: Create PDF
        console.log("📄 Step 2: Creating PDF document...")
        const pdfBuffer = await createPDF(data, qrCodeDataUrl)
        console.log("✅ PDF created, size:", pdfBuffer.length, "bytes")

        // Step 3: Upload to Blob
        console.log("☁️ Step 3: Uploading to Vercel Blob...")
        const filename = `voter-cards/${applicationId}-${Date.now()}.pdf`
        const blob = await put(filename, pdfBuffer, {
            access: "public",
            contentType: "application/pdf",
        })
        console.log("✅ Uploaded successfully!")
        console.log("   URL:", blob.url)

        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        console.log("✅ VOTER CARD GENERATION COMPLETE!")
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

        return blob.url
    } catch (error) {
        console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        console.error("❌ VOTER CARD GENERATION FAILED!")
        console.error("   Error:", error)
        if (error instanceof Error) {
            console.error("   Message:", error.message)
            console.error("   Stack:", error.stack)
        }
        console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        throw error
    }
}

/**
 * Create PDF document
 */
function createPDF(data: VoterCardData, qrCodeDataUrl: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        try {
            console.log("   Creating PDF document...")

            // Credit card size: 85.6mm x 53.98mm
            const doc = new PDFDocument({
                size: [242.65, 153], // Points
                margins: { top: 10, bottom: 10, left: 10, right: 10 },
            })

            const chunks: Buffer[] = []
            doc.on("data", (chunk) => chunks.push(chunk))
            doc.on("end", () => resolve(Buffer.concat(chunks)))
            doc.on("error", reject)

            // Header
            doc.rect(0, 0, 242.65, 35).fillAndStroke("#16a34a", "#15803d")
            doc.fontSize(10).fillColor("#ffffff").font("Helvetica-Bold")
                .text("EASYVOTER", 15, 8, { width: 100 })
            doc.fontSize(7).font("Helvetica")
                .text("PERMANENT VOTER CARD", 15, 20, { width: 150 })

            // Nigeria Flag
            doc.rect(200, 8, 8, 20).fill("#008751")
            doc.rect(208, 8, 8, 20).fill("#ffffff")
            doc.rect(216, 8, 8, 20).fill("#008751")

            // Photo placeholder
            const photoX = 15, photoY = 45, photoWidth = 35, photoHeight = 45
            doc.rect(photoX, photoY, photoWidth, photoHeight).stroke("#6b7280")
            doc.fontSize(6).fillColor("#6b7280")
                .text("PHOTO", photoX, photoY + 18, { width: photoWidth, align: "center" })

            // Personal details
            const detailsX = photoX + photoWidth + 10
            let y = photoY

            const addField = (label: string, value: string) => {
                doc.fontSize(5).fillColor("#6b7280").font("Helvetica")
                    .text(label, detailsX, y, { width: 120 })
                y += 6
                doc.fontSize(7).fillColor("#1f2937").font("Helvetica-Bold")
                    .text(value.toUpperCase(), detailsX, y, { width: 120 })
                y += 10
            }

            addField("SURNAME", data.surname)
            addField("FIRST NAME", data.firstName)
            if (data.middleName) addField("MIDDLE NAME", data.middleName)
            addField("DATE OF BIRTH", formatDate(data.dateOfBirth))
            addField("GENDER", data.gender)

            // Location details
            y = photoY + photoHeight + 8
            doc.fontSize(6).fillColor("#1f2937").font("Helvetica-Bold")
                .text(`VIN: ${data.vin}`, 15, y, { width: 150 })
            y += 8
            doc.fontSize(5).fillColor("#6b7280").font("Helvetica")
                .text(`STATE: ${data.state.toUpperCase()}`, 15, y, { width: 100 })
            y += 6
            doc.text(`LGA: ${data.lga.toUpperCase()}`, 15, y, { width: 100 })
            y += 6
            doc.text(`WARD: ${data.ward.toUpperCase()}`, 15, y, { width: 100 })

            // QR Code
            const qrSize = 35
            doc.image(qrCodeDataUrl, 242.65 - qrSize - 10, 153 - qrSize - 10, {
                width: qrSize,
                height: qrSize,
            })

            // Footer
            const footerY = 153 - 20
            doc.fontSize(4).fillColor("#6b7280").font("Helvetica")
                .text(`REF: ${data.applicationRef}`, 15, footerY, { width: 80 })
                .text(`ISSUED: ${formatDate(data.issueDate)}`, 15, footerY + 5, { width: 80 })
                .text(`VALID: 10 YEARS`, 15, footerY + 10, { width: 80 })

            doc.end()
        } catch (error) {
            reject(error)
        }
    })
}

function formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, "0")
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
}
