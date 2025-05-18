import { Truck, Check } from "lucide-react"

interface TruckFeaturesProps {
  features: string[]
  capacity: number
}

export default function TruckFeatures({ features, capacity }: TruckFeaturesProps) {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Features</h2>

      <div className="flex items-center mb-4">
        <Truck className="h-5 w-5 mr-2 text-blue-600" />
        <span className="font-medium">{capacity} ft Capacity</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {features.map((feature, index) => (
          <div key={index} className="flex items-center">
            <Check className="h-4 w-4 mr-2 text-green-600" />
            <span>{feature}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
