"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Menu, X } from "lucide-react"

export function LandingMobileNav() {
    const [open, setOpen] = useState(false)

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                    <SheetTitle className="text-left">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-lg">EV</span>
                            </div>
                            <span className="font-bold text-xl">EasyVoter</span>
                        </div>
                    </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-4 mt-8">
                    <Link href="/login" onClick={() => setOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start text-lg h-12">
                            Sign In
                        </Button>
                    </Link>
                    <Link href="/register" onClick={() => setOpen(false)}>
                        <Button className="w-full text-lg h-12">
                            Get Started
                        </Button>
                    </Link>
                </nav>
            </SheetContent>
        </Sheet>
    )
}
