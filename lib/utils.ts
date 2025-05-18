import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { supabase } from "./supabase"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export function formatDate(date: Date, options?: { includeTime?: boolean }): string {
  if (options?.includeTime) {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(date)
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date)
}

// Mock data for development when Supabase is not available
const mockTrucks = [
  {
    id: "1",
    name: "Heavy Duty Moving Truck",
    description: "Perfect for moving large items or a full house",
    capacity: 26,
    daily_rate: 129.99,
    image_url: "/placeholder.svg?height=300&width=400",
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
    daily_rate: 89.99,
    image_url: "/placeholder.svg?height=300&width=400",
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
    daily_rate: 79.99,
    image_url: "/placeholder.svg?height=300&width=400",
    location: {
      address: "San Francisco, CA",
      lat: 37.7749,
      lng: -122.4194,
    },
    features: ["8ft Bed", "5ft Trailer", "4x4", "Towing Package"],
    availability: true,
  },
]

const mockBookings = [
  {
    id: "booking1",
    truck_id: "1",
    user_id: "user123",
    start_date: new Date("2023-08-15"),
    end_date: new Date("2023-08-18"),
    total_cost: 389.97,
    status: "confirmed",
    pickup_location: {
      address: "123 Main St, Seattle, WA",
      lat: 47.6062,
      lng: -122.3321,
    },
    dropoff_location: {
      address: "456 Pine St, Seattle, WA",
      lat: 47.6102,
      lng: -122.3426,
    },
    payment_id: "pay_123456",
    created_at: new Date("2023-08-01"),
  },
  {
    id: "booking2",
    truck_id: "2",
    user_id: "user123",
    start_date: new Date("2023-09-10"),
    end_date: new Date("2023-09-12"),
    total_cost: 179.98,
    status: "pending",
    pickup_location: {
      address: "789 Oak St, Portland, OR",
      lat: 45.5152,
      lng: -122.6784,
    },
    dropoff_location: {
      address: "101 Maple St, Portland, OR",
      lat: 45.5189,
      lng: -122.6726,
    },
    payment_id: "pay_789012",
    created_at: new Date("2023-08-15"),
  },
]

export interface Truck {
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

export interface Booking {
  id: string
  truckId: string
  userId: string
  startDate: Date
  endDate: Date
  totalCost: number
  status: "pending" | "confirmed" | "completed" | "cancelled"
  pickupLocation: {
    address: string
    lat: number
    lng: number
  }
  dropoffLocation: {
    address: string
    lat: number
    lng: number
  }
  paymentId: string
  createdAt: Date
}

// Convert Supabase truck data to our Truck interface
function convertTruckData(data: any): Truck {
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    capacity: data.capacity,
    dailyRate: data.daily_rate,
    imageUrl: data.image_url,
    location: data.location,
    features: data.features,
    availability: data.availability,
  }
}

// Convert Supabase booking data to our Booking interface
function convertBookingData(data: any): Booking {
  return {
    id: data.id,
    truckId: data.truck_id,
    userId: data.user_id,
    startDate: new Date(data.start_date),
    endDate: new Date(data.end_date),
    totalCost: data.total_cost,
    status: data.status,
    pickupLocation: data.pickup_location,
    dropoffLocation: data.dropoff_location,
    paymentId: data.payment_id,
    createdAt: new Date(data.created_at),
  }
}

export async function getTruckById(id: string): Promise<Truck | null> {
  try {
    const { data, error } = await supabase.from("trucks").select("*").eq("id", id).single()

    if (error) {
      console.error("Error fetching truck:", error)
      // Fallback to mock data in case of error
      return mockTrucks.find((truck) => truck.id === id)
        ? convertTruckData(mockTrucks.find((truck) => truck.id === id))
        : null
    }

    return data ? convertTruckData(data) : null
  } catch (error) {
    console.error("Error fetching truck:", error)
    // Fallback to mock data in case of error
    return mockTrucks.find((truck) => truck.id === id)
      ? convertTruckData(mockTrucks.find((truck) => truck.id === id))
      : null
  }
}

export async function getUserBookings(userId: string): Promise<Booking[]> {
  try {
    const { data, error } = await supabase.from("bookings").select("*").eq("user_id", userId)

    if (error) {
      console.error("Error fetching bookings:", error)
      // Fallback to mock data in case of error
      return mockBookings.map(convertBookingData)
    }

    return data ? data.map(convertBookingData) : []
  } catch (error) {
    console.error("Error fetching bookings:", error)
    // Fallback to mock data in case of error
    return mockBookings.map(convertBookingData)
  }
}

export async function getAllTrucks(): Promise<Truck[]> {
  try {
    const { data, error } = await supabase.from("trucks").select("*")

    if (error) {
      console.error("Error fetching trucks:", error)
      // Fallback to mock data in case of error
      return mockTrucks.map(convertTruckData)
    }

    return data ? data.map(convertTruckData) : []
  } catch (error) {
    console.error("Error fetching trucks:", error)
    // Fallback to mock data in case of error
    return mockTrucks.map(convertTruckData)
  }
}

export async function createBooking(bookingData: Omit<Booking, "id" | "createdAt">): Promise<Booking | null> {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .insert([
        {
          truck_id: bookingData.truckId,
          user_id: bookingData.userId,
          start_date: bookingData.startDate.toISOString(),
          end_date: bookingData.endDate.toISOString(),
          total_cost: bookingData.totalCost,
          status: bookingData.status,
          pickup_location: bookingData.pickupLocation,
          dropoff_location: bookingData.dropoffLocation,
          payment_id: bookingData.paymentId,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error creating booking:", error)
      return null
    }

    return data ? convertBookingData(data) : null
  } catch (error) {
    console.error("Error creating booking:", error)
    return null
  }
}
