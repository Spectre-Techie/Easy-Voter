"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, LayoutDashboard, FileText, Users, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import AdminLogoutButton from "./admin-logout-button"

interface AdminMobileNavProps {
    userEmail: string
}

export function AdminMobileNav({ userEmail }: AdminMobileNavProps) {
    const [open, setOpen] = useState(false)

    const navigation = [
        { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { name: "Applications", href: "/admin/applications", icon: FileText },
        { name: "Users", href: "/admin/users", icon: Users },
        { name: "Settings", href: "/admin/settings", icon: Settings },
    ]

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    aria-label="Open menu"
                >
                    <Menu className="h-6 w-6" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0">
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <SheetHeader className="border-b border-gray-200 px-6 py-4">
                        <SheetTitle className="text-xl font-bold text-green-600">
                            EasyVoter Admin
                        </SheetTitle>
                    </SheetHeader>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                        {navigation.map((item) => {
                            const Icon = item.icon
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-green-50 hover:text-green-600 transition-colors"
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="font-medium">{item.name}</span>
                                </Link>
                            )
                        })}
                    </nav>

                    {/* User Info & Logout */}
                    <div className="p-4 border-t border-gray-200">
                        <div className="mb-3">
                            <p className="text-sm font-medium text-gray-900">{userEmail}</p>
                            <p className="text-xs text-gray-500">Administrator</p>
                        </div>
                        <AdminLogoutButton />
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
