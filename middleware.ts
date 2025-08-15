import { type NextRequest, NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/login", "/register"]
  const isPublicRoute = publicRoutes.includes(pathname)

  // API routes that don't require authentication
  const publicApiRoutes = ["/api/auth/login", "/api/auth/register"]
  const isPublicApiRoute = publicApiRoutes.some((route) => pathname.startsWith(route))

  // Skip middleware for public routes and API routes
  if (isPublicRoute || isPublicApiRoute) {
    return NextResponse.next()
  }

  // Check authentication for protected routes
  const sessionToken = request.cookies.get("session")?.value

  if (!sessionToken) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Verify session
  try {
    const user = await getSessionUser(sessionToken)
    if (!user) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Invalid session" }, { status: 401 })
      }
      return NextResponse.redirect(new URL("/login", request.url))
    }
  } catch (error) {
    console.error("Middleware auth error:", error)
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Authentication error" }, { status: 500 })
    }
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
}
