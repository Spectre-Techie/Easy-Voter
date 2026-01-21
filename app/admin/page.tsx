import { auth, isAdmin } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, CheckCircle, XCircle, Clock } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function AdminDashboard() {
    const session = await auth()

    // Check if user is authenticated and is admin
    if (!session?.user || !isAdmin(session)) {
        redirect("/login")
    }

    // Fetch statistics
    const [totalApplications, pendingApplications, approvedApplications, rejectedApplications] = await Promise.all([
        db.voterApplication.count(),
        db.voterApplication.count({ where: { status: "PENDING" } }),
        db.voterApplication.count({ where: { status: "APPROVED" } }),
        db.voterApplication.count({ where: { status: "REJECTED" } }),
    ])

    // Fetch recent applications
    const recentApplications = await db.voterApplication.findMany({
        take: 5,
        orderBy: { submittedAt: "desc" },
        include: {
            user: {
                select: {
                    email: true,
                },
            },
        },
    })

    const stats = [
        {
            title: "Total Applications",
            value: totalApplications,
            icon: FileText,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
        },
        {
            title: "Pending Review",
            value: pendingApplications,
            icon: Clock,
            color: "text-yellow-600",
            bgColor: "bg-yellow-50",
        },
        {
            title: "Approved",
            value: approvedApplications,
            icon: CheckCircle,
            color: "text-green-600",
            bgColor: "bg-green-50",
        },
        {
            title: "Rejected",
            value: rejectedApplications,
            icon: XCircle,
            color: "text-red-600",
            bgColor: "bg-red-50",
        },
    ]

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-2">Overview of voter registration applications</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => {
                    const Icon = stat.icon
                    return (
                        <Card key={stat.title}>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">
                                    {stat.title}
                                </CardTitle>
                                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                                    <Icon className={`w-5 h-5 ${stat.color}`} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Recent Applications */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Recent Applications</CardTitle>
                            <CardDescription>Latest voter registration submissions</CardDescription>
                        </div>
                        <Link href="/admin/applications">
                            <Button variant="outline">View All</Button>
                        </Link>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {recentApplications.length === 0 ? (
                            <p className="text-center text-gray-500 py-8">No applications yet</p>
                        ) : (
                            recentApplications.map((application) => (
                                <div
                                    key={application.id}
                                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex-1">
                                        <h3 className="font-medium text-gray-900">
                                            {application.surname} {application.firstName}
                                        </h3>
                                        <p className="text-sm text-gray-600">{application.user.email}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Ref: {application.applicationRef}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-medium ${application.status === "PENDING"
                                                    ? "bg-yellow-100 text-yellow-800"
                                                    : application.status === "APPROVED"
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-red-100 text-red-800"
                                                }`}
                                        >
                                            {application.status}
                                        </span>
                                        <Link href={`/admin/applications/${application.id}`}>
                                            <Button size="sm">Review</Button>
                                        </Link>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
