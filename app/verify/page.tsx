"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, XCircle, Loader2, Search, QrCode } from "lucide-react"

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

export default function VerifyPage() {
    const [vin, setVin] = useState("")
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<VerificationResult | null>(null)

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!vin.trim()) {
            return
        }

        setLoading(true)
        setResult(null)

        try {
            const response = await fetch(`/api/verify/${vin.trim()}`)
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* Header */}
            <header className="border-b bg-white/80 backdrop-blur-md shadow-sm">
                <div className="container mx-auto px-4 h-16 flex items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-lg">EV</span>
                        </div>
                        <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            EasyVoter
                        </span>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-12">
                <div className="max-w-2xl mx-auto space-y-8">
                    {/* Title */}
                    <div className="text-center space-y-2">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                            Verify Voter Card
                        </h1>
                        <p className="text-muted-foreground text-lg">
                            Check the authenticity of a digital voter card
                        </p>
                    </div>

                    {/* Verification Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <QrCode className="h-5 w-5" />
                                Enter Voter Identification Number (VIN)
                            </CardTitle>
                            <CardDescription>
                                Scan the QR code on the voter card or manually enter the VIN
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleVerify} className="space-y-4">
                                <div className="flex gap-2">
                                    <Input
                                        type="text"
                                        placeholder="Enter VIN (e.g., cmk...)"
                                        value={vin}
                                        onChange={(e) => setVin(e.target.value)}
                                        className="flex-1"
                                        disabled={loading}
                                    />
                                    <Button type="submit" disabled={loading || !vin.trim()}>
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Verifying...
                                            </>
                                        ) : (
                                            <>
                                                <Search className="w-4 h-4 mr-2" />
                                                Verify
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Results */}
                    {result && (
                        <Card className={result.valid ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                            <CardContent className="pt-6">
                                {result.valid && result.voter ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-full bg-green-100 p-3">
                                                <CheckCircle2 className="h-6 w-6 text-green-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-green-900 text-lg">
                                                    Valid Voter Card ✓
                                                </h3>
                                                <p className="text-sm text-green-700">
                                                    This voter card is authentic and active
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-green-200">
                                            <div>
                                                <p className="text-sm text-green-700">Name</p>
                                                <p className="font-medium text-green-900">{result.voter.name}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-green-700">VIN</p>
                                                <p className="font-mono text-xs font-medium text-green-900">
                                                    {result.voter.vin}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-green-700">State</p>
                                                <p className="font-medium text-green-900">{result.voter.state}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-green-700">LGA</p>
                                                <p className="font-medium text-green-900">{result.voter.lga}</p>
                                            </div>
                                            {result.voter.cardId && (
                                                <div className="col-span-2">
                                                    <p className="text-sm text-green-700">Card ID</p>
                                                    <p className="font-medium text-green-900">{result.voter.cardId}</p>
                                                </div>
                                            )}
                                            <div className="col-span-2">
                                                <p className="text-sm text-green-700">Verified At</p>
                                                <p className="text-xs text-green-700">
                                                    {new Date(result.voter.verifiedAt).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-full bg-red-100 p-3">
                                            <XCircle className="h-6 w-6 text-red-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-red-900 text-lg">Invalid Voter Card</h3>
                                            <p className="text-sm text-red-700">
                                                {result.message || "This voter card could not be verified"}
                                            </p>
                                        </div>
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
                </div>
            </div>
        </div>
    )
}
