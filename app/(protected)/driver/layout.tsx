import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase-server"
import DriverMobileNav from "@/components/driver/driver-mobile-nav"
import DriverSidebar from "@/components/driver/driver-sidebar"

export default async function DriverLayout({ children }: { children: ReactNode }) {
  // Create a Supabase client for server components
  const supabase = createServerClient()

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If no user is logged in, redirect to login
  if (!user) {
    redirect("/auth/login")
  }

  // Check if the user is a driver
  const { data: profile } = await supabase.from("profiles").select("user_type").eq("id", user.id).single()

  // If the user is not a driver, redirect to passenger dashboard
  if (!profile || profile.user_type !== "driver") {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1">
        {/* Sidebar for desktop */}
        <DriverSidebar className="hidden md:flex" />

        {/* Main content */}
        <main className="flex-1 overflow-x-hidden pb-16 md:pb-0">{children}</main>
      </div>

      {/* Mobile navigation */}
      <DriverMobileNav className="fixed bottom-0 left-0 right-0 z-50 md:hidden" />
    </div>
  )
}
