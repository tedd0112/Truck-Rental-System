"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Calendar, Clock, DollarSign, MapPin, Package, User } from "lucide-react"

interface JobsListProps {
  type: "active" | "upcoming" | "available" | "completed"
}

export default function JobsList({ type }: JobsListProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  // Mock data for jobs
  // In a real app, you would fetch this from your database
  const mockJobs = {
    active: [
      {
        id: "job123",
        customer: "John Smith",
        pickup: "123 Main St, Seattle, WA",
        dropoff: "456 Pine St, Seattle, WA",
        date: new Date(),
        status: "in-progress",
        amount: 120.5,
        cargo: "Furniture",
      },
    ],
    upcoming: [
      {
        id: "job456",
        customer: "Emily Johnson",
        pickup: "789 Oak St, Seattle, WA",
        dropoff: "101 Pine St, Seattle, WA",
        date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        status: "scheduled",
        amount: 95.75,
        cargo: "Moving boxes",
      },
      {
        id: "job789",
        customer: "Michael Brown",
        pickup: "222 Elm St, Seattle, WA",
        dropoff: "333 Cedar St, Seattle, WA",
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
        status: "scheduled",
        amount: 150.25,
        cargo: "Construction materials",
      },
    ],
    available: [
      {
        id: "job101",
        customer: "Sarah Wilson",
        pickup: "444 Maple St, Seattle, WA",
        dropoff: "555 Birch St, Seattle, WA",
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        status: "available",
        amount: 110.0,
        cargo: "Appliances",
      },
      {
        id: "job102",
        customer: "David Lee",
        pickup: "666 Spruce St, Seattle, WA",
        dropoff: "777 Fir St, Seattle, WA",
        date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
        status: "available",
        amount: 85.5,
        cargo: "Electronics",
      },
      {
        id: "job103",
        customer: "Jennifer Garcia",
        pickup: "888 Redwood St, Seattle, WA",
        dropoff: "999 Sequoia St, Seattle, WA",
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        status: "available",
        amount: 130.75,
        cargo: "Retail merchandise",
      },
    ],
    completed: [
      {
        id: "job001",
        customer: "Robert Martinez",
        pickup: "111 Walnut St, Seattle, WA",
        dropoff: "222 Chestnut St, Seattle, WA",
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        status: "completed",
        amount: 105.25,
        cargo: "Office furniture",
      },
      {
        id: "job002",
        customer: "Lisa Thompson",
        pickup: "333 Hickory St, Seattle, WA",
        dropoff: "444 Ash St, Seattle, WA",
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        status: "completed",
        amount: 95.0,
        cargo: "Home goods",
      },
    ],
  }

  const jobs = mockJobs[type]

  const handleAcceptJob = async (jobId: string) => {
    setIsLoading(true)
    // In a real app, you would call your API to accept the job
    await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call
    setIsLoading(false)
    router.refresh()
  }

  const handleViewJob = (jobId: string) => {
    router.push(`/driver/jobs/${jobId}`)
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">No {type} jobs found</p>
        {type === "available" && <Button variant="outline">Find Jobs</Button>}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <div key={job.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium">{job.cargo}</h4>
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
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>{job.customer}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <span className="font-semibold">{formatCurrency(job.amount)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(job.date)}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Est. Duration: 2 hours</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Package className="h-4 w-4" />
                <span>Cargo: {job.cargo}</span>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 text-red-500" />
                <div>
                  <p className="font-medium text-foreground">Pickup</p>
                  <p>{job.pickup}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 text-green-500" />
                <div>
                  <p className="font-medium text-foreground">Dropoff</p>
                  <p>{job.dropoff}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            {type === "available" && (
              <Button onClick={() => handleAcceptJob(job.id)} disabled={isLoading}>
                {isLoading ? "Accepting..." : "Accept Job"}
              </Button>
            )}
            <Button variant="outline" onClick={() => handleViewJob(job.id)}>
              View Details
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
