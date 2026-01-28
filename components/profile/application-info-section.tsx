"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Download, Calendar, CheckCircle, XCircle, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

interface ApplicationInfoSectionProps {
    application: {
        id: string
        applicationRef: string
        status: string
        submittedAt: Date | null
        reviewedAt: Date | null
        voterCardPdfUrl: string | null
        firstName: string
        surname: string
    }
}

export function ApplicationInfoSection({ application }: ApplicationInfoSectionProps) {
    const getStatusBadge = () => {
        switch (application.status) {
            case "APPROVED":
                return (
                    <Badge className="bg-green-600 hover:bg-green-700">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Approved
                    </Badge>
                )
            case "REJECTED":
                return (
                    <Badge className="bg-red-600 hover:bg-red-700">
                        <XCircle className="w-3 h-3 mr-1" />
                        Rejected
                    </Badge>
                )
            case "PENDING":
            case "UNDER_REVIEW":
                return (
                    <Badge className="bg-yellow-600 hover:bg-yellow-700">
                        <Clock className="w-3 h-3 mr-1" />
                        {application.status === "PENDING" ? "Pending" : "Under Review"}
                    </Badge>
                )
            default:
                return (
                    <Badge variant="secondary">
                        <FileText className="w-3 h-3 mr-1" />
                        Draft
                    </Badge>
                )
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Application Information</CardTitle>
                <CardDescription>Your voter registration application details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Application Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Application Reference</p>
                        <p className="font-mono font-semibold">{application.applicationRef}</p>
                    </div>

                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Status</p>
                        <div>{getStatusBadge()}</div>
                    </div>

                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Applicant Name</p>
                        <p className="font-semibold">{application.firstName} {application.surname}</p>
                    </div>

                    {application.submittedAt && (
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Submitted</p>
                            <p className="text-sm flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDistanceToNow(new Date(application.submittedAt), { addSuffix: true })}
                            </p>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="border-t pt-4 flex flex-col sm:flex-row gap-3">
                    <Link href="/dashboard" className="flex-1">
                        <Button variant="outline" className="w-full">
                            <FileText className="w-4 h-4 mr-2" />
                            View Full Application
                        </Button>
                    </Link>

                    {application.status === "APPROVED" && application.voterCardPdfUrl && (
                        <Link href={`/api/voter-card/${application.id}`} className="flex-1">
                            <Button className="w-full">
                                <Download className="w-4 h-4 mr-2" />
                                Download Voter Card
                            </Button>
                        </Link>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
