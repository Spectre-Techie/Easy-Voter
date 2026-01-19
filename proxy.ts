import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/lib/auth"

/**
 * Proxy middleware for Next.js 16
 * Protects routes based on authentication and role
 */
export async function proxy(request: NextRequest) {
    const session = await auth()
    const { pathname } = request.nextUrl

    // Public routes that don't require authentication
    const publicRoutes = ["/", "/login", "/register", "/forgot-password"]
    const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

    // Admin routes
    const isAdminRoute = pathname.startsWith("/admin")

    // User routes
    const isUserRoute = pathname.startsWith("/dashboard") || pathname.startsWith("/apply")

    // Allow public routes
    if (isPublicRoute) {
        // Redirect authenticated users away from auth pages
        if (session?.user && (pathname === "/login" || pathname === "/register")) {
            const redirectUrl = session.user.role === "ADMIN"
                ? "/admin/dashboard"
                : "/dashboard"
            return NextResponse.redirect(new URL(redirectUrl, request.url))
        }
        return NextResponse.next()
    }

    // Require authentication for protected routes
    if (!session || !session.user) {
        const loginUrl = new URL("/login", request.url)
        loginUrl.searchParams.set("callbackUrl", pathname)
        return NextResponse.redirect(loginUrl)
    }

    // Admin route protection
    if (isAdminRoute) {
        if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
            return NextResponse.redirect(new URL("/dashboard", request.url))
        }
    }

    // User route protection (block admins from accessing user routes)
    if (isUserRoute) {
        if (session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN") {
            return NextResponse.redirect(new URL("/admin/dashboard", request.url))
        }
    }

    return NextResponse.next()
}

// Configure which routes the middleware should run on
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api/auth (NextAuth routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
}
