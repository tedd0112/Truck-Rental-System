"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { CheckCircle, Clock, FileText, MapPin, Package, Truck, Upload } from "lucide-react"

interface JobActionsProps {
  jobId: string
  currentStatus: string
}

export default function JobActions({ jobId, currentStatus }: JobActionsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [notes, setNotes] = useState("")

  const handleUpdateStatus = async (newStatus: string) => {
    setIsLoading(true)
    // In a real app, you would call your API to update the job status
    await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call
    setIsLoading(false)
    router.refresh()
  }

  const getAvailableActions = () => {
    switch (currentStatus) {
      case "scheduled":
        return [
          {
            label: "Start Job",
            icon: Truck,
            action: () => handleUpdateStatus("in-progress"),
            primary: true,
          },
          {
            label: "Cancel Job",
            icon: Clock,
            action: () => handleUpdateStatus("cancelled"),
            primary: false,
          },
        ]
      case "in-progress":
        return [
          {
            label: "Arrived at Pickup",
            icon: MapPin,
            action: () => handleUpdateStatus("at-pickup"),
            primary: true,
          },
          {
            label: "Loading Complete",
            icon: Package,
            action: () => handleUpdateStatus("loading-complete"),
            primary: false,
          },
          {
            label: "Arrived at Dropoff",
            icon: MapPin,
            action: () => handleUpdateStatus("at-dropoff"),
            primary: false,
          },
        ]
      case "at-dropoff":
        return [
          {
            label: "Complete Job",
            icon: CheckCircle,
            action: () => handleUpdateStatus("completed"),
            primary: true,
          },
        ]
      default:
        return [
          {
            label: "Update Status",
            icon: Clock,
            action: () => handleUpdateStatus("updated"),
            primary: true,
          },
        ]
    }
  }

  const actions = getAvailableActions()

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-2">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant={action.primary ? "default" : "outline"}
            className="w-full justify-start"
            onClick={action.action}
            disabled={isLoading}
          >
            <action.icon className="h-4 w-4 mr-2" />
            {action.label}
          </Button>
        ))}
      </div>

      <div className="pt-4 border-t">
        <Label htmlFor="notes" className="mb-2 block">
          Add Notes
        </Label>
        <Textarea
          id="notes"
          placeholder="Add any notes about this job..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="mb-2"
        />
        <div className="flex justify-between">
          <Button variant="outline" size="sm" className="gap-1">
            <Upload className="h-4 w-4" />
            Add Photo
          </Button>
          <Button size="sm" disabled={!notes.trim()}>
            <FileText className="h-4 w-4 mr-2" />
            Save Notes
          </Button>
        </div>
      </div>
    </div>
  )
}
