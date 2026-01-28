"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Bell, Mail, Trash2, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { signOut } from "next-auth/react"

interface SettingsSectionProps {
    userId: string
}

export function SettingsSection({ userId }: SettingsSectionProps) {
    const [emailNotifications, setEmailNotifications] = useState(true)
    const [smsNotifications, setSmsNotifications] = useState(false)
    const [loading, setLoading] = useState(false)
    const [deleting, setDeleting] = useState(false)

    const handleNotificationToggle = async (type: "email" | "sms", value: boolean) => {
        // In a real app, you would save this to the backend
        toast.success(`${type === "email" ? "Email" : "SMS"} notifications ${value ? "enabled" : "disabled"}`)

        if (type === "email") {
            setEmailNotifications(value)
        } else {
            setSmsNotifications(value)
        }
    }

    const handleDeleteAccount = async () => {
        setDeleting(true)
        try {
            const response = await fetch("/api/profile/delete", {
                method: "DELETE",
            })

            if (!response.ok) {
                throw new Error("Failed to delete account")
            }

            toast.success("Account deleted successfully")

            // Sign out and redirect
            await signOut({ callbackUrl: "/" })
        } catch (error) {
            toast.error("Failed to delete account")
            setDeleting(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Settings & Preferences</CardTitle>
                <CardDescription>Manage your account settings and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Notifications */}
                <div className="space-y-4">
                    <div>
                        <h3 className="font-semibold flex items-center gap-2">
                            <Bell className="w-4 h-4" />
                            Notifications
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            Choose how you want to receive updates
                        </p>
                    </div>

                    <div className="space-y-4 pl-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="email-notifications" className="cursor-pointer flex items-center gap-2">
                                    <Mail className="w-4 h-4" />
                                    Email Notifications
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Receive application updates via email
                                </p>
                            </div>
                            <Switch
                                id="email-notifications"
                                checked={emailNotifications}
                                onCheckedChange={(checked) => handleNotificationToggle("email", checked)}
                            />
                        </div>

                        <div className="flex items-center justify-between opacity-50">
                            <div className="space-y-0.5">
                                <Label htmlFor="sms-notifications" className="cursor-pointer">
                                    SMS Notifications
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Coming soon
                                </p>
                            </div>
                            <Switch
                                id="sms-notifications"
                                checked={smsNotifications}
                                disabled
                            />
                        </div>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="border-t pt-6">
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-semibold text-red-600 flex items-center gap-2">
                                <Trash2 className="w-4 h-4" />
                                Danger Zone
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                Permanently delete your account and all associated data
                            </p>
                        </div>

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" className="w-full sm:w-auto" disabled={deleting}>
                                    {deleting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Deleting...
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Delete Account
                                        </>
                                    )}
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete your account,
                                        voter registration application, and remove all your data from our servers.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleDeleteAccount}
                                        className="bg-red-600 hover:bg-red-700"
                                    >
                                        Yes, delete my account
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
