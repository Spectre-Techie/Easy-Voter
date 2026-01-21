import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ExternalLink } from "lucide-react"
import { ReviewForm } from "@/components/admin/review-form"
import Image from "next/image"

export default async function ApplicationDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    // Await params in Next.js 15
    const { id } = await params

    // Validate ID exists
    if (!id) {
        notFound()
    }

    const application = await db.voterApplication.findUnique({
        where: { id },
        include: {
            user: {
                select: {
                    email: true,
                },
            },
        },
    })

    if (!application) {
        notFound()
    }

    const sections = [
        {
            title: "Personal Information",
            fields: [
                { label: "Surname", value: application.surname },
                { label: "First Name", value: application.firstName },
                { label: "Middle Name", value: application.middleName || "N/A" },
                { label: "Date of Birth", value: new Date(application.dateOfBirth).toLocaleDateString() },
                { label: "Gender", value: application.gender },
                { label: "Phone Number", value: application.phoneNumber },
                { label: "Email", value: application.email },
                { label: "Occupation", value: application.occupation },
                { label: "NIN", value: application.nin || "Not provided" },
            ],
        },
        {
            title: "Address Information",
            fields: [
                { label: "State", value: application.state },
                { label: "LGA", value: application.lga },
                { label: "Ward", value: application.ward },
                { label: "Polling Unit", value: application.pollingUnit || "Not specified" },
                { label: "Street Address", value: application.streetAddress },
                { label: "Landmark", value: application.landmark || "N/A" },
            ],
        },
        {
            title: "Additional Information",
            fields: [
                { label: "Disability", value: application.disability || "None" },
                { label: "Preferred Language", value: application.preferredLanguage || "English" },
                { label: "Previous Voter Card", value: application.previousVoterCard || "N/A" },
            ],
        },
    ]

    const documents = [
        { label: "ID Photo", url: application.idPhotoUrl },
        { label: "Passport Photo", url: application.passportPhotoUrl },
        { label: "Proof of Address", url: application.proofOfAddressUrl },
    ].filter((doc) => doc.url)

    return (
        <div className="min-h-screen pb-8">
            {/* Mobile-First Header */}
            <div className="mb-6 space-y-4">
                {/* Back Button */}
                <Link href="/admin/applications">
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Applications
                    </Button>
                </Link>

                {/* Title and Status */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                            {application.surname} {application.firstName}
                        </h1>
                        <p className="text-sm sm:text-base text-gray-600">
                            Ref: {application.applicationRef}
                        </p>
                    </div>
                    <Badge
                        variant={
                            application.status === "APPROVED"
                                ? "default"
                                : application.status === "PENDING"
                                    ? "secondary"
                                    : "destructive"
                        }
                        className="text-sm sm:text-base px-3 py-1.5 sm:px-4 sm:py-2 w-fit"
                    >
                        {application.status}
                    </Badge>
                </div>
            </div>

            {/* Mobile-First Grid Layout */}
            <div className="space-y-6 lg:grid lg:grid-cols-3 lg:gap-6 lg:space-y-0">
                {/* Main Content - Full width on mobile, 2/3 on desktop */}
                <div className="space-y-6 lg:col-span-2">
                    {/* Information Sections */}
                    {sections.map((section) => (
                        <Card key={section.title} className="overflow-hidden">
                            <CardHeader className="bg-gray-50 border-b">
                                <CardTitle className="text-lg sm:text-xl">{section.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 sm:p-6">
                                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                    {section.fields.map((field) => (
                                        <div key={field.label} className="space-y-1">
                                            <dt className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">
                                                {field.label}
                                            </dt>
                                            <dd className="text-sm sm:text-base text-gray-900 font-medium break-words">
                                                {field.value}
                                            </dd>
                                        </div>
                                    ))}
                                </dl>
                            </CardContent>
                        </Card>
                    ))}

                    {/* Documents Section */}
                    <Card className="overflow-hidden">
                        <CardHeader className="bg-gray-50 border-b">
                            <CardTitle className="text-lg sm:text-xl">Uploaded Documents</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6">
                            {documents.length === 0 ? (
                                <p className="text-center text-gray-500 py-8">No documents uploaded</p>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                    {documents.map((doc) => (
                                        <div key={doc.label} className="space-y-3">
                                            <p className="text-sm font-semibold text-gray-700">{doc.label}</p>
                                            {doc.url ? (
                                                <>
                                                    <div className="relative aspect-square border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50 hover:border-green-500 transition-colors">
                                                        <Image
                                                            src={doc.url}
                                                            alt={doc.label}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                    <a
                                                        href={doc.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1.5 text-sm text-green-600 hover:text-green-700 hover:underline font-medium"
                                                    >
                                                        View Full Size
                                                        <ExternalLink className="w-3.5 h-3.5" />
                                                    </a>
                                                </>
                                            ) : (
                                                <div className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                                                    <p className="text-sm text-gray-500">Not provided</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Review Form - Full width on mobile, 1/3 on desktop */}
                <div className="lg:col-span-1">
                    <div className="lg:sticky lg:top-6">
                        <ReviewForm
                            applicationId={application.id}
                            currentStatus={application.status}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
