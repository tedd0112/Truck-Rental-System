"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useToast } from "@/components/ui/use-toast"
import { CalendarIcon } from "lucide-react"
import { format, differenceInDays, addDays } from "date-fns"
import { cn, formatCurrency, type Truck } from "@/lib/utils"

interface TruckBookingFormProps {
  truck: Truck
}

export default function TruckBookingForm({ truck }: TruckBookingFormProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(new Date())
  const [endDate, setEndDate] = useState<Date | undefined>(addDays(new Date(), 3))
  const [isLoading, setIsLoading] = useState(false)

  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const days = startDate && endDate ? differenceInDays(endDate, startDate) + 1 : 0
  const totalCost = days * truck.dailyRate

  const handleBooking = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to book a truck.",
        variant: "destructive",
      })
      router.push("/auth/login")
      return
    }

    if (!startDate || !endDate) {
      toast({
        title: "Date selection required",
        description: "Please select both pickup and return dates.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Here you would call your booking API
      // For now, we'll just simulate a successful booking
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Booking successful",
        description: `Your truck has been booked from ${format(startDate, "PPP")} to ${format(endDate, "PPP")}.`,
      })

      router.push("/bookings")
    } catch (error) {
      console.error("Booking error:", error)
      toast({
        title: "Booking failed",
        description: "There was an error processing your booking.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Pickup Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                initialFocus
                disabled={(date) => date < new Date()}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Return Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                initialFocus
                disabled={(date) => date < (startDate || new Date())}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="space-y-4 pt-4">
        <div className="flex justify-between">
          <span className="text-muted-foreground">
            {formatCurrency(truck.dailyRate)} x {days} days
          </span>
          <span>{formatCurrency(totalCost)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Service fee</span>
          <span>{formatCurrency(totalCost * 0.1)}</span>
        </div>
        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span>{formatCurrency(totalCost * 1.1)}</span>
        </div>
      </div>

      <Button className="w-full" size="lg" onClick={handleBooking} disabled={isLoading || !truck.availability}>
        {isLoading ? "Processing..." : truck.availability ? "Book Now" : "Unavailable"}
      </Button>
    </div>
  )
}
