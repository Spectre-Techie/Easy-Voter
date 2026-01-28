import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { signOut } from "@/lib/auth"
import { FileText, LogOut, Sparkles, ArrowRight } from "lucide-react"
import { ApplicationTimeline } from "@/components/dashboard/application-timeline"
import { StatusCard } from "@/components/dashboard/status-card"
import { ApplicationDetails } from "@/components/dashboard/application-details"

export default async function DashboardPage() {
    const session = await auth()

    if (!session) {
        redirect("/login")
    }

    // Redirect admins to admin dashboard
    if (session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN") {
        redirect("/admin")
    }

    // Get user's application if it exists
    const application = await db.voterApplication.findUnique({
        where: {
            userId: session.user.id,
        },
    })

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md shadow-sm">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-lg">EV</span>
                        </div>
                        <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            EasyVoter
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:block text-right">
                            <p className="text-sm font-medium text-gray-900">{session.user.email}</p>
                            <p className="text-xs text-muted-foreground">Voter Account</p>
                        </div>
                        <form
                            action={async () => {
                                "use server"
                                await signOut({ redirectTo: "/" })
                            }}
                        >
                            <Button variant="ghost" size="sm" type="submit">
                                <LogOut className="w-4 h-4 mr-2" />
                                <span className="hidden sm:inline">Sign Out</span>
                            </Button>
                        </form>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8 md:py-12">
                <div className="max-w-6xl mx-auto space-y-8">
                    {/* Welcome Section */}
                    <div className="space-y-2">
                        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                            Welcome back! 👋
                        </h1>
                        <p className="text-muted-foreground text-lg">
                            {application
                                ? "Track your voter registration application"
                                : "Start your voter registration journey"}
                        </p>
                    </div>

                    {application ? (
                        <div className="grid lg:grid-cols-3 gap-6">
                            {/* Main Content - Left Side */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Status Card */}
                                <StatusCard application={application} />

                                {/* Application Details */}
                                <ApplicationDetails application={application} />
                            </div>

                            {/* Sidebar - Right Side */}
                            <div className="space-y-6">
                                {/* Timeline */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Application Timeline</CardTitle>
                                        <CardDescription>Track your progress</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <ApplicationTimeline application={application} />
                                    </CardContent>
                                </Card>

                                {/* Quick Info */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Quick Info</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3 text-sm">
                                        <div>
                                            <p className="text-muted-foreground">Application ID</p>
                                            <p className="font-mono font-medium text-xs">
                                                {application.applicationRef}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Submitted</p>
                                            <p className="font-medium">
                                                {application.submittedAt
                                                    ? new Date(application.submittedAt).toLocaleDateString(
                                                        "en-US",
                                                        {
                                                            month: "long",
                                                            day: "numeric",
                                                            year: "numeric",
                                                        }
                                                    )
                                                    : "Not submitted"}
                                            </p>
                                        </div>
                                        {application.reviewedAt && (
                                            <div>
                                                <p className="text-muted-foreground">Reviewed</p>
                                                <p className="font-medium">
                                                    {new Date(application.reviewedAt).toLocaleDateString(
                                                        "en-US",
                                                        {
                                                            month: "long",
                                                            day: "numeric",
                                                            year: "numeric",
                                                        }
                                                    )}
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    ) : (
                        // No Application - Enhanced Empty State
                        <div className="max-w-2xl mx-auto">
                            <Card className="border-2 border-dashed border-blue-200 bg-gradient-to-br from-blue-50/50 to-white">
                                <CardContent className="pt-12 pb-12 text-center space-y-6">
                                    <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                                        <Sparkles className="w-10 h-10 text-blue-600" />
                                    </div>

                                    <div className="space-y-2">
                                        <h2 className="text-2xl font-bold text-gray-900">
                                            Ready to Register?
                                        </h2>
                                        <p className="text-muted-foreground max-w-md mx-auto">
                                            You haven't submitted a voter registration application yet.
                                            Start your journey to becoming a registered voter today!
                                        </p>
                                    </div>

                                    <div className="bg-blue-50 rounded-lg p-6 text-left max-w-md mx-auto">
                                        <h3 className="font-semibold text-blue-900 mb-3">What you'll need:</h3>
                                        <ul className="space-y-2 text-sm text-blue-800">
                                            <li className="flex items-start gap-2">
                                                <span className="text-blue-600 mt-0.5">✓</span>
                                                <span>Valid government-issued ID (NIN, Driver's License, etc.)</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-blue-600 mt-0.5">✓</span>
                                                <span>Recent passport photograph</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-blue-600 mt-0.5">✓</span>
                                                <span>Proof of address (utility bill, bank statement, etc.)</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-blue-600 mt-0.5">✓</span>
                                                <span>About 10 minutes to complete the form</span>
                                            </li>
                                        </ul>
                                    </div>

                                    <Link href="/apply">
                                        <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg">
                                            <FileText className="w-5 h-5 mr-2" />
                                            Start Voter Registration
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
