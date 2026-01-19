import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { signOut } from "@/lib/auth"
import { FileText, LogOut, User } from "lucide-react"

export default async function DashboardPage() {
    const session = await auth()

    if (!session) {
        redirect("/login")
    }

    // Get user's application if it exists
    const application = await prisma.voterApplication.findUnique({
        where: {
            userId: session.user.id,
        },
    })

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { variant: "default" | "destructive" | "secondary" | "outline", color: string }> = {
            DRAFT: { variant: "secondary", color: "text-gray-600" },
            PENDING: { variant: "default", color: "text-orange-600" },
            APPROVED: { variant: "default", color: "text-green-600" },
            REJECTED: { variant: "destructive", color: "text-red-600" },
        }

        const config = variants[status] || variants.DRAFT

        return (
            <Badge variant={config.variant} className={config.color}>
                {status}
            </Badge>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Header */}
            <header className="border-b bg-white/80 backdrop-blur-sm">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg">EV</span>
                        </div>
                        <span className="font-bold text-xl">EasyVoter</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">{session.user.email}</span>
                        <form
                            action={async () => {
                                "use server"
                                await signOut({ redirectTo: "/" })
                            }}
                        >
                            <Button variant="ghost" size="sm" type="submit">
                                <LogOut className="w-4 h-4 mr-2" />
                                Sign Out
                            </Button>
                        </form>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Welcome Section */}
                    <div>
                        <h1 className="text-3xl font-bold">Welcome back!</h1>
                        <p className="text-muted-foreground mt-1">
                            Manage your voter registration application
                        </p>
                    </div>

                    {/* Application Status Card */}
                    {application ? (
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Your Application</CardTitle>
                                        <CardDescription>Application ID: {application.id.slice(0, 8)}</CardDescription>
                                    </div>
                                    {getStatusBadge(application.status)}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Name</p>
                                        <p className="font-medium">{application.firstName} {application.lastName}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Submitted</p>
                                        <p className="font-medium">
                                            {application.submittedAt
                                                ? new Date(application.submittedAt).toLocaleDateString()
                                                : "Not submitted"}
                                        </p>
                                    </div>
                                </div>

                                {application.status === "APPROVED" && application.voterCardPdfUrl && (
                                    <div className="pt-4 border-t">
                                        <Link href={`/api/voter-card/${application.id}`} target="_blank">
                                            <Button className="w-full">
                                                <FileText className="w-4 h-4 mr-2" />
                                                Download Voter Card
                                            </Button>
                                        </Link>
                                    </div>
                                )}

                                {application.status === "REJECTED" && application.reviewNotes && (
                                    <div className="pt-4 border-t">
                                        <p className="text-sm font-medium text-red-600">Rejection Reason:</p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {application.reviewNotes}
                                        </p>
                                    </div>
                                )}

                                {application.status === "PENDING" && (
                                    <div className="pt-4 border-t bg-orange-50 -mx-6 -mb-6 px-6 py-4 rounded-b-lg">
                                        <p className="text-sm text-orange-700">
                                            Your application is being reviewed. You'll be notified once a decision is made.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardHeader>
                                <CardTitle>No Application Found</CardTitle>
                                <CardDescription>
                                    You haven't submitted a voter registration application yet
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href="/apply">
                                    <Button className="w-full">
                                        <User className="w-4 h-4 mr-2" />
                                        Start Voter Registration
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    )}

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-2">
                            {!application && (
                                <Link href="/apply">
                                    <Button variant="outline" className="w-full justify-start">
                                        <FileText className="w-4 h-4 mr-2" />
                                        Start New Application
                                    </Button>
                                </Link>
                            )}
                            <Button variant="outline" className="w-full justify-start" disabled>
                                <User className="w-4 h-4 mr-2" />
                                Update Profile (Coming Soon)
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
