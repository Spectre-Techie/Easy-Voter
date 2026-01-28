"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, Home, FileText, Download, Bell, User, Settings, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

interface MobileNavProps {
    isAuthenticated?: boolean
    userRole?: "USER" | "ADMIN" | "SUPER_ADMIN"
    onSignOut?: () => void
}

export function MobileNav({ isAuthenticated = false, userRole, onSignOut }: MobileNavProps) {
    const [open, setOpen] = useState(false)
    const pathname = usePathname()

    const publicLinks = [
        { href: "/", label: "Home", icon: Home },
        { href: "/verify", label: "Verify Card", icon: FileText },
    ]

    const userLinks = [
        { href: "/dashboard", label: "Dashboard", icon: Home },
        { href: "/apply", label: "Apply", icon: FileText },
        { href: "/notifications", label: "Notifications", icon: Bell },
        { href: "/profile", label: "Profile", icon: User },
    ]

    const adminLinks = [
        { href: "/admin", label: "Admin Dashboard", icon: Settings },
        { href: "/admin/applications", label: "Applications", icon: FileText },
        { href: "/admin/users", label: "Users", icon: User },
    ]

    const links = isAuthenticated
        ? userRole === "ADMIN" || userRole === "SUPER_ADMIN"
            ? [...userLinks, ...adminLinks]
            : userLinks
        : publicLinks

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] sm:w-[320px]">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">EV</span>
                        </div>
                        <span className="font-bold text-lg">EasyVoter</span>
                    </SheetTitle>
                </SheetHeader>

                <nav className="flex flex-col gap-2 mt-8">
                    {links.map((link) => {
                        const Icon = link.icon
                        const isActive = pathname === link.href

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                                    isActive
                                        ? "bg-blue-50 text-blue-700 font-medium"
                                        : "text-slate-700 hover:bg-slate-100"
                                )}
                            >
                                <Icon className="w-5 h-5" />
                                {link.label}
                            </Link>
                        )
                    })}

                    {isAuthenticated && (
                        <>
                            <div className="border-t my-4" />
                            <button
                                onClick={() => {
                                    setOpen(false)
                                    onSignOut?.()
                                }}
                                className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors text-left"
                            >
                                <LogOut className="w-5 h-5" />
                                Sign Out
                            </button>
                        </>
                    )}

                    {!isAuthenticated && (
                        <div className="border-t mt-4 pt-4 space-y-2">
                            <Link href="/login" onClick={() => setOpen(false)}>
                                <Button variant="outline" className="w-full">
                                    Sign In
                                </Button>
                            </Link>
                            <Link href="/register" onClick={() => setOpen(false)}>
                                <Button className="w-full">
                                    Get Started
                                </Button>
                            </Link>
                        </div>
                    )}
                </nav>
            </SheetContent>
        </Sheet>
    )
}
