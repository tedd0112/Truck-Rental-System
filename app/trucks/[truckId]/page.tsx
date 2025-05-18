import { Suspense } from "react"
import { notFound } from "next/navigation"
import Image from "next/image"
import { getTruckById } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { MapPin, Star, Shield, Info } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import TruckBookingForm from "@/components/trucks/truck-booking-form"
import TruckFeatures from "@/components/trucks/truck-features"
import TruckLocationMap from "@/components/trucks/truck-location-map"
import TruckReviews from "@/components/trucks/truck-reviews"

interface TruckDetailPageProps {
  params: {
    truckId: string
  }
}

export default async function TruckDetailPage({ params }: TruckDetailPageProps) {
  const truck = await getTruckById(params.truckId)

  if (!truck) {
    notFound()
  }

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold mb-4">{truck.name}</h1>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
              <span className="text-muted-foreground">{truck.location.address}</span>
            </div>
            <Badge variant={truck.availability ? "default" : "secondary"}>
              {truck.availability ? "Available" : "Unavailable"}
            </Badge>
          </div>

          <div className="relative h-[300px] md:h-[400px] w-full rounded-lg overflow-hidden mb-8">
            <Image
              src={truck.imageUrl || "/placeholder.svg?height=400&width=800"}
              alt={truck.name}
              fill
              className="object-cover"
            />
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Description</h2>
              <p className="text-muted-foreground">{truck.description}</p>
            </div>

            <Separator />

            <TruckFeatures features={truck.features} capacity={truck.capacity} />

            <Separator />

            <div>
              <h2 className="text-2xl font-semibold mb-4">Location</h2>
              <Suspense fallback={<div className="h-[300px] bg-muted rounded-lg animate-pulse"></div>}>
                <TruckLocationMap location={truck.location} />
              </Suspense>
            </div>

            <Separator />

            <TruckReviews truckId={truck.id} />
          </div>
        </div>

        <div>
          <Card className="sticky top-24">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="text-2xl font-bold">
                  {formatCurrency(truck.dailyRate)}
                  <span className="text-sm font-normal text-muted-foreground">/day</span>
                </div>
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  <span className="ml-1 font-semibold">4.8</span>
                  <span className="text-muted-foreground ml-1">(24 reviews)</span>
                </div>
              </div>

              <TruckBookingForm truck={truck} />

              <div className="mt-6 space-y-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Insurance Included</h4>
                    <p className="text-sm text-muted-foreground">Basic insurance is included with all rentals.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Free Cancellation</h4>
                    <p className="text-sm text-muted-foreground">
                      Cancel up to 48 hours before pickup for a full refund.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
