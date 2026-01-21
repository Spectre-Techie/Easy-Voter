import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Filter } from "lucide-react"

type SearchParams = {
    status?: string
    search?: string
    page?: string
}

export default async function ApplicationsPage({
    searchParams,
}: {
    searchParams: SearchParams
}) {
    const status = searchParams.status || "ALL"
    const search = searchParams.search || ""
    const page = parseInt(searchParams.page || "1")
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
        { value: "ALL", label: "All Applications" },
        { value: "PENDING", label: "Pending" },
        { value: "APPROVED", label: "Approved" },
        { value: "REJECTED", label: "Rejected" },
    ]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Applications</h1>
                <p className="text-gray-600 mt-2">Manage voter registration applications</p>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1">
                            <form action="/admin/applications" method="GET" className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    name="search"
                                    placeholder="Search by name, email, or ref..."
                                    defaultValue={search}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                                <input type="hidden" name="status" value={status} />
                            </form>
                        </div>

                        {/* Status Filter */}
                        <div className="flex gap-2">
                            {statusOptions.map((option) => (
                                <Link
                                    key={option.value}
                                    href={`/admin/applications?status=${option.value}${search ? `&search=${search}` : ""}`}
                                >
                                    <Button
                                        variant={status === option.value ? "default" : "outline"}
                                        size="sm"
                                    >
                                        {option.label}
                                    </Button>
                                </Link>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Applications List */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        {total} {total === 1 ? "Application" : "Applications"}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {applications.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">No applications found</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {applications.map((application) => (
                                <div
                                    key={application.id}
                                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div>
                                            <h3 className="font-medium text-gray-900">
                                                {application.surname} {application.firstName}
                                            </h3>
                                            <p className="text-sm text-gray-600">{application.user.email}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Application Ref</p>
                                            <p className="text-sm font-medium text-gray-900">
                                                {application.applicationRef}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Location</p>
                                            <p className="text-sm font-medium text-gray-900">
                                                {application.lga}, {application.state}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Submitted</p>
                                            <p className="text-sm font-medium text-gray-900">
                                                {application.submittedAt
                                                    ? new Date(application.submittedAt).toLocaleDateString()
                                                    : "N/A"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
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
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center gap-2 mt-6">
                            {page > 1 && (
                                <Link
                                    href={`/admin/applications?status=${status}&search=${search}&page=${page - 1}`}
                                >
                                    <Button variant="outline" size="sm">
                                        Previous
                                    </Button>
                                </Link>
                            )}
                            <span className="px-4 py-2 text-sm text-gray-600">
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
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
