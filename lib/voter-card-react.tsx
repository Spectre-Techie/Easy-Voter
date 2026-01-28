import React from "react"
import { renderToBuffer } from "@react-pdf/renderer"
import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer"
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

// Portrait ID Card - 2.2" × 3.4" (158.4pt × 244.8pt)
const CARD_WIDTH = 158.4
const CARD_HEIGHT = 244.8

const styles = StyleSheet.create({
    page: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        backgroundColor: "#0f172a",
        position: "relative",
    },

    // FRONT CARD (Top Half)
    frontSection: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: CARD_HEIGHT / 2,
        padding: 6,
        borderBottom: "1px solid #d4af37",
    },

    // Header
    header: {
        alignItems: "center",
        marginBottom: 4,
        borderBottom: "0.5px solid #334155",
        paddingBottom: 2,
    },
    brandText: {
        fontSize: 8,
        fontWeight: "bold",
        color: "#d4af37",
        letterSpacing: 1,
    },
    subText: {
        fontSize: 3.5,
        color: "#94a3b8",
        marginTop: 0.5,
    },

    // Content (Photo + Details)
    contentRow: {
        flexDirection: "row",
        gap: 5,
        marginBottom: 3,
    },
    photoBox: {
        width: 35,
        height: 45,
        border: "1px solid #d4af37",
        borderRadius: 2,
        overflow: "hidden",
        backgroundColor: "#1e293b",
    },
    photoImage: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
    },
    photoPlaceholder: {
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#334155",
    },

    detailsCol: {
        flex: 1,
        justifyContent: "flex-start",
        gap: 2,
    },
    fieldGroup: {
        marginBottom: 2,
    },
    label: {
        fontSize: 3,
        color: "#94a3b8",
        marginBottom: 0.5,
    },
    value: {
        fontSize: 5,
        color: "#f8fafc",
        fontWeight: "bold",
    },
    valueLarge: {
        fontSize: 6,
        color: "#f8fafc",
        fontWeight: "bold",
    },
    valueGold: {
        fontSize: 5,
        color: "#d4af37",
        fontWeight: "bold",
    },

    // VIN Strip
    vinStrip: {
        backgroundColor: "rgba(212, 175, 55, 0.1)",
        padding: 2,
        borderRadius: 1,
        borderLeft: "2px solid #d4af37",
        marginTop: 2,
    },
    vinLabel: {
        fontSize: 3,
        color: "#d4af37",
        marginBottom: 0.5,
    },
    vinValue: {
        fontSize: 5,
        color: "#f8fafc",
        fontWeight: "bold",
        letterSpacing: 0.5,
    },

    // Address Row
    addressRow: {
        flexDirection: "row",
        gap: 3,
        marginTop: 2,
    },
    addressItem: {
        flex: 1,
    },
    addressLabel: {
        fontSize: 2.5,
        color: "#64748b",
        marginBottom: 0.5,
    },
    addressValue: {
        fontSize: 4,
        color: "#e2e8f0",
        fontWeight: "bold",
    },

    // BACK CARD (Bottom Half)
    backSection: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: CARD_HEIGHT / 2,
        padding: 6,
        backgroundColor: "#1a2f4a",
    },

    backHeader: {
        fontSize: 6,
        color: "#d4af37",
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 4,
        borderBottom: "0.5px solid #334155",
        paddingBottom: 2,
    },

    // QR & Barcode Row
    codesRow: {
        flexDirection: "row",
        gap: 5,
        marginBottom: 4,
    },
    qrBox: {
        width: 35,
        height: 35,
        backgroundColor: "white",
        padding: 1,
        borderRadius: 2,
    },
    qrImage: {
        width: "100%",
        height: "100%",
    },
    barcodeBox: {
        flex: 1,
        backgroundColor: "white",
        borderRadius: 2,
        padding: 3,
        justifyContent: "center",
        alignItems: "center",
    },
    barcodeBars: {
        fontSize: 10,
        letterSpacing: 1,
    },
    barcodeText: {
        fontSize: 3.5,
        marginTop: 1,
    },

    // Info Grid
    infoGrid: {
        backgroundColor: "#1e293b",
        borderRadius: 2,
        padding: 3,
        marginBottom: 3,
    },
    infoRow: {
        flexDirection: "row",
        marginBottom: 2,
    },
    infoCol: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 3,
        color: "#94a3b8",
        marginBottom: 0.5,
    },
    infoValue: {
        fontSize: 4,
        color: "#f8fafc",
        fontWeight: "bold",
    },

    // Footer
    footer: {
        borderTop: "0.5px solid #334155",
        paddingTop: 2,
    },
    footerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 1,
    },
    footerText: {
        fontSize: 3,
        color: "#94a3b8",
    },
    warningText: {
        fontSize: 3,
        color: "#d4af37",
        textAlign: "center",
        fontWeight: "bold",
    },

    // Corners
    cornerTL: {
        position: "absolute",
        top: 0,
        left: 0,
        width: 8,
        height: 8,
        borderTop: "2px solid #d4af37",
        borderLeft: "2px solid #d4af37",
    },
    cornerBR: {
        position: "absolute",
        bottom: 0,
        right: 0,
        width: 8,
        height: 8,
        borderBottom: "2px solid #d4af37",
        borderRight: "2px solid #d4af37",
    },
})

const VoterCardDocument = ({ data, qrCodeDataUrl }: { data: VoterCardData; qrCodeDataUrl: string }) => (
    <Document>
        <Page size={[CARD_WIDTH, CARD_HEIGHT]}>
            <View style={styles.page}>
                {/* Decorative Corners */}
                <View style={styles.cornerTL} />
                <View style={styles.cornerBR} />

                {/* FRONT CARD - TOP HALF */}
                <View style={styles.frontSection}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.brandText}>EASY VOTER</Text>
                        <Text style={styles.subText}>FEDERAL REPUBLIC OF NIGERIA</Text>
                    </View>

                    {/* Photo + Details */}
                    <View style={styles.contentRow}>
                        <View style={styles.photoBox}>
                            {data.passportPhotoUrl ? (
                                <Image src={data.passportPhotoUrl} style={styles.photoImage} />
                            ) : (
                                <View style={styles.photoPlaceholder}>
                                    <Text style={{ fontSize: 4, color: "#94a3b8" }}>PHOTO</Text>
                                </View>
                            )}
                        </View>

                        <View style={styles.detailsCol}>
                            <View style={styles.fieldGroup}>
                                <Text style={styles.label}>SURNAME</Text>
                                <Text style={styles.valueLarge}>{data.surname.toUpperCase()}</Text>
                            </View>

                            <View style={styles.fieldGroup}>
                                <Text style={styles.label}>GIVEN NAMES</Text>
                                <Text style={styles.value}>
                                    {`${data.firstName} ${data.middleName || ""}`.trim().toUpperCase()}
                                </Text>
                            </View>

                            <View style={{ flexDirection: "row", gap: 8 }}>
                                <View style={styles.fieldGroup}>
                                    <Text style={styles.label}>DOB</Text>
                                    <Text style={styles.value}>{formatDate(data.dateOfBirth)}</Text>
                                </View>
                                <View style={styles.fieldGroup}>
                                    <Text style={styles.label}>GENDER</Text>
                                    <Text style={styles.valueGold}>{data.gender.toUpperCase()}</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* VIN */}
                    <View style={styles.vinStrip}>
                        <Text style={styles.vinLabel}>VIN</Text>
                        <Text style={styles.vinValue}>{data.vin}</Text>
                    </View>

                    {/* Address */}
                    <View style={styles.addressRow}>
                        <View style={styles.addressItem}>
                            <Text style={styles.addressLabel}>STATE</Text>
                            <Text style={styles.addressValue}>{data.state.toUpperCase()}</Text>
                        </View>
                        <View style={styles.addressItem}>
                            <Text style={styles.addressLabel}>LGA</Text>
                            <Text style={styles.addressValue}>{data.lga.toUpperCase()}</Text>
                        </View>
                        <View style={styles.addressItem}>
                            <Text style={styles.addressLabel}>WARD</Text>
                            <Text style={styles.addressValue}>{data.ward.toUpperCase()}</Text>
                        </View>
                    </View>
                </View>

                {/* BACK CARD - BOTTOM HALF */}
                <View style={styles.backSection}>
                    <Text style={styles.backHeader}>VERIFICATION</Text>

                    {/* QR + Barcode */}
                    <View style={styles.codesRow}>
                        <View style={styles.qrBox}>
                            <Image src={qrCodeDataUrl} style={styles.qrImage} />
                        </View>

                        <View style={styles.barcodeBox}>
                            <Text style={styles.barcodeBars}>||| |||| |||</Text>
                            <Text style={styles.barcodeText}>{data.vin.slice(0, 12)}</Text>
                        </View>
                    </View>

                    {/* Info Grid */}
                    <View style={styles.infoGrid}>
                        <View style={styles.infoRow}>
                            <View style={styles.infoCol}>
                                <Text style={styles.infoLabel}>POLLING UNIT</Text>
                                <Text style={styles.infoValue}>024/12/05/008</Text>
                            </View>
                            <View style={styles.infoCol}>
                                <Text style={styles.infoLabel}>STATION</Text>
                                <Text style={styles.infoValue}>UNIT 001</Text>
                            </View>
                        </View>
                        <View style={styles.infoRow}>
                            <View style={styles.infoCol}>
                                <Text style={styles.infoLabel}>NATIONALITY</Text>
                                <Text style={styles.infoValue}>NIGERIAN</Text>
                            </View>
                            <View style={styles.infoCol}>
                                <Text style={styles.infoLabel}>OCCUPATION</Text>
                                <Text style={styles.infoValue}>CIVILIAN</Text>
                            </View>
                        </View>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <View style={styles.footerRow}>
                            <Text style={styles.footerText}>INEC</Text>
                            <Text style={styles.footerText}>REF: {data.applicationRef}</Text>
                        </View>
                        <View style={styles.footerRow}>
                            <Text style={styles.footerText}>ISSUED: {formatDate(data.issueDate)}</Text>
                        </View>
                        <Text style={styles.warningText}>OFFICIAL DOCUMENT</Text>
                    </View>
                </View>
            </View>
        </Page>
    </Document>
)

function formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, "0")
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]
    const month = months[date.getMonth()]
    const year = date.getFullYear()
    return `${day} ${month} ${year}`
}

/**
 * Generate voter card PDF - Single portrait page (2.2" × 3.4")
 * Uses NEXT_PUBLIC_APP_URL for QR code (update .env when hosting)
 */
export async function generateVoterCard(data: VoterCardData, applicationId: string): Promise<string> {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    console.log("🎫 GENERATING FRESH VOTER CARD PDF")
    console.log("   Application ID:", applicationId)
    console.log("   Name:", `${data.firstName} ${data.surname}`)
    console.log("   Format: Portrait 2.2\" × 3.4\" (158.4pt × 244.8pt)")
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

    try {
        // Generate QR Code with production URL from env
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        console.log("📱 QR Code base URL:", baseUrl)

        const verificationUrl = `${baseUrl}/verify/${data.vin}`
        const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
            errorCorrectionLevel: "H",
            width: 200,
            margin: 0,
            color: { dark: "#000000", light: "#ffffff" },
        })
        console.log("✅ QR code generated")

        // Create PDF
        console.log("📄 Creating PDF...")
        const pdfBuffer = await renderToBuffer(
            React.createElement(VoterCardDocument, { data, qrCodeDataUrl }) as any
        )
        console.log("✅ PDF created, size:", pdfBuffer.length, "bytes")

        // Upload to Blob with timestamp to ensure uniqueness
        const filename = `voter-cards/${applicationId}-${Date.now()}.pdf`
        console.log("☁️ Uploading to Blob:", filename)

        const blob = await put(filename, pdfBuffer, {
            access: "public",
            contentType: "application/pdf",
        })

        console.log("✅ Upload complete!")
        console.log("   New URL:", blob.url)
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        console.log("✅ FRESH VOTER CARD GENERATED SUCCESSFULLY")
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
