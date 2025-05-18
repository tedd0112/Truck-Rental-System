"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Truck, Calendar, User } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth()
  const [profile, setProfile] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

          if (error) {
            console.error("Error fetching profile:", error)
            // If the table doesn't exist, the user will be redirected to setup
            if (error.message.includes("does not exist")) {
              router.push("/auth/redirect")
              return
            }
          } else {
            setProfile(data)
          }
        } catch (error) {
          console.error("Error fetching profile:", error)
        } finally {
          setIsLoading(false)
        }
      }
    }

    if (user) {
      fetchProfile()
    }
  }, [user, router])

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  if (loading || isLoading) {
    return (
      <div className="container py-8 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Welcome</CardTitle>
            <CardDescription>
              {profile?.first_name ? `${profile.first_name} ${profile.last_name}` : user?.email}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground mb-4">
              Account Type:{" "}
              {profile?.user_type ? profile.user_type.charAt(0).toUpperCase() + profile.user_type.slice(1) : "User"}
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              Sign Out
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {profile?.user_type === "driver" ? (
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/trucks/register">
                  <Truck className="mr-2 h-4 w-4" />
                  Register a Truck
                </a>
              </Button>
            ) : (
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/trucks">
                  <Truck className="mr-2 h-4 w-4" />
                  Browse Trucks
                </a>
              </Button>
            )}
            <Button variant="outline" className="w-full justify-start" asChild>
              <a href="/bookings">
                <Calendar className="mr-2 h-4 w-4" />
                My Bookings
              </a>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <a href="/profile">
                <User className="mr-2 h-4 w-4" />
                Edit Profile
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="bookings">Recent Bookings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Getting Started</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Welcome to Smart Hauling! Here are some things you can do:</p>
                <ul className="space-y-2 list-disc pl-5">
                  <li>Browse available trucks for rental</li>
                  <li>Book a truck for your hauling needs</li>
                  <li>Track your bookings and rental history</li>
                  {profile?.user_type === "driver" && (
                    <li>Register your truck to earn money when you're not using it</li>
                  )}
                </ul>
              </CardContent>
              <CardFooter>
                <Button asChild>
                  <a href="/how-it-works">Learn More</a>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="bookings">
          <Card>
            <CardHeader>
              <CardTitle>Recent Bookings</CardTitle>
              <CardDescription>Your recent truck rental bookings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>You don't have any bookings yet.</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild>
                <a href="/trucks">Browse Trucks</a>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
