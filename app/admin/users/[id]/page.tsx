import { auth, isAdmin } from "@/lib/auth"
import { db } from "@/lib/db"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Mail, Calendar, Shield, FileText, Activity } from "lucide-react"
import { RoleChangeForm } from "@/components/admin/role-change-form"
import { DeleteUserButton } from "@/components/admin/delete-user-button"

export const dynamic = 'force-dynamic'

export default async function UserDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const session = await auth()

    if (!session?.user || !isAdmin(session)) {
        redirect("/login")
    }

    // Await params in Next.js 15
    const { id } = await params

    if (!id) {
        notFound()
    }

    const user = await db.user.findUnique({
        where: { id },
        include: {
            application: true,
            approvedApplications: {
                take: 5,
                orderBy: { reviewedAt: "desc" },
                include: {
                    user: {
                        select: {
                            email: true,
                        },
                    },
                },
            },
        },
    })

    if (!user) {
        notFound()
    }

    const getRoleBadge = (role: string) => {
        const variants: Record<string, { variant: "default" | "destructive" | "secondary", className: string }> = {
            VOTER: { variant: "secondary", className: "bg-blue-100 text-blue-700" },
            ADMIN: { variant: "default", className: "bg-purple-600 text-white" },
            SUPER_ADMIN: { variant: "destructive", className: "bg-red-600 text-white" },
        }
        return variants[role] || variants.VOTER
    }

    const roleBadge = getRoleBadge(user.role)
    const isSelf = session.user.id === user.id
    const canChangeRole = session.user.role === "SUPER_ADMIN" && !isSelf

    return (
        <div className="min-h-screen pb-8">
            {/* Header */}
            <div className="mb-6 space-y-4">
                <Link href="/admin/users">
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Users
                    </Button>
                </Link>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                            User Details
                        </h1>
                        <p className="text-sm sm:text-base text-gray-600">
                            {user.email}
                        </p>
                    </div>
                    <Badge
                        variant={roleBadge.variant}
                        className={`${roleBadge.className} text-sm sm:text-base px-3 py-1.5 sm:px-4 sm:py-2 w-fit`}
                    >
                        {user.role}
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* User Information */}
                    <Card>
                        <CardHeader className="bg-gray-50 border-b">
                            <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                                <Mail className="w-5 h-5" />
                                Account Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6">
                            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                <div>
                                    <dt className="text-xs sm:text-sm font-medium text-gray-500 uppercase">
                                        User ID
                                    </dt>
                                    <dd className="mt-1 text-sm sm:text-base text-gray-900 font-mono break-all">
                                        {user.id}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-xs sm:text-sm font-medium text-gray-500 uppercase">
                                        Email
                                    </dt>
                                    <dd className="mt-1 text-sm sm:text-base text-gray-900 break-words">
                                        {user.email}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-xs sm:text-sm font-medium text-gray-500 uppercase">
                                        Role
                                    </dt>
                                    <dd className="mt-1">
                                        <Badge variant={roleBadge.variant} className={roleBadge.className}>
                                            {user.role}
                                        </Badge>
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-xs sm:text-sm font-medium text-gray-500 uppercase">
                                        Joined
                                    </dt>
                                    <dd className="mt-1 text-sm sm:text-base text-gray-900">
                                        {new Date(user.createdAt).toLocaleString()}
                                    </dd>
                                </div>
                            </dl>
                        </CardContent>
                    </Card>

                    {/* Voter Application */}
                    {user.application && (
                        <Card>
                            <CardHeader className="bg-gray-50 border-b">
                                <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                                    <FileText className="w-5 h-5" />
                                    Voter Application
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 sm:p-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-500">Application Ref</p>
                                            <p className="font-medium text-gray-900">
                                                {user.application.applicationRef}
                                            </p>
                                        </div>
                                        <Badge
                                            variant={
                                                user.application.status === "APPROVED"
                                                    ? "default"
                                                    : user.application.status === "PENDING"
                                                        ? "secondary"
                                                        : "destructive"
                                            }
                                        >
                                            {user.application.status}
                                        </Badge>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-gray-500">Name</p>
                                            <p className="font-medium text-gray-900">
                                                {user.application.surname} {user.application.firstName}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Location</p>
                                            <p className="font-medium text-gray-900">
                                                {user.application.lga}, {user.application.state}
                                            </p>
                                        </div>
                                    </div>
                                    <Link href={`/admin/applications/${user.application.id}`}>
                                        <Button size="sm" className="w-full sm:w-auto">
                                            View Full Application
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Reviewed Applications (for admins) */}
                    {(user.role === "ADMIN" || user.role === "SUPER_ADMIN") && user.approvedApplications.length > 0 && (
                        <Card>
                            <CardHeader className="bg-gray-50 border-b">
                                <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                                    <Activity className="w-5 h-5" />
                                    Recent Reviews
                                </CardTitle>
                                <CardDescription>
                                    Last {user.approvedApplications.length} applications reviewed
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y">
                                    {user.approvedApplications.map((app) => (
                                        <div key={app.id} className="p-4 hover:bg-gray-50">
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        {app.user.email}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {app.reviewedAt
                                                            ? new Date(app.reviewedAt).toLocaleDateString()
                                                            : "N/A"}
                                                    </p>
                                                </div>
                                                <Badge
                                                    variant={app.status === "APPROVED" ? "default" : "destructive"}
                                                    className="text-xs"
                                                >
                                                    {app.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar - Role Management */}
                <div className="lg:col-span-1">
                    <div className="lg:sticky lg:top-6 space-y-4">
                        <RoleChangeForm
                            userId={user.id}
                            currentRole={user.role}
                            userEmail={user.email}
                            canChangeRole={canChangeRole}
                            isSelf={isSelf}
                        />

                        <DeleteUserButton
                            userId={user.id}
                            userEmail={user.email}
                            canDelete={session.user.role === "SUPER_ADMIN" && !isSelf}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
