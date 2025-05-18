"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function AuthRedirectPage() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function checkUserAndRedirect() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push("/auth/login")
          return
        }

        // Check if the user has a profile
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()

        if (profileError) {
          if (profileError.code === "PGRST116") {
            // Table doesn't exist
            setError("The database is not properly set up. Please contact an administrator.")
            setIsLoading(false)
            return
          }

          if (profileError.code === "PGRST104") {
            // No profile found, try to create one from user metadata
            const metadata = user.user_metadata

            if (metadata) {
              const newProfile = {
                id: user.id,
                email: user.email,
                first_name: metadata.first_name || metadata.given_name || "",
                last_name: metadata.last_name || metadata.family_name || "",
                user_type: metadata.user_type || "passenger",
                avatar_url: metadata.avatar_url || null,
              }

              const { error: insertError } = await supabase.from("profiles").insert(newProfile)

              if (!insertError) {
                // Successfully created profile, now redirect based on user type
                redirectBasedOnUserType(newProfile.user_type)
                return
              }
            }

            // If we couldn't create a profile, redirect to complete profile
            router.push("/profile/complete")
            return
          }

          // Some other error
          setError(`Error fetching profile: ${profileError.message}`)
          setIsLoading(false)
          return
        }

        // Profile exists, redirect based on user type
        redirectBasedOnUserType(profile.user_type)
      } catch (error: any) {
        console.error("Auth redirect error:", error)
        setError(error.message || "An unexpected error occurred")
        setIsLoading(false)
      }
    }

    function redirectBasedOnUserType(userType: string) {
      if (userType === "driver") {
        // Check if the driver has registered a truck
        checkDriverTruck()
      } else {
        // Passenger goes to dashboard
        router.push("/dashboard")
      }
    }

    async function checkDriverTruck() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push("/auth/login")
          return
        }

        // Check if the driver has any trucks registered
        const { data: trucks, error: trucksError } = await supabase
          .from("trucks")
          .select("id")
          .eq("owner_id", user.id)
          .limit(1)

        if (trucksError) {
          if (trucksError.code === "PGRST116") {
            // Table doesn't exist
            setError("The database is not properly set up. Please contact an administrator.")
            setIsLoading(false)
            return
          }

          // Some other error
          console.error("Error checking trucks:", trucksError)
        }

        if (!trucks || trucks.length === 0) {
          // No trucks registered, redirect to truck registration
          router.push("/trucks/register")
        } else {
          // Has trucks, redirect to driver dashboard
          router.push("/driver")
        }
      } catch (error: any) {
        console.error("Error checking driver trucks:", error)
        setError(error.message || "An unexpected error occurred")
        setIsLoading(false)
      }
    }

    checkUserAndRedirect()
  }, [router])

  if (error) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-8rem)] py-8">
        <Alert variant="destructive" className="max-w-md">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
            <div className="mt-4">
              <button onClick={() => router.push("/auth/login")} className="text-sm font-medium underline">
                Return to login
              </button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] py-8">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground">Redirecting to the appropriate page...</p>
    </div>
  )
}
