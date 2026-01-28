import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { ProfileHeader } from "@/components/profile/profile-header"
import { PersonalInfoSection } from "@/components/profile/personal-info-section"
import { ApplicationInfoSection } from "@/components/profile/application-info-section"
import { SettingsSection } from "@/components/profile/settings-section"

export default async function ProfilePage() {
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    // Fetch user data with application
    const user = await db.user.findUnique({
        where: { id: session.user.id },
        include: {
            application: true,
        },
    })

    if (!user) {
        redirect("/login")
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="container mx-auto px-4 py-8 max-w-5xl">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Profile Settings</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage your account information and preferences
                    </p>
                </div>

                <div className="space-y-6">
                    {/* Profile Header with Avatar */}
                    <ProfileHeader
                        email={user.email}
                        role={user.role}
                        createdAt={user.createdAt}
                    />

                    {/* Personal Information */}
                    <PersonalInfoSection
                        email={user.email}
                        userId={user.id}
                    />

                    {/* Application Information (if exists) */}
                    {user.application && (
                        <ApplicationInfoSection application={user.application} />
                    )}

                    {/* Settings */}
                    <SettingsSection userId={user.id} />
                </div>
            </div>
        </div>
    )
}
