import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Truck, MapPin, Calendar, CreditCard, ArrowRight } from "lucide-react"
import TruckListingPreview from "@/components/trucks/truck-listing-preview"

export default function Home() {
  // Mock data for featured trucks
  const featuredTrucks = [
    {
      id: "1",
      name: "Heavy Duty Moving Truck",
      description: "Perfect for moving large items or a full house",
      capacity: 26,
      dailyRate: 129.99,
      imageUrl: "/placeholder.svg?height=300&width=400",
      location: {
        address: "Seattle, WA",
        lat: 47.6062,
        lng: -122.3321,
      },
      features: ["26ft Box", "Liftgate", "Ramp", "Automatic"],
      availability: true,
    },
    {
      id: "2",
      name: "Medium Cargo Van",
      description: "Ideal for small moves or deliveries",
      capacity: 12,
      dailyRate: 89.99,
      imageUrl: "/placeholder.svg?height=300&width=400",
      location: {
        address: "Portland, OR",
        lat: 45.5152,
        lng: -122.6784,
      },
      features: ["12ft Box", "Easy to Drive", "Fuel Efficient"],
      availability: true,
    },
    {
      id: "3",
      name: "Pickup Truck with Trailer",
      description: "Great for hauling materials for home projects",
      capacity: 8,
      dailyRate: 79.99,
      imageUrl: "/placeholder.svg?height=300&width=400",
      location: {
        address: "San Francisco, CA",
        lat: 37.7749,
        lng: -122.4194,
      },
      features: ["8ft Bed", "5ft Trailer", "4x4", "Towing Package"],
      availability: true,
    },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section with Registration CTA */}
      <section className="relative py-20 md:py-32 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">Rent the Perfect Truck for Your Hauling Needs</h1>
              <p className="text-xl md:text-2xl mb-8 text-blue-100">
                Smart, automated truck rentals that make hauling simple and efficient.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild className="bg-white text-blue-700 hover:bg-blue-50">
                  <Link href="/auth/register">Sign Up Now</Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="border-white text-white hover:bg-white/10">
                  <Link href="/how-it-works">How It Works</Link>
                </Button>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="bg-white/10 backdrop-blur-sm p-8 rounded-lg">
                <h2 className="text-2xl font-bold mb-4">Join Smart Hauling Today</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-white/20 p-2 rounded-full mt-1">
                      <Truck className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Register as a Driver</h3>
                      <p className="text-sm text-blue-100">List your truck and earn money when you're not using it</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-white/20 p-2 rounded-full mt-1">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Register as a Passenger</h3>
                      <p className="text-sm text-blue-100">Find and book trucks for your hauling needs</p>
                    </div>
                  </div>
                </div>
                <Button asChild className="w-full mt-6 bg-white text-blue-700 hover:bg-blue-50">
                  <Link href="/auth/register" className="flex items-center justify-center gap-2">
                    Get Started <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 bg-blue-900/20 backdrop-blur-sm"></div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="bg-blue-100 p-4 rounded-full mb-4">
                <MapPin className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Find a Truck</h3>
              <p className="text-muted-foreground">
                Search for available trucks in your area based on your hauling needs.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="bg-blue-100 p-4 rounded-full mb-4">
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Book Your Rental</h3>
              <p className="text-muted-foreground">Select your dates and complete the booking process online.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="bg-blue-100 p-4 rounded-full mb-4">
                <CreditCard className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Pay Securely</h3>
              <p className="text-muted-foreground">Make a secure payment and receive your rental confirmation.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="bg-blue-100 p-4 rounded-full mb-4">
                <Truck className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Pick Up & Go</h3>
              <p className="text-muted-foreground">Pick up your truck at the designated location and start hauling.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Trucks Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Featured Trucks</h2>
            <Button asChild variant="outline">
              <Link href="/trucks">View All</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredTrucks.map((truck) => (
              <TruckListingPreview key={truck.id} truck={truck} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="bg-blue-600 rounded-xl p-8 md:p-12 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Join our platform today and experience the easiest way to rent trucks for your hauling needs or earn money
              by listing your truck.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="bg-white text-blue-700 hover:bg-blue-50">
                <Link href="/auth/register">Sign Up Now</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-white text-white hover:bg-white/10">
                <Link href="/auth/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">What Our Customers Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-background p-6 rounded-lg shadow-sm border">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                  <span className="text-blue-600 font-bold">JD</span>
                </div>
                <div>
                  <h3 className="font-semibold">John Doe</h3>
                  <p className="text-sm text-muted-foreground">Seattle, WA</p>
                </div>
              </div>
              <p className="text-muted-foreground">
                "The truck was in perfect condition and the pickup process was seamless. I'll definitely be using Smart
                Hauling again for my next move!"
              </p>
            </div>
            <div className="bg-background p-6 rounded-lg shadow-sm border">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                  <span className="text-blue-600 font-bold">JS</span>
                </div>
                <div>
                  <h3 className="font-semibold">Jane Smith</h3>
                  <p className="text-sm text-muted-foreground">Portland, OR</p>
                </div>
              </div>
              <p className="text-muted-foreground">
                "I was able to find the perfect truck for my home renovation project. The booking process was easy and
                the price was very reasonable."
              </p>
            </div>
            <div className="bg-background p-6 rounded-lg shadow-sm border">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                  <span className="text-blue-600 font-bold">RJ</span>
                </div>
                <div>
                  <h3 className="font-semibold">Robert Johnson</h3>
                  <p className="text-sm text-muted-foreground">San Francisco, CA</p>
                </div>
              </div>
              <p className="text-muted-foreground">
                "As a truck owner, I've been able to earn extra income by renting out my truck when I'm not using it.
                The platform makes it easy to manage bookings."
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
