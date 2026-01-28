import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { signOut } from "@/lib/auth"
import { FileText, LogOut, Sparkles, ArrowRight, User, Loader2 } from "lucide-react"
import { ApplicationTimeline } from "@/components/dashboard/application-timeline"
import { StatusCard } from "@/components/dashboard/status-card"
import { ApplicationDetails } from "@/components/dashboard/application-details"
import { InstallPrompt } from "@/components/pwa/install-prompt"
import DashboardClient from "./dashboard-client"

export const dynamic = 'force-dynamic'

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

    return <DashboardClient session={session} application={application} />
}
