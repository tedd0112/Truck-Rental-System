"use client"

import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin } from "lucide-react"
import { formatDate } from "@/lib/utils"

export default function UpcomingJobsList() {
  // Mock data for upcoming jobs
  // In a real app, you would fetch this from your database
  const upcomingJobs = [
    {
      id: "job456",
      customer: "Emily Johnson",
      pickup: "789 Oak St, Seattle, WA",
      dropoff: "101 Pine St, Seattle, WA",
      scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      estimatedDuration: "2 hours",
    },
    {
      id: "job789",
      customer: "Michael Brown",
      pickup: "222 Elm St, Seattle, WA",
      dropoff: "333 Cedar St, Seattle, WA",
      scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
      estimatedDuration: "3 hours",
    },
  ]

  if (upcomingJobs.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">No upcoming jobs scheduled</p>
        <Button variant="outline">Find Jobs</Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {upcomingJobs.map((job) => (
        <div key={job.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-medium">{job.customer}</h4>
            <Button variant="ghost" size="sm" className="h-8">
              View
            </Button>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(job.scheduledDate)}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Est. Duration: {job.estimatedDuration}</span>
            </div>
            <div className="flex items-start gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 mt-0.5" />
              <div>
                <p>Pickup: {job.pickup}</p>
                <p>Dropoff: {job.dropoff}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
