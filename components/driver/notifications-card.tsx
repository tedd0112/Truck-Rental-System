"use client"

import { Button } from "@/components/ui/button"
import { Bell, MessageSquare, Star, Truck } from "lucide-react"

export default function NotificationsCard() {
  // Mock data for notifications
  // In a real app, you would fetch this from your database
  const notifications = [
    {
      id: "notif1",
      type: "message",
      content: "New message from Emily Johnson",
      time: "10 minutes ago",
      icon: MessageSquare,
      color: "text-blue-500",
    },
    {
      id: "notif2",
      type: "job",
      content: "New job available in your area",
      time: "1 hour ago",
      icon: Truck,
      color: "text-green-500",
    },
    {
      id: "notif3",
      type: "rating",
      content: "You received a 5-star rating from Michael Brown",
      time: "Yesterday",
      icon: Star,
      color: "text-yellow-500",
    },
  ]

  if (notifications.length === 0) {
    return (
      <div className="text-center py-8">
        <Bell className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
        <p className="text-muted-foreground">No new notifications</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <div key={notification.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
          <div className={`p-2 rounded-full bg-muted ${notification.color} bg-opacity-10`}>
            <notification.icon className={`h-4 w-4 ${notification.color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm">{notification.content}</p>
            <p className="text-xs text-muted-foreground">{notification.time}</p>
          </div>
        </div>
      ))}
      <div className="text-center pt-2">
        <Button variant="ghost" size="sm">
          View All Notifications
        </Button>
      </div>
    </div>
  )
}
