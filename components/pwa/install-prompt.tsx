"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { X, Download } from "lucide-react"

export function InstallPrompt() {
    const [showPrompt, setShowPrompt] = useState(false)
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

    useEffect(() => {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            return
        }

        // Check if user has dismissed before
        if (localStorage.getItem('installPromptDismissed')) {
            return
        }

        // Listen for install prompt event
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault()
            setDeferredPrompt(e)

            // Show prompt after 30 seconds or on second visit
            const visitCount = parseInt(localStorage.getItem('visitCount') || '0')
            if (visitCount >= 1) {
                setTimeout(() => setShowPrompt(true), 30000)
            }
            localStorage.setItem('visitCount', String(visitCount + 1))
        }

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
        }
    }, [])

    const handleInstall = async () => {
        if (!deferredPrompt) return

        deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice

        if (outcome === 'accepted') {
            console.log('✅ User installed app')
        }

        setDeferredPrompt(null)
        setShowPrompt(false)
    }

    const handleDismiss = () => {
        setShowPrompt(false)
        localStorage.setItem('installPromptDismissed', 'true')
    }

    if (!showPrompt) return null

    return (
        <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96 animate-in slide-in-from-bottom">
            <Card className="p-4 shadow-lg border-2 border-blue-500 bg-white">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg">EV</span>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Install EasyVoter</h3>
                            <p className="text-sm text-gray-600">Add to your home screen</p>
                        </div>
                    </div>
                    <button
                        onClick={handleDismiss}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <p className="text-sm text-gray-600 mb-4">
                    Install EasyVoter for quick access and offline viewing of your voter card.
                </p>

                <div className="flex gap-2">
                    <Button onClick={handleInstall} className="flex-1 gap-2">
                        <Download className="w-4 h-4" />
                        Install App
                    </Button>
                    <Button onClick={handleDismiss} variant="outline">
                        Not Now
                    </Button>
                </div>
            </Card>
        </div>
    )
}
