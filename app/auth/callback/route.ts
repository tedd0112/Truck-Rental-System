import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    try {
      const cookieStore = cookies()
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

      // Exchange the code for a session
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error("Error exchanging code for session:", error)
        return NextResponse.redirect(requestUrl.origin + "/auth/login?error=auth_callback_error")
      }
    } catch (err) {
      console.error("Error in auth callback:", err)
      return NextResponse.redirect(requestUrl.origin + "/auth/login?error=auth_callback_error")
    }
  }

  // Redirect to auth redirect page which will handle user type checking
  return NextResponse.redirect(requestUrl.origin + "/auth/redirect")
}
