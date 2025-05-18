import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Create a new middleware client for each request
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Auth routes handling
  if (req.nextUrl.pathname.startsWith("/auth")) {
    // If user is logged in and trying to access auth pages, redirect to dashboard
    if (
      session &&
      !req.nextUrl.pathname.startsWith("/auth/redirect") &&
      !req.nextUrl.pathname.startsWith("/auth/callback")
    ) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
  }

  // Protected routes handling
  if (
    req.nextUrl.pathname.startsWith("/dashboard") ||
    req.nextUrl.pathname.startsWith("/profile") ||
    req.nextUrl.pathname.startsWith("/bookings") ||
    req.nextUrl.pathname.startsWith("/trucks/register")
  ) {
    if (!session) {
      return NextResponse.redirect(new URL("/auth/login", req.url))
    }
  }

  // Driver app routes
  if (req.nextUrl.pathname.startsWith("/driver")) {
    if (!session) {
      return NextResponse.redirect(new URL("/auth/login", req.url))
    }

    // Check if user is a driver
    try {
      const { data: profile } = await supabase.from("profiles").select("user_type").eq("id", session.user.id).single()

      if (!profile || profile.user_type !== "driver") {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
    } catch (error) {
      console.error("Error checking user type:", error)
      // If there's an error (like table doesn't exist), redirect to dashboard
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
  }

  return res
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/bookings/:path*",
    "/trucks/register/:path*",
    "/auth/:path*",
    "/driver/:path*",
    "/api/((?!maps).*)",
  ],
}
