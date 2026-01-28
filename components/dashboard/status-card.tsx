"use client"

import { VoterApplication } from "@prisma/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import {
    FileText,
    Download,
    AlertCircle,
    CheckCircle2,
    Clock,
    RefreshCw,
    Calendar,
    Mail,
} from "lucide-react"

interface StatusCardProps {
    application: VoterApplication
}

export function StatusCard({ application }: StatusCardProps) {
    const status = application.status

    // PENDING Status
    if (status === "PENDING") {
        return (
            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-blue-100 p-3">
                                <Clock className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <CardTitle className="text-blue-900">Under Review</CardTitle>
                                <CardDescription>Your application is being processed</CardDescription>
                            </div>
                        </div>
                        <Badge className="bg-blue-600">Pending</Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Alert className="border-blue-200 bg-blue-50">
                        <AlertCircle className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-blue-900">
                            <strong>What's happening?</strong> Our team is carefully reviewing your documents
                            and information. This typically takes 2-3 business days.
                        </AlertDescription>
                    </Alert>

                    <div className="grid gap-3 pt-2">
                        <div className="flex items-center gap-3 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">
                                Submitted on{" "}
                                {application.submittedAt
                                    ? new Date(application.submittedAt).toLocaleDateString()
                                    : "N/A"}
                            </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">
                                You'll receive an email notification once reviewed
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    // APPROVED Status
    if (status === "APPROVED") {
        return (
            <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-green-100 p-3">
                                <CheckCircle2 className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <CardTitle className="text-green-900">Congratulations! 🎉</CardTitle>
                                <CardDescription>Your application has been approved</CardDescription>
                            </div>
                        </div>
                        <Badge className="bg-green-600">Approved</Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Alert className="border-green-200 bg-green-50">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-900">
                            <strong>You're all set!</strong> Your voter registration is complete. Download your
                            digital voter card below.
                        </AlertDescription>
                    </Alert>

                    {application.voterCardPdfUrl ? (
                        <Link href={`/api/voter-card/${application.id}`} target="_blank">
                            <Button className="w-full bg-green-600 hover:bg-green-700" size="lg">
                                <Download className="mr-2 h-5 w-5" />
                                Download Voter Card
                            </Button>
                        </Link>
                    ) : (
                        <Link href={`/api/voter-card/${application.id}`} target="_blank">
                            <Button className="w-full bg-green-600 hover:bg-green-700" size="lg">
                                <Download className="mr-2 h-5 w-5" />
                                Generate & Download Voter Card
                            </Button>
                        </Link>
                    )}

                    <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
                        <h4 className="font-semibold text-blue-900 mb-2">Next Steps:</h4>
                        <ul className="space-y-2 text-sm text-blue-800">
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 mt-0.5">•</span>
                                <span>Keep your voter card safe for election day</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 mt-0.5">•</span>
                                <span>Bring a valid ID along with your voter card</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 mt-0.5">•</span>
                                <span>Check your polling location before election day</span>
                            </li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
        )
    }

    // REJECTED Status
    if (status === "REJECTED") {
        return (
            <Card className="border-red-200 bg-gradient-to-br from-red-50 to-white">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-red-100 p-3">
                                <AlertCircle className="h-6 w-6 text-red-600" />
                            </div>
                            <div>
                                <CardTitle className="text-red-900">Application Not Approved</CardTitle>
                                <CardDescription>Please review the feedback below</CardDescription>
                            </div>
                        </div>
                        <Badge variant="destructive">Rejected</Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {application.reviewNotes && (
                        <Alert variant="destructive" className="border-red-200">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                <strong>Reason for rejection:</strong>
                                <p className="mt-2">{application.reviewNotes}</p>
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="rounded-lg bg-amber-50 p-4 border border-amber-200">
                        <h4 className="font-semibold text-amber-900 mb-2">What to do next:</h4>
                        <ul className="space-y-2 text-sm text-amber-800">
                            <li className="flex items-start gap-2">
                                <span className="text-amber-600 mt-0.5">•</span>
                                <span>Review the rejection reason carefully</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-amber-600 mt-0.5">•</span>
                                <span>Correct any issues with your documents or information</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-amber-600 mt-0.5">•</span>
                                <span>Submit a new application with the corrected details</span>
                            </li>
                        </ul>
                    </div>

                    <Link href="/apply">
                        <Button className="w-full bg-red-600 hover:bg-red-700" size="lg">
                            <RefreshCw className="mr-2 h-5 w-5" />
                            Submit New Application
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        )
    }

    // Default/DRAFT Status
    return null
}
