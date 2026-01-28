import { auth, isAdmin } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Users, Shield, UserCheck, Calendar } from "lucide-react"

export const dynamic = 'force-dynamic'

type SearchParams = {
    role?: string
    search?: string
    page?: string
}

export default async function UsersPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>
}) {
    const session = await auth()

    if (!session?.user || !isAdmin(session)) {
        redirect("/login")
    }

    // Await searchParams in Next.js 15
    const params = await searchParams
    const roleFilter = params.role || "ALL"
    const search = params.search || ""
    const page = parseInt(params.page || "1")
    const limit = 20

    // Build where clause
    const where: any = {}

    if (roleFilter !== "ALL") {
        where.role = roleFilter
    }

    if (search) {
        where.email = { contains: search, mode: "insensitive" }
    }

    // Fetch users with pagination
    const [users, total, stats] = await Promise.all([
        db.user.findMany({
            where,
            include: {
                application: {
                    select: {
                        status: true,
                        applicationRef: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * limit,
            take: limit,
        }),
        db.user.count({ where }),
        db.user.groupBy({
            by: ["role"],
            _count: true,
        }),
    ])

    const totalPages = Math.ceil(total / limit)

    // Calculate stats
    const totalUsers = stats.reduce((sum, s) => sum + s._count, 0)
    const totalAdmins = stats.find(s => s.role === "ADMIN" || s.role === "SUPER_ADMIN")?._count || 0
    const totalVoters = stats.find(s => s.role === "VOTER")?._count || 0

    const roleOptions = [
        { value: "ALL", label: "All Users", icon: Users },
        { value: "VOTER", label: "Voters", icon: UserCheck },
        { value: "ADMIN", label: "Admins", icon: Shield },
        { value: "SUPER_ADMIN", label: "Super Admins", icon: Shield },
    ]

    const getRoleBadge = (role: string) => {
        const variants: Record<string, { variant: "default" | "destructive" | "secondary" | "outline", className: string }> = {
            VOTER: { variant: "secondary", className: "bg-blue-100 text-blue-700" },
            ADMIN: { variant: "default", className: "bg-purple-600 text-white" },
            SUPER_ADMIN: { variant: "destructive", className: "bg-red-600 text-white" },
        }
        return variants[role] || variants.VOTER
    }

    return (
        <div className="min-h-screen pb-8">
            {/* Header */}
            <div className="mb-6 space-y-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">User Management</h1>
                <p className="text-sm sm:text-base text-gray-600">
                    Manage user accounts and roles
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <Card>
                    <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Users</p>
                                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{totalUsers}</p>
                            </div>
                            <Users className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Voters</p>
                                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{totalVoters}</p>
                            </div>
                            <UserCheck className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Admins</p>
                                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{totalAdmins}</p>
                            </div>
                            <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters Card */}
            <Card className="mb-6">
                <CardContent className="p-4 sm:p-6 space-y-4">
                    {/* Search */}
                    <form action="/admin/users" method="GET" className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                        <input
                            type="text"
                            name="search"
                            placeholder="Search by email..."
                            defaultValue={search}
                            className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                        <input type="hidden" name="role" value={roleFilter} />
                    </form>

                    {/* Role Filter Buttons */}
                    <div className="flex flex-wrap gap-2">
                        {roleOptions.map((option) => {
                            const Icon = option.icon
                            return (
                                <Link
                                    key={option.value}
                                    href={`/admin/users?role=${option.value}${search ? `&search=${search}` : ""}`}
                                    className="flex-1 sm:flex-none min-w-[calc(50%-0.25rem)] sm:min-w-0"
                                >
                                    <Button
                                        variant={roleFilter === option.value ? "default" : "outline"}
                                        size="sm"
                                        className="w-full sm:w-auto text-xs sm:text-sm"
                                    >
                                        <Icon className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5" />
                                        {option.label}
                                    </Button>
                                </Link>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Users List */}
            <Card>
                <CardHeader className="border-b bg-gray-50">
                    <CardTitle className="text-lg sm:text-xl flex items-center justify-between">
                        <span>
                            {total} {total === 1 ? "User" : "Users"}
                        </span>
                        {roleFilter !== "ALL" && (
                            <Badge variant="secondary" className="text-xs sm:text-sm">
                                {roleFilter}
                            </Badge>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {users.length === 0 ? (
                        <div className="text-center py-12 sm:py-16">
                            <Users className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-300 mb-4" />
                            <p className="text-sm sm:text-base text-gray-500">
                                {search ? "No users match your search" : "No users found"}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {users.map((user) => {
                                const roleBadge = getRoleBadge(user.role)
                                return (
                                    <div
                                        key={user.id}
                                        className="p-4 sm:p-6 hover:bg-gray-50 transition-colors"
                                    >
                                        {/* Mobile Layout */}
                                        <div className="space-y-3 sm:hidden">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-gray-900 truncate">
                                                        {user.email}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Joined {new Date(user.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <Badge
                                                    variant={roleBadge.variant}
                                                    className={`${roleBadge.className} shrink-0 text-xs`}
                                                >
                                                    {user.role}
                                                </Badge>
                                            </div>
                                            {user.application && (
                                                <div className="flex items-center gap-2 text-xs">
                                                    <span className="text-gray-500">Application:</span>
                                                    <Badge
                                                        variant={
                                                            user.application.status === "APPROVED"
                                                                ? "default"
                                                                : user.application.status === "PENDING"
                                                                    ? "secondary"
                                                                    : "destructive"
                                                        }
                                                        className="text-xs"
                                                    >
                                                        {user.application.status}
                                                    </Badge>
                                                </div>
                                            )}
                                            <Link href={`/admin/users/${user.id}`} className="block">
                                                <Button size="sm" className="w-full">
                                                    View Details
                                                </Button>
                                            </Link>
                                        </div>

                                        {/* Desktop Layout */}
                                        <div className="hidden sm:flex items-center justify-between gap-6">
                                            <div className="flex-1 grid grid-cols-3 gap-4">
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900">
                                                        {user.email}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        ID: {user.id.slice(0, 8)}...
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1">Joined</p>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {new Date(user.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1">Application</p>
                                                    {user.application ? (
                                                        <Badge
                                                            variant={
                                                                user.application.status === "APPROVED"
                                                                    ? "default"
                                                                    : user.application.status === "PENDING"
                                                                        ? "secondary"
                                                                        : "destructive"
                                                            }
                                                            className="text-xs"
                                                        >
                                                            {user.application.status}
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-sm text-gray-500">None</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 shrink-0">
                                                <Badge
                                                    variant={roleBadge.variant}
                                                    className={roleBadge.className}
                                                >
                                                    {user.role}
                                                </Badge>
                                                <Link href={`/admin/users/${user.id}`}>
                                                    <Button size="sm">View</Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 p-4 sm:p-6 border-t bg-gray-50">
                            <div className="flex items-center gap-2">
                                {page > 1 && (
                                    <Link
                                        href={`/admin/users?role=${roleFilter}&search=${search}&page=${page - 1}`}
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
                                        href={`/admin/users?role=${roleFilter}&search=${search}&page=${page + 1}`}
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
