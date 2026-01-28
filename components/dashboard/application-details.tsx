"use client"

import { VoterApplication } from "@prisma/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { ChevronDown, ChevronUp, User, Mail, Phone, MapPin, Calendar, FileText } from "lucide-react"
import Image from "next/image"

interface ApplicationDetailsProps {
    application: VoterApplication
}

export function ApplicationDetails({ application }: ApplicationDetailsProps) {
    const [isExpanded, setIsExpanded] = useState(false)

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Application Details</CardTitle>
                        <CardDescription>
                            Reference: {application.applicationRef}
                        </CardDescription>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        {isExpanded ? (
                            <>
                                <ChevronUp className="h-4 w-4 mr-2" />
                                Hide Details
                            </>
                        ) : (
                            <>
                                <ChevronDown className="h-4 w-4 mr-2" />
                                View Details
                            </>
                        )}
                    </Button>
                </div>
            </CardHeader>

            {isExpanded && (
                <CardContent className="space-y-6">
                    {/* Personal Information */}
                    <div>
                        <h3 className="font-semibold text-sm text-muted-foreground mb-3 flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Personal Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Full Name</p>
                                <p className="font-medium">
                                    {application.firstName} {application.middleName} {application.surname}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Date of Birth</p>
                                <p className="font-medium">
                                    {new Date(application.dateOfBirth).toLocaleDateString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Gender</p>
                                <p className="font-medium">{application.gender}</p>
                            </div>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="border-t pt-6">
                        <h3 className="font-semibold text-sm text-muted-foreground mb-3 flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            Contact Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Email</p>
                                <p className="font-medium">{application.email}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Phone Number</p>
                                <p className="font-medium">{application.phoneNumber}</p>
                            </div>
                        </div>
                    </div>

                    {/* Address Information */}
                    <div className="border-t pt-6">
                        <h3 className="font-semibold text-sm text-muted-foreground mb-3 flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Address Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">State</p>
                                <p className="font-medium">{application.state}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">LGA</p>
                                <p className="font-medium">{application.lga}</p>
                            </div>
                            <div className="md:col-span-2">
                                <p className="text-sm text-muted-foreground">Street Address</p>
                                <p className="font-medium">{application.streetAddress}</p>
                            </div>
                        </div>
                    </div>

                    {/* Documents */}
                    <div className="border-t pt-6">
                        <h3 className="font-semibold text-sm text-muted-foreground mb-3 flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Uploaded Documents
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {application.passportPhotoUrl && (
                                <div>
                                    <p className="text-sm text-muted-foreground mb-2">Passport Photo</p>
                                    <div className="relative h-40 w-32 rounded-lg overflow-hidden border">
                                        <Image
                                            src={application.passportPhotoUrl}
                                            alt="Passport"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                </div>
                            )}
                            {application.idPhotoUrl && (
                                <div>
                                    <p className="text-sm text-muted-foreground mb-2">ID Document</p>
                                    <a
                                        href={application.idPhotoUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline text-sm"
                                    >
                                        View Document →
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="border-t pt-6">
                        <h3 className="font-semibold text-sm text-muted-foreground mb-3 flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Timeline
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Created</span>
                                <span className="font-medium">
                                    {new Date(application.createdAt).toLocaleString()}
                                </span>
                            </div>
                            {application.submittedAt && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Submitted</span>
                                    <span className="font-medium">
                                        {new Date(application.submittedAt).toLocaleString()}
                                    </span>
                                </div>
                            )}
                            {application.reviewedAt && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Reviewed</span>
                                    <span className="font-medium">
                                        {new Date(application.reviewedAt).toLocaleString()}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            )}
        </Card>
    )
}
