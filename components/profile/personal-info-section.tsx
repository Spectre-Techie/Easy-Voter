"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, Lock, Save, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface PersonalInfoSectionProps {
    email: string
    userId: string
}

export function PersonalInfoSection({ email, userId }: PersonalInfoSectionProps) {
    const [isChangingPassword, setIsChangingPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    })

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault()

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("New passwords don't match")
            return
        }

        if (passwordData.newPassword.length < 8) {
            toast.error("Password must be at least 8 characters")
            return
        }

        setLoading(true)
        try {
            const response = await fetch("/api/profile/password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Failed to change password")
            }

            toast.success("Password changed successfully")
            setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
            setIsChangingPassword(false)
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to change password")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>View and manage your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Email (Read-only) */}
                <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            disabled
                            className="pl-10 bg-muted"
                        />
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Email cannot be changed. Contact support if you need assistance.
                    </p>
                </div>

                {/* Password Change Section */}
                <div className="border-t pt-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="font-semibold flex items-center gap-2">
                                <Lock className="w-4 h-4" />
                                Password
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                Change your account password
                            </p>
                        </div>
                        {!isChangingPassword && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsChangingPassword(true)}
                            >
                                Change Password
                            </Button>
                        )}
                    </div>

                    {isChangingPassword && (
                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="currentPassword">Current Password</Label>
                                <Input
                                    id="currentPassword"
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="newPassword">New Password</Label>
                                <Input
                                    id="newPassword"
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    required
                                    minLength={8}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    required
                                    minLength={8}
                                />
                            </div>

                            <div className="flex gap-2">
                                <Button type="submit" disabled={loading}>
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Changing...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4 mr-2" />
                                            Save Password
                                        </>
                                    )}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setIsChangingPassword(false)
                                        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
                                    }}
                                    disabled={loading}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
