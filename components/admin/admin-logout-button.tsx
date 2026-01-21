"use client"

import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"
import { useState } from "react"

export default function AdminLogoutButton() {
    const [isLoading, setIsLoading] = useState(false)

    async function handleLogout() {
        try {
            setIsLoading(true)
            await signOut({ redirectTo: "/login" })
        } catch (error) {
            console.error("Logout failed:", error)
            setIsLoading(false)
        }
    }

    return (
        <Button
            onClick={handleLogout}
            disabled={isLoading}
            variant="outline"
            className="w-full justify-start"
        >
            <LogOut className="w-4 h-4 mr-2" />
            {isLoading ? "Logging out..." : "Logout"}
        </Button>
    )
}
