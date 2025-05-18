"use client"

import { formatDate } from "@/lib/utils"
import { CheckCircle } from "lucide-react"

interface JobTimelineProps {
  timeline: {
    time: Date
    status: string
    description: string
  }[]
}

export default function JobTimeline({ timeline }: JobTimelineProps) {
  return (
    <div className="space-y-4">
      {timeline.map((item, index) => (
        <div key={index} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-blue-600" />
            </div>
            {index < timeline.length - 1 && <div className="w-0.5 h-full bg-blue-100 mt-1"></div>}
          </div>
          <div className="flex-1 pb-4">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-1">
              <h4 className="font-medium">{item.status}</h4>
              <span className="text-sm text-muted-foreground">{formatDate(item.time, { includeTime: true })}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
