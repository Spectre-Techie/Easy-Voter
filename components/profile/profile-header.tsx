"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Shield, Crown } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface ProfileHeaderProps {
    email: string
    role: "VOTER" | "ADMIN" | "SUPER_ADMIN"
    createdAt: Date
}

export function ProfileHeader({ email, role, createdAt }: ProfileHeaderProps) {
    const getInitials = (email: string) => {
        return email.substring(0, 2).toUpperCase()
    }

    const getRoleBadge = () => {
        switch (role) {
            case "SUPER_ADMIN":
                return (
                    <Badge className="bg-purple-600 hover:bg-purple-700">
                        <Crown className="w-3 h-3 mr-1" />
                        Super Admin
                    </Badge>
                )
            case "ADMIN":
                return (
                    <Badge className="bg-blue-600 hover:bg-blue-700">
                        <Shield className="w-3 h-3 mr-1" />
                        Admin
                    </Badge>
                )
            default:
                return (
                    <Badge variant="secondary">
                        <User className="w-3 h-3 mr-1" />
                        Voter
                    </Badge>
                )
        }
    }

    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    {/* Avatar */}
                    <Avatar className="h-24 w-24 bg-gradient-to-br from-blue-500 to-indigo-600">
                        <AvatarFallback className="text-white text-2xl font-bold">
                            {getInitials(email)}
                        </AvatarFallback>
                    </Avatar>

                    {/* Info */}
                    <div className="flex-1 text-center sm:text-left space-y-3">
                        <div>
                            <h2 className="text-2xl font-bold">{email}</h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                Member since {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                            {getRoleBadge()}
                            <Badge variant="outline" className="border-green-500 text-green-700">
                                ✓ Email Verified
                            </Badge>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
