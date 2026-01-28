import { auth, isAdmin } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Settings, Database, Mail, Shield, BarChart3, Users, FileText } from "lucide-react"

export default async function SettingsPage() {
    const session = await auth()

    if (!session?.user || !isAdmin(session)) {
        redirect("/login")
    }

    // Fetch system stats
    const [totalUsers, totalApplications, pendingApplications, approvedApplications] = await Promise.all([
        db.user.count(),
        db.voterApplication.count(),
        db.voterApplication.count({ where: { status: "PENDING" } }),
        db.voterApplication.count({ where: { status: "APPROVED" } }),
    ])

    const systemInfo = [
        { label: "Total Users", value: totalUsers, icon: Users, color: "text-blue-600" },
        { label: "Total Applications", value: totalApplications, icon: FileText, color: "text-green-600" },
        { label: "Pending Reviews", value: pendingApplications, icon: BarChart3, color: "text-orange-600" },
        { label: "Approved", value: approvedApplications, icon: Shield, color: "text-purple-600" },
    ]

    return (
        <div className="min-h-screen pb-8">
            {/* Header */}
            <div className="mb-6 space-y-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Settings</h1>
                <p className="text-sm sm:text-base text-gray-600">
                    System configuration and admin preferences
                </p>
            </div>

            <div className="space-y-6">
                {/* Admin Profile */}
                <Card>
                    <CardHeader className="bg-gray-50 border-b">
                        <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                            <Shield className="w-5 h-5 text-purple-600" />
                            Admin Profile
                        </CardTitle>
                        <CardDescription>Your administrator account information</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            <div>
                                <dt className="text-xs sm:text-sm font-medium text-gray-500 uppercase">
                                    Email
                                </dt>
                                <dd className="mt-1 text-sm sm:text-base text-gray-900 break-words">
                                    {session.user.email}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs sm:text-sm font-medium text-gray-500 uppercase">
                                    Role
                                </dt>
                                <dd className="mt-1">
                                    <Badge className="bg-purple-600 text-white">
                                        {session.user.role}
                                    </Badge>
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs sm:text-sm font-medium text-gray-500 uppercase">
                                    User ID
                                </dt>
                                <dd className="mt-1 text-sm sm:text-base text-gray-900 font-mono break-all">
                                    {session.user.id}
                                </dd>
                            </div>
                        </dl>
                    </CardContent>
                </Card>

                {/* System Statistics */}
                <Card>
                    <CardHeader className="bg-gray-50 border-b">
                        <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-green-600" />
                            System Statistics
                        </CardTitle>
                        <CardDescription>Overview of system activity and data</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {systemInfo.map((stat) => {
                                const Icon = stat.icon
                                return (
                                    <div key={stat.label} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                        <div className="flex items-center justify-between mb-2">
                                            <Icon className={`w-5 h-5 ${stat.color}`} />
                                            <span className={`text-2xl font-bold ${stat.color}`}>
                                                {stat.value}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600">{stat.label}</p>
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Database Configuration */}
                <Card>
                    <CardHeader className="bg-gray-50 border-b">
                        <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                            <Database className="w-5 h-5 text-blue-600" />
                            Database Configuration
                        </CardTitle>
                        <CardDescription>Database connection and settings</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                                <div>
                                    <p className="font-medium text-green-900">Database Status</p>
                                    <p className="text-sm text-green-700">Connected to PostgreSQL via Prisma Accelerate</p>
                                </div>
                                <Badge className="bg-green-600 text-white">Active</Badge>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-500">Provider</p>
                                    <p className="font-medium text-gray-900">PostgreSQL</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">ORM</p>
                                    <p className="font-medium text-gray-900">Prisma</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Email Configuration */}
                <Card>
                    <CardHeader className="bg-gray-50 border-b">
                        <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                            <Mail className="w-5 h-5 text-orange-600" />
                            Email Notifications
                        </CardTitle>
                        <CardDescription>Email service configuration and settings</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <div>
                                    <p className="font-medium text-blue-900">Email Service</p>
                                    <p className="text-sm text-blue-700">Resend API configured</p>
                                </div>
                                <Badge className="bg-blue-600 text-white">Configured</Badge>
                            </div>
                            <div className="grid grid-cols-1 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-500">From Email</p>
                                    <p className="font-medium text-gray-900">{process.env.RESEND_FROM_EMAIL || "Not configured"}</p>
                                </div>
                                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <p className="text-xs text-yellow-800">
                                        <strong>Note:</strong> Email notifications for application status changes are ready to be implemented.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Application Settings */}
                <Card>
                    <CardHeader className="bg-gray-50 border-b">
                        <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                            <Settings className="w-5 h-5 text-gray-600" />
                            Application Settings
                        </CardTitle>
                        <CardDescription>General application configuration</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-500">Application Name</p>
                                    <p className="font-medium text-gray-900">EasyVoter</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Environment</p>
                                    <p className="font-medium text-gray-900">
                                        {process.env.NODE_ENV === "production" ? "Production" : "Development"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Application URL</p>
                                    <p className="font-medium text-gray-900 break-all">
                                        {process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Storage</p>
                                    <p className="font-medium text-gray-900">Vercel Blob</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
