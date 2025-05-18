"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { MapPin, Phone, MessageSquare, Navigation } from "lucide-react"
import { useState } from "react"

interface JobStatusCardProps {
  job: {
    id: string
    status: string
    customer: string
    pickup: string
    dropoff: string
    startTime: Date
    estimatedEndTime: Date
  } | null
}

export default function JobStatusCard({ job }: JobStatusCardProps) {
  const [progress, setProgress] = useState(35)

  if (!job) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No active jobs at the moment</p>
          <Button variant="outline" className="mt-4">
            Find Jobs
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Calculate time remaining
  const totalDuration = job.estimatedEndTime.getTime() - job.startTime.getTime()
  const elapsed = Date.now() - job.startTime.getTime()
  const percentComplete = Math.min(100, Math.round((elapsed / totalDuration) * 100))

  // Format time remaining
  const msRemaining = Math.max(0, job.estimatedEndTime.getTime() - Date.now())
  const hoursRemaining = Math.floor(msRemaining / (1000 * 60 * 60))
  const minutesRemaining = Math.floor((msRemaining % (1000 * 60 * 60)) / (1000 * 60))

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div>
            <h3 className="font-semibold text-lg mb-1">Current Job: Delivery in Progress</h3>
            <p className="text-muted-foreground mb-4">Customer: {job.customer}</p>

            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Pickup</p>
                  <p className="text-sm text-muted-foreground">{job.pickup}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Dropoff</p>
                  <p className="text-sm text-muted-foreground">{job.dropoff}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className="text-center mb-2">
              <p className="text-sm text-muted-foreground">Estimated Time Remaining</p>
              <p className="text-2xl font-bold">
                {hoursRemaining}h {minutesRemaining}m
              </p>
            </div>
            <div className="w-full max-w-[200px]">
              <Progress value={percentComplete} className="h-2" />
              <div className="flex justify-between mt-1">
                <span className="text-xs text-muted-foreground">Pickup</span>
                <span className="text-xs text-muted-foreground">Dropoff</span>
              </div>
            </div>
          </div>
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
  )
}
