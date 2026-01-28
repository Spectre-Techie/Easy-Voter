"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { FileText, LogOut, Sparkles, ArrowRight, User, Loader2 } from "lucide-react"
import { ApplicationTimeline } from "@/components/dashboard/application-timeline"
import { StatusCard } from "@/components/dashboard/status-card"
import { ApplicationDetails } from "@/components/dashboard/application-details"
import { InstallPrompt } from "@/components/pwa/install-prompt"
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh"
import { handleSignOut } from "./actions"

export default function DashboardClient({ session, application }: any) {
    const { isRefreshing, pullDistance } = usePullToRefresh()

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* Pull to Refresh Indicator */}
            {pullDistance > 0 && (
                <div
                    className="fixed top-0 left-0 right-0 z-50 flex justify-center transition-all"
                    style={{ transform: `translateY(${Math.min(pullDistance - 50, 50)}px)` }}
                >
                    <div className="bg-white rounded-full p-3 shadow-lg">
                        <Loader2 className={`w-6 h-6 text-blue-600 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </div>
                </div>
            )}

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
                    <div className="flex items-center gap-2">
                        {/* Profile Link */}
                        <Link href="/profile">
                            <Button variant="ghost" size="sm" className="gap-2">
                                <User className="w-4 h-4" />
                                <span className="hidden sm:inline">Profile</span>
                            </Button>
                        </Link>

                        <div className="hidden md:block text-right mr-2">
                            <p className="text-sm font-medium text-gray-900">{session.user.email}</p>
                            <p className="text-xs text-muted-foreground">Voter Account</p>
                        </div>
                        <form action={handleSignOut}>
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
                            Track your voter registration application status and download your voter card when approved.
                        </p>
                    </div>

                    {/* Main Content */}
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Left Column - Status Card */}
                        <div className="lg:col-span-2 space-y-8">
                            <StatusCard application={application} />

                            {/* Application Details */}
                            {application && application.status !== "DRAFT" && (
                                <ApplicationDetails application={application} />
                            )}

                            {/* New Application CTA */}
                            {!application && (
                                <Card className="border-2 border-dashed border-blue-200 bg-blue-50/50">
                                    <CardHeader>
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <Sparkles className="w-6 h-6 text-blue-600" />
                                            </div>
                                            <div>
                                                <CardTitle>Ready to Register?</CardTitle>
                                                <CardDescription>
                                                    Start your voter registration application now
                                                </CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <Link href="/apply">
                                            <Button className="w-full sm:w-auto group">
                                                Start Application
                                                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                            </Button>
                                        </Link>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Right Column - Timeline */}
                        <div className="lg:col-span-1">
                            <ApplicationTimeline application={application} />
                        </div>
                    </div>

                    {/* Help Section */}
                    <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-100">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                Need Help?
                            </CardTitle>
                            <CardDescription>
                                Contact our support team for assistance with your application
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="font-medium">Email:</span>
                                    <a
                                        href="mailto:support@easyvoter.ng"
                                        className="text-blue-600 hover:underline"
                                    >
                                        support@easyvoter.ng
                                    </a>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="font-medium">Phone:</span>
                                    <a
                                        href="tel:+2349079644972"
                                        className="text-blue-600 hover:underline"
                                    >
                                        +234 907 964 4972
                                    </a>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* PWA Install Prompt */}
            <InstallPrompt />
        </div>
    )
}
