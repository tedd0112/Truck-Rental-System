"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Truck, Calendar, MapPin, CreditCard, Clock, ArrowLeft } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import TruckLocationMap from "@/components/trucks/truck-location-map"

interface BookingDetailPageProps {
  params: {
    bookingId: string
  }
}

export default function BookingDetailPage({ params }: BookingDetailPageProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  // Mock booking data
  const booking = {
    id: params.bookingId,
    truckId: "truck123",
    truckName: "Heavy Duty Moving Truck",
    userId: "user123",
    startDate: new Date("2023-08-15"),
    endDate: new Date("2023-08-18"),
    totalCost: 389.97,
    status: "confirmed",
    pickupLocation: {
      address: "123 Main St, Seattle, WA",
      lat: 47.6062,
      lng: -122.3321,
    },
    dropoffLocation: {
      address: "456 Pine St, Seattle, WA",
      lat: 47.6102,
      lng: -122.3426,
    },
    paymentId: "pay_123456",
    createdAt: new Date("2023-08-01"),
  }

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
    } else {
      // Simulate loading
      setTimeout(() => {
        setIsLoading(false)
      }, 1000)
    }
  }, [user, loading, router])

  if (loading || isLoading) {
    return (
      <div className="container py-8 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-green-100 text-green-800",
    completed: "bg-blue-100 text-blue-800",
    cancelled: "bg-red-100 text-red-800",
  }

  const days = Math.ceil((booking.endDate.getTime() - booking.startDate.getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className="container py-8">
      <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="flex flex-col md:flex-row justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold">Booking #{booking.id.slice(0, 8)}</h1>
          <p className="text-muted-foreground">Created on {formatDate(booking.createdAt)}</p>
        </div>
        <div
          className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[booking.status as keyof typeof statusColors]}`}
        >
          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Booking Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Pickup Date</h4>
                    <p className="text-muted-foreground">{formatDate(booking.startDate)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Return Date</h4>
                    <p className="text-muted-foreground">{formatDate(booking.endDate)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Duration</h4>
                    <p className="text-muted-foreground">{days} days</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-3">Pickup Location</h4>
                <div className="mb-3 flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-muted-foreground">{booking.pickupLocation.address}</span>
                </div>
                <TruckLocationMap location={booking.pickupLocation} />
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-3">Return Location</h4>
                <div className="mb-3 flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-muted-foreground">{booking.dropoffLocation.address}</span>
                </div>
                <TruckLocationMap location={booking.dropoffLocation} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment ID</span>
                <span>{booking.paymentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Method</span>
                <div className="flex items-center">
                  <CreditCard className="h-4 w-4 mr-2" />
                  <span>Credit Card (•••• 4242)</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Status</span>
                <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                  Paid
                </Badge>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Daily Rate</span>
                  <span>{formatCurrency(booking.totalCost / days)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration</span>
                  <span>{days} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(booking.totalCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service Fee</span>
                  <span>{formatCurrency(booking.totalCost * 0.1)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(booking.totalCost * 1.1)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Truck Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Truck className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold">{booking.truckName}</h4>
                  <p className="text-sm text-muted-foreground">ID: {booking.truckId}</p>
                </div>
              </div>

              <Button className="w-full" asChild>
                <a href={`/trucks/${booking.truckId}`}>View Truck Details</a>
              </Button>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
              <CardDescription>Contact our support team for assistance with your booking.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full" asChild>
                <a href="/support">Contact Support</a>
              </Button>

              {booking.status === "pending" || booking.status === "confirmed" ? (
                <Button variant="destructive" className="w-full">
                  Cancel Booking
                </Button>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
