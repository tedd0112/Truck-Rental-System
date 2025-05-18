import { createServerClient } from "@/lib/supabase-server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { Briefcase, Clock, DollarSign, Star, TrendingUp } from "lucide-react"
import UpcomingJobsList from "@/components/driver/upcoming-jobs-list"
import JobStatusCard from "@/components/driver/job-status-card"
import NotificationsCard from "@/components/driver/notifications-card"

export default async function DriverDashboard() {
  const supabase = createServerClient()

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get the user's profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user?.id).single()

  // Mock data for the dashboard
  // In a real app, you would fetch this from your database
  const stats = {
    totalJobs: 24,
    completedJobs: 18,
    totalEarnings: 2450.75,
    rating: 4.8,
    activeJob: {
      id: "job123",
      status: "in-progress",
      customer: "John Smith",
      pickup: "123 Main St, Seattle, WA",
      dropoff: "456 Pine St, Seattle, WA",
      startTime: new Date(),
      estimatedEndTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    },
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome, {profile?.first_name || "Driver"}</h1>
          <p className="text-muted-foreground">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
        <Badge variant="outline" className="text-sm py-1">
          <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
          On Duty
        </Badge>
      </div>

      {/* Active Job Status */}
      <JobStatusCard job={stats.activeJob} />

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <Briefcase className="h-8 w-8 text-blue-500 mb-2" />
            <p className="text-sm text-muted-foreground">Total Jobs</p>
            <h3 className="text-2xl font-bold">{stats.totalJobs}</h3>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <Clock className="h-8 w-8 text-green-500 mb-2" />
            <p className="text-sm text-muted-foreground">Completed</p>
            <h3 className="text-2xl font-bold">{stats.completedJobs}</h3>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <DollarSign className="h-8 w-8 text-yellow-500 mb-2" />
            <p className="text-sm text-muted-foreground">Earnings</p>
            <h3 className="text-2xl font-bold">{formatCurrency(stats.totalEarnings)}</h3>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <Star className="h-8 w-8 text-purple-500 mb-2" />
            <p className="text-sm text-muted-foreground">Rating</p>
            <h3 className="text-2xl font-bold">{stats.rating}</h3>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upcoming Jobs */}
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Upcoming Jobs</CardTitle>
            <CardDescription>Your scheduled hauling jobs</CardDescription>
          </CardHeader>
          <CardContent>
            <UpcomingJobsList />
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Notifications</CardTitle>
            <CardDescription>Recent updates and alerts</CardDescription>
          </CardHeader>
          <CardContent>
            <NotificationsCard />
          </CardContent>
        </Card>
      </div>

      {/* Weekly Earnings Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Weekly Earnings</CardTitle>
          <CardDescription>Your earnings for the past 7 days</CardDescription>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <div className="flex flex-col items-center text-muted-foreground">
            <TrendingUp className="h-12 w-12 mb-4 opacity-50" />
            <p>Earnings chart will appear here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
