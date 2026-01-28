import type { Metadata, Viewport } from "next"
import { Toaster } from "sonner"
import SessionProvider from "@/components/session-provider"
import Script from "next/script"
import "./globals.css"

export const metadata: Metadata = {
    title: "EasyVoter - Nigerian Voter Registration",
    description: "Secure, fast, and accessible voter registration system for Nigeria",
    manifest: "/manifest.json",
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "EasyVoter",
    },
    icons: {
        icon: [
            { url: "/icon.png", type: "image/png" },
            { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
            { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
        ],
        apple: [
            { url: "/apple-icon.png", type: "image/png" },
        ],
    },
    applicationName: "EasyVoter",
    formatDetection: {
        telephone: false,
    },
    other: {
        "mobile-web-app-capable": "yes",
    },
}


export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    themeColor: '#2563eb',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body>
                <SessionProvider>
                    {children}
                    <Toaster position="top-right" richColors />
                </SessionProvider>
                {/* Service Worker Registration */}
                <Script src="/register-sw.js" strategy="afterInteractive" />
            </body>
        </html>
    )
}
