import { notFound } from "next/navigation"
import { createServerClient } from "@/lib/supabase-server"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { formatCurrency, formatDate } from "@/lib/utils"
import {
  ArrowLeft,
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  MessageSquare,
  Navigation,
  Package,
  Phone,
  User,
} from "lucide-react"
import Link from "next/link"
import JobMap from "@/components/driver/job-map"
import JobTimeline from "@/components/driver/job-timeline"
import JobActions from "@/components/driver/job-actions"

interface JobDetailPageProps {
  params: {
    jobId: string
  }
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { jobId } = params
  const supabase = createServerClient()

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // In a real app, you would fetch the job details from your database
  // For now, we'll use mock data
  const job = {
    id: jobId,
    customer: {
      name: "John Smith",
      phone: "(555) 123-4567",
      rating: 4.8,
    },
    pickup: {
      address: "123 Main St, Seattle, WA",
      lat: 47.6062,
      lng: -122.3321,
      time: new Date(),
    },
    dropoff: {
      address: "456 Pine St, Seattle, WA",
      lat: 47.6152,
      lng: -122.3261,
      time: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    },
    status: "in-progress",
    amount: 120.5,
    cargo: {
      type: "Furniture",
      weight: "250 lbs",
      dimensions: "Large sofa, dining table, 4 chairs",
      notes: "Handle with care. Customer will help with unloading.",
    },
    timeline: [
      {
        time: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        status: "Job accepted",
        description: "You accepted this job",
      },
      {
        time: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
        status: "Arrived at pickup",
        description: "You arrived at the pickup location",
      },
      {
        time: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
        status: "Loading started",
        description: "Started loading cargo",
      },
      {
        time: new Date(), // Now
        status: "In transit",
        description: "En route to dropoff location",
      },
    ],
  }

  if (!job) {
    notFound()
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/driver/jobs">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Job Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Job Status Card */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Job #{jobId.slice(0, 6)}</CardTitle>
                  <CardDescription>{formatDate(job.pickup.time)}</CardDescription>
                </div>
                <Badge
                  variant={
                    job.status === "in-progress"
                      ? "default"
                      : job.status === "scheduled"
                        ? "secondary"
                        : job.status === "available"
                          ? "outline"
                          : "success"
                  }
                >
                  {job.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <User className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Customer</p>
                      <p className="text-sm text-muted-foreground">{job.customer.name}</p>
                      <p className="text-sm text-muted-foreground">{job.customer.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Package className="h-5 w-5 text-purple-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Cargo</p>
                      <p className="text-sm text-muted-foreground">{job.cargo.type}</p>
                      <p className="text-sm text-muted-foreground">Weight: {job.cargo.weight}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <DollarSign className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Payment</p>
                      <p className="text-sm text-muted-foreground">{formatCurrency(job.amount)}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-5 w-5 text-red-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Pickup</p>
                      <p className="text-sm text-muted-foreground">{job.pickup.address}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(job.pickup.time, { includeTime: true })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Dropoff</p>
                      <p className="text-sm text-muted-foreground">{job.dropoff.address}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(job.dropoff.time, { includeTime: true })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium mb-2">Cargo Details</h3>
                <p className="text-sm text-muted-foreground mb-1">
                  <span className="font-medium">Dimensions:</span> {job.cargo.dimensions}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Notes:</span> {job.cargo.notes}
                </p>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/50 px-6 py-3">
              <div className="flex justify-between w-full">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="h-9">
                    <Phone className="h-4 w-4 mr-2" />
                    Call
                  </Button>
                  <Button variant="outline" size="sm" className="h-9">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                </div>
                <Button className="h-9">
                  <Navigation className="h-4 w-4 mr-2" />
                  Navigate
                </Button>
              </div>
            </CardFooter>
          </Card>

          {/* Map */}
          <Card>
            <CardHeader>
              <CardTitle>Route</CardTitle>
              <CardDescription>Pickup and dropoff locations</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <JobMap pickup={job.pickup} dropoff={job.dropoff} />
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Job Timeline</CardTitle>
              <CardDescription>Track the progress of this job</CardDescription>
            </CardHeader>
            <CardContent>
              <JobTimeline timeline={job.timeline} />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          {/* Job Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Job Actions</CardTitle>
              <CardDescription>Update the status of this job</CardDescription>
            </CardHeader>
            <CardContent>
              <JobActions jobId={jobId} currentStatus={job.status} />
            </CardContent>
          </Card>

          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
              <CardDescription>Contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">{job.customer.name}</p>
                  <div className="flex items-center gap-1">
                    <p className="text-sm text-muted-foreground">Rating:</p>
                    <div className="flex items-center">
                      <span className="text-sm font-medium">{job.customer.rating}</span>
                      <span className="text-yellow-500 ml-1">★</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Phone className="h-4 w-4 mr-2" />
                  {job.customer.phone}
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Estimated Time */}
          <Card>
            <CardHeader>
              <CardTitle>Estimated Time</CardTitle>
              <CardDescription>Job duration and ETA</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">Duration</span>
                </div>
                <span>2 hours</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-green-500" />
                  <span className="font-medium">ETA</span>
                </div>
                <span>{formatDate(job.dropoff.time, { includeTime: true })}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
