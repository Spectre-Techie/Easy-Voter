"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, XCircle, Loader2, QrCode, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface VerificationResult {
    valid: boolean
    voter?: {
        name: string
        vin: string
        cardId?: string
        state: string
        lga: string
        status: string
        verifiedAt: string
    }
    message?: string
}

export default function VerifyVinPage() {
    const params = useParams()
    const vin = params.vin as string
    const [loading, setLoading] = useState(true)
    const [result, setResult] = useState<VerificationResult | null>(null)

    useEffect(() => {
        if (!vin) return

        const verifyVin = async () => {
            try {
                const response = await fetch(`/api/verify/${vin}`)
                const data = await response.json()
                setResult(data)
            } catch (error) {
                setResult({
                    valid: false,
                    message: "Failed to verify voter card. Please try again.",
                })
            } finally {
                setLoading(false)
            }
        }

        verifyVin()
    }, [vin])

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* Header */}
            <header className="border-b bg-white/80 backdrop-blur-md shadow-sm">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-lg">EV</span>
                        </div>
                        <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            EasyVoter
                        </span>
                    </div>
                    <Link href="/verify">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                    </Link>
                </div>
            </header>

            <div className="container mx-auto px-4 py-12">
                <div className="max-w-2xl mx-auto space-y-8">
                    {/* Title */}
                    <div className="text-center space-y-2">
                        <div className="flex justify-center mb-4">
                            <div className="rounded-full bg-blue-100 p-4">
                                <QrCode className="h-8 w-8 text-blue-600" />
                            </div>
                        </div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                            Voter Card Verification
                        </h1>
                        <p className="text-muted-foreground text-lg">
                            Verifying VIN: <span className="font-mono font-semibold">{vin}</span>
                        </p>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                                    <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                                    <p className="text-muted-foreground">Verifying voter card...</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Results */}
                    {!loading && result && (
                        <Card className={result.valid ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                            <CardContent className="pt-6">
                                {result.valid && result.voter ? (
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-full bg-green-100 p-3">
                                                <CheckCircle2 className="h-8 w-8 text-green-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-green-900 text-xl">
                                                    Valid Voter Card ✓
                                                </h3>
                                                <p className="text-sm text-green-700">
                                                    This voter card is authentic and active
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-green-200">
                                            <div className="bg-white/50 p-4 rounded-lg">
                                                <p className="text-sm text-green-700 mb-1">Full Name</p>
                                                <p className="font-medium text-green-900 text-lg">{result.voter.name}</p>
                                            </div>
                                            <div className="bg-white/50 p-4 rounded-lg">
                                                <p className="text-sm text-green-700 mb-1">VIN</p>
                                                <p className="font-mono text-sm font-medium text-green-900">
                                                    {result.voter.vin}
                                                </p>
                                            </div>
                                            <div className="bg-white/50 p-4 rounded-lg">
                                                <p className="text-sm text-green-700 mb-1">State</p>
                                                <p className="font-medium text-green-900">{result.voter.state}</p>
                                            </div>
                                            <div className="bg-white/50 p-4 rounded-lg">
                                                <p className="text-sm text-green-700 mb-1">LGA</p>
                                                <p className="font-medium text-green-900">{result.voter.lga}</p>
                                            </div>
                                            <div className="bg-white/50 p-4 rounded-lg">
                                                <p className="text-sm text-green-700 mb-1">Status</p>
                                                <p className="font-medium text-green-900">{result.voter.status}</p>
                                            </div>
                                            {result.voter.cardId && (
                                                <div className="bg-white/50 p-4 rounded-lg">
                                                    <p className="text-sm text-green-700 mb-1">Card ID</p>
                                                    <p className="font-medium text-green-900">{result.voter.cardId}</p>
                                                </div>
                                            )}
                                            <div className="col-span-full bg-white/50 p-4 rounded-lg">
                                                <p className="text-sm text-green-700 mb-1">Verified At</p>
                                                <p className="text-sm text-green-700">
                                                    {new Date(result.voter.verifiedAt).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-full bg-red-100 p-3">
                                                <XCircle className="h-8 w-8 text-red-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-red-900 text-xl">Invalid Voter Card</h3>
                                                <p className="text-sm text-red-700">
                                                    {result.message || "This voter card could not be verified"}
                                                </p>
                                            </div>
                                        </div>

                                        <Alert className="border-amber-200 bg-amber-50">
                                            <AlertDescription className="text-amber-800">
                                                <strong>Possible reasons:</strong>
                                                <ul className="list-disc list-inside mt-2 space-y-1">
                                                    <li>The VIN is incorrect or invalid</li>
                                                    <li>The voter card has not been approved yet</li>
                                                    <li>The voter card has been revoked</li>
                                                </ul>
                                            </AlertDescription>
                                        </Alert>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Information */}
                    <Alert>
                        <AlertDescription>
                            <strong>Note:</strong> This verification system checks the authenticity of digital voter
                            cards issued by EasyVoter. For official INEC verification, please visit the INEC website.
                        </AlertDescription>
                    </Alert>

                    {/* Actions */}
                    <div className="flex justify-center">
                        <Link href="/verify">
                            <Button variant="outline" size="lg">
                                Verify Another Card
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
