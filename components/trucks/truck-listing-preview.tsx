import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Truck } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface TruckListingPreviewProps {
  truck: {
    id: string
    name: string
    description: string
    capacity: number
    dailyRate: number
    imageUrl: string
    location: {
      address: string
      lat: number
      lng: number
    }
    features: string[]
    availability: boolean
  }
}

export default function TruckListingPreview({ truck }: TruckListingPreviewProps) {
  return (
    <Link href={`/trucks/${truck.id}`}>
      <Card className="overflow-hidden h-full transition-all hover:shadow-md">
        <div className="relative h-48 w-full">
          <Image src={truck.imageUrl || "/placeholder.svg"} alt={truck.name} fill className="object-cover" />
        </div>
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold line-clamp-1">{truck.name}</h3>
            <Badge variant={truck.availability ? "default" : "secondary"}>
              {truck.availability ? "Available" : "Unavailable"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{truck.description}</p>
          <div className="flex items-center text-sm text-muted-foreground mb-4">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{truck.location.address}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {truck.features.slice(0, 3).map((feature, index) => (
              <Badge key={index} variant="outline">
                {feature}
              </Badge>
            ))}
            {truck.features.length > 3 && <Badge variant="outline">+{truck.features.length - 3} more</Badge>}
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between items-center">
          <div className="flex items-center">
            <Truck className="h-4 w-4 mr-1 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{truck.capacity} ft</span>
          </div>
          <div className="text-lg font-bold">
            {formatCurrency(truck.dailyRate)}
            <span className="text-sm font-normal text-muted-foreground">/day</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}
