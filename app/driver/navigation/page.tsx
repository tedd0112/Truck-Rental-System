import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createServerClient } from "@/lib/supabase-server"
import DriverNavigationMap from "@/components/driver/driver-navigation-map"

export default async function DriverNavigationPage() {
  const supabase = createServerClient()

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Mock data for the active job
  // In a real app, you would fetch this from your database
  const activeJob = {
    id: "job123",
    customer: "John Smith",
    pickup: {
      address: "123 Main St, Seattle, WA",
      lat: 47.6062,
      lng: -122.3321,
    },
    dropoff: {
      address: "456 Pine St, Seattle, WA",
      lat: 47.6152,
      lng: -122.3261,
    },
    status: "in-progress",
  }

  return (
    <div className="container py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Navigation</h1>
        <p className="text-muted-foreground">Navigate to pickup and dropoff locations</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Job: {activeJob.id.slice(0, 6)}</CardTitle>
          <CardDescription>Customer: {activeJob.customer}</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <DriverNavigationMap job={activeJob} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Pickup Location</CardTitle>
            <CardDescription>{activeJob.pickup.address}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estimated arrival time:</span>
                <span className="font-medium">15 minutes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Distance:</span>
                <span className="font-medium">3.2 miles</span>
              </div>
              <Button className="w-full">Navigate to Pickup</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dropoff Location</CardTitle>
            <CardDescription>{activeJob.dropoff.address}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estimated arrival time:</span>
                <span className="font-medium">35 minutes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Distance:</span>
                <span className="font-medium">7.5 miles</span>
              </div>
              <Button className="w-full" variant="outline">
                Navigate to Dropoff
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
