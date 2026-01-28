"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Shield, AlertTriangle, Loader2, CheckCircle } from "lucide-react"
import { toast } from "sonner"

interface RoleChangeFormProps {
    userId: string
    currentRole: string
    userEmail: string
    canChangeRole: boolean
    isSelf: boolean
}

export function RoleChangeForm({
    userId,
    currentRole,
    userEmail,
    canChangeRole,
    isSelf,
}: RoleChangeFormProps) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [selectedRole, setSelectedRole] = useState(currentRole)
    const [showConfirm, setShowConfirm] = useState(false)

    const roles = [
        { value: "VOTER", label: "Voter", description: "Regular user with voter registration access" },
        { value: "ADMIN", label: "Admin", description: "Can review applications and manage users" },
        { value: "SUPER_ADMIN", label: "Super Admin", description: "Full system access including role management" },
    ]

    const handleRoleChange = async () => {
        if (selectedRole === currentRole) {
            toast.info("No changes to save")
            return
        }

        setIsSubmitting(true)

        try {
            const response = await fetch(`/api/admin/users/${userId}/role`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role: selectedRole }),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || "Failed to change role")
            }

            toast.success(`Role changed to ${selectedRole} successfully`)
            setShowConfirm(false)
            router.refresh()
        } catch (error) {
            console.error("Role change error:", error)
            toast.error(error instanceof Error ? error.message : "Failed to change role")
            setSelectedRole(currentRole) // Reset on error
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isSelf) {
        return (
            <Card className="border-2 border-gray-200">
                <CardHeader className="bg-gray-50 border-b">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Role Management
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <Alert className="bg-blue-50 border-blue-200">
                        <AlertTriangle className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-sm text-blue-800">
                            You cannot change your own role. Ask another Super Admin for assistance.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        )
    }

    if (!canChangeRole) {
        return (
            <Card className="border-2 border-gray-200">
                <CardHeader className="bg-gray-50 border-b">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Role Management
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <Alert className="bg-orange-50 border-orange-200">
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                        <AlertDescription className="text-sm text-orange-800">
                            Only Super Admins can change user roles.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-2 border-purple-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-200">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="w-5 h-5 text-purple-600" />
                    Role Management
                </CardTitle>
                <CardDescription>Change user role and permissions</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                {/* Current User Info */}
                <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Managing role for:</p>
                    <p className="font-medium text-gray-900 break-words">{userEmail}</p>
                </div>

                {/* Role Selection */}
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                        Select New Role
                    </label>
                    <Select value={selectedRole} onValueChange={setSelectedRole} disabled={isSubmitting}>
                        <SelectTrigger className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {roles.map((role) => (
                                <SelectItem key={role.value} value={role.value}>
                                    <div className="flex flex-col items-start">
                                        <span className="font-medium">{role.label}</span>
                                        <span className="text-xs text-gray-500">{role.description}</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Warning for role change */}
                {selectedRole !== currentRole && !showConfirm && (
                    <Alert className="bg-yellow-50 border-yellow-200">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <AlertDescription className="text-sm text-yellow-800">
                            Changing from <strong>{currentRole}</strong> to <strong>{selectedRole}</strong> will
                            immediately update user permissions.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Confirmation Step */}
                {showConfirm && selectedRole !== currentRole && (
                    <Alert className="bg-red-50 border-red-200">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-sm text-red-800">
                            <strong>Are you sure?</strong> This action will change the user's role from{" "}
                            <strong>{currentRole}</strong> to <strong>{selectedRole}</strong>.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                    {!showConfirm ? (
                        <Button
                            onClick={() => setShowConfirm(true)}
                            disabled={selectedRole === currentRole || isSubmitting}
                            className="w-full bg-purple-600 hover:bg-purple-700 font-semibold py-6"
                        >
                            <Shield className="w-5 h-5 mr-2" />
                            Change Role
                        </Button>
                    ) : (
                        <>
                            <Button
                                onClick={handleRoleChange}
                                disabled={isSubmitting}
                                className="w-full bg-red-600 hover:bg-red-700 font-semibold py-6"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                ) : (
                                    <CheckCircle className="w-5 h-5 mr-2" />
                                )}
                                Confirm Role Change
                            </Button>
                            <Button
                                onClick={() => {
                                    setShowConfirm(false)
                                    setSelectedRole(currentRole)
                                }}
                                disabled={isSubmitting}
                                variant="outline"
                                className="w-full py-6"
                            >
                                Cancel
                            </Button>
                        </>
                    )}
                </div>

                {/* Info */}
                <p className="text-xs text-center text-gray-500 pt-2">
                    All role changes are logged for security auditing.
                </p>
            </CardContent>
        </Card>
    )
}
