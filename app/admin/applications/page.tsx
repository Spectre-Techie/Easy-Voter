import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, FileText } from "lucide-react"

type SearchParams = {
    status?: string
    search?: string
    page?: string
}

export default async function ApplicationsPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>
}) {
    // Await searchParams in Next.js 15
    const params = await searchParams
    const status = params.status || "ALL"
    const search = params.search || ""
    const page = parseInt(params.page || "1")
    const limit = 20

    // Build where clause
    const where: any = {}

    if (status !== "ALL") {
        where.status = status
    }

    if (search) {
        where.OR = [
            { surname: { contains: search, mode: "insensitive" } },
            { firstName: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { applicationRef: { contains: search, mode: "insensitive" } },
        ]
    }

    // Fetch applications with pagination
    const [applications, total] = await Promise.all([
        db.voterApplication.findMany({
            where,
            include: {
                user: {
                    select: {
                        email: true,
                    },
                },
            },
            orderBy: { submittedAt: "desc" },
            skip: (page - 1) * limit,
            take: limit,
        }),
        db.voterApplication.count({ where }),
    ])

    const totalPages = Math.ceil(total / limit)

    const statusOptions = [
        { value: "ALL", label: "All", count: total },
        { value: "PENDING", label: "Pending" },
        { value: "APPROVED", label: "Approved" },
        { value: "REJECTED", label: "Rejected" },
    ]

    return (
        <div className="min-h-screen pb-8">
            {/* Mobile-First Header */}
            <div className="mb-6 space-y-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Applications</h1>
                <p className="text-sm sm:text-base text-gray-600">
                    Manage voter registration applications
                </p>
            </div>

            {/* Filters Card */}
            <Card className="mb-6">
                <CardContent className="p-4 sm:p-6 space-y-4">
                    {/* Search */}
                    <form action="/admin/applications" method="GET" className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                        <input
                            type="text"
                            name="search"
                            placeholder="Search by name, email, or ref..."
                            defaultValue={search}
                            className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                        <input type="hidden" name="status" value={status} />
                    </form>

                    {/* Status Filter Buttons */}
                    <div className="flex flex-wrap gap-2">
                        {statusOptions.map((option) => (
                            <Link
                                key={option.value}
                                href={`/admin/applications?status=${option.value}${search ? `&search=${search}` : ""}`}
                                className="flex-1 sm:flex-none min-w-[calc(50%-0.25rem)] sm:min-w-0"
                            >
                                <Button
                                    variant={status === option.value ? "default" : "outline"}
                                    size="sm"
                                    className="w-full sm:w-auto text-xs sm:text-sm"
                                >
                                    <Filter className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5" />
                                    {option.label}
                                </Button>
                            </Link>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Applications List */}
            <Card>
                <CardHeader className="border-b bg-gray-50">
                    <CardTitle className="text-lg sm:text-xl flex items-center justify-between">
                        <span>
                            {total} {total === 1 ? "Application" : "Applications"}
                        </span>
                        {status !== "ALL" && (
                            <Badge variant="secondary" className="text-xs sm:text-sm">
                                {status}
                            </Badge>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {applications.length === 0 ? (
                        <div className="text-center py-12 sm:py-16">
                            <FileText className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-300 mb-4" />
                            <p className="text-sm sm:text-base text-gray-500">
                                {search ? "No applications match your search" : "No applications found"}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {applications.map((application) => (
                                <div
                                    key={application.id}
                                    className="p-4 sm:p-6 hover:bg-gray-50 transition-colors"
                                >
                                    {/* Mobile Layout */}
                                    <div className="space-y-4 sm:hidden">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-gray-900 truncate">
                                                    {application.surname} {application.firstName}
                                                </h3>
                                                <p className="text-sm text-gray-600 truncate">
                                                    {application.user.email}
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
                                                className="shrink-0"
                                            >
                                                {application.status}
                                            </Badge>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <p className="text-gray-500">Ref</p>
                                                <p className="font-medium text-gray-900 truncate">
                                                    {application.applicationRef}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">Location</p>
                                                <p className="font-medium text-gray-900 truncate">
                                                    {application.lga}
                                                </p>
                                            </div>
                                        </div>
                                        <Link href={`/admin/applications/${application.id}`} className="block">
                                            <Button size="sm" className="w-full">
                                                Review Application
                                            </Button>
                                        </Link>
                                    </div>

                                    {/* Desktop Layout */}
                                    <div className="hidden sm:flex items-center justify-between gap-6">
                                        <div className="flex-1 grid grid-cols-4 gap-4">
                                            <div>
                                                <h3 className="font-semibold text-gray-900">
                                                    {application.surname} {application.firstName}
                                                </h3>
                                                <p className="text-sm text-gray-600">{application.user.email}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Application Ref</p>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {application.applicationRef}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Location</p>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {application.lga}, {application.state}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Submitted</p>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {application.submittedAt
                                                        ? new Date(application.submittedAt).toLocaleDateString()
                                                        : "N/A"}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0">
                                            <Badge
                                                variant={
                                                    application.status === "APPROVED"
                                                        ? "default"
                                                        : application.status === "PENDING"
                                                            ? "secondary"
                                                            : "destructive"
                                                }
                                            >
                                                {application.status}
                                            </Badge>
                                            <Link href={`/admin/applications/${application.id}`}>
                                                <Button size="sm">Review</Button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 p-4 sm:p-6 border-t bg-gray-50">
                            <div className="flex items-center gap-2">
                                {page > 1 && (
                                    <Link
                                        href={`/admin/applications?status=${status}&search=${search}&page=${page - 1}`}
                                    >
                                        <Button variant="outline" size="sm">
                                            Previous
                                        </Button>
                                    </Link>
                                )}
                                <span className="px-3 py-1.5 text-sm text-gray-600 bg-white border rounded-md">
                                    Page {page} of {totalPages}
                                </span>
                                {page < totalPages && (
                                    <Link
                                        href={`/admin/applications?status=${status}&search=${search}&page=${page + 1}`}
                                    >
                                        <Button variant="outline" size="sm">
                                            Next
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
