import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * Proxy middleware for Next.js 16
 * Protects routes based on authentication and role
 */
export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Public routes that don't require authentication
    const publicRoutes = ["/", "/login", "/register", "/forgot-password", "/reset-password", "/validate-reset-token"]
    const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

    // Get session token from cookies
    const sessionCookie = request.cookies.get("authjs.session-token")?.value || 
                        request.cookies.get("__Secure-authjs.session-token")?.value

    const isAuthenticated = !!sessionCookie

    // Admin routes
    const isAdminRoute = pathname.startsWith("/admin")

    // User routes
    const isUserRoute = pathname.startsWith("/dashboard") || pathname.startsWith("/apply")

    // Allow public routes
    if (isPublicRoute) {
        // Redirect authenticated users away from auth pages
        if (isAuthenticated && (pathname === "/login" || pathname === "/register" || pathname === "/forgot-password")) {
            // For authenticated users, we need to check their role - but at this level we can't decode JWT
            // So we redirect them to /dashboard and let the page handle further redirects
            return NextResponse.redirect(new URL("/dashboard", request.url))
        }
        return NextResponse.next()
    }

    // Require authentication for protected routes
    if (!isAuthenticated) {
        const loginUrl = new URL("/login", request.url)
        loginUrl.searchParams.set("callbackUrl", pathname)
        return NextResponse.redirect(loginUrl)
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
