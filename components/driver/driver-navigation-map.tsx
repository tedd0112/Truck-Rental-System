"use client"

import { useEffect, useRef, useState } from "react"
import { Loader2, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useMapsApiKey } from "@/hooks/use-maps-api-key"

interface DriverNavigationMapProps {
  job: {
    id: string
    pickup: {
      address: string
      lat: number
      lng: number
    }
    dropoff: {
      address: string
      lat: number
      lng: number
    }
    status: string
  }
}

export default function DriverNavigationMap({ job }: DriverNavigationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [eta, setEta] = useState<string | null>(null)
  const [distance, setDistance] = useState<string | null>(null)
  const { apiKey, isLoading, error } = useMapsApiKey()

  useEffect(() => {
    if (!apiKey || !mapRef.current) return

    const loadMap = async () => {
      try {
        // Load the Google Maps script
        if (!document.querySelector(`script[src*="maps.googleapis.com/maps/api/js"]`)) {
          const script = document.createElement("script")
          script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
          script.async = true
          script.defer = true
          document.head.appendChild(script)

          script.onload = () => {
            initMap()
            setMapLoaded(true)
          }

          script.onerror = () => {
            console.error("Error loading Google Maps script")
          }
        } else if (window.google && window.google.maps) {
          initMap()
          setMapLoaded(true)
        }
      } catch (err) {
        console.error("Error initializing map:", err)
      }
    }

    const initMap = () => {
      if (!window.google || !window.google.maps) return

      const pickupCoords = { lat: job.pickup.lat, lng: job.pickup.lng }
      const dropoffCoords = { lat: job.dropoff.lat, lng: job.dropoff.lng }

      const bounds = new window.google.maps.LatLngBounds()
      bounds.extend(pickupCoords)
      bounds.extend(dropoffCoords)

      const map = new window.google.maps.Map(mapRef.current!, {
        center: bounds.getCenter(),
        zoom: 12,
        mapId: "NAVIGATION_MAP",
        fullscreenControl: true,
        streetViewControl: true,
      })

      map.fitBounds(bounds, { padding: 50 })

      // Pickup marker
      new window.google.maps.Marker({
        position: pickupCoords,
        map,
        title: "Pickup: " + job.pickup.address,
        icon: {
          url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
        },
      })

      // Dropoff marker
      new window.google.maps.Marker({
        position: dropoffCoords,
        map,
        title: "Dropoff: " + job.dropoff.address,
        icon: {
          url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
        },
      })

      // Draw route
      const directionsService = new window.google.maps.DirectionsService()
      const directionsRenderer = new window.google.maps.DirectionsRenderer({
        map,
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: "#4F46E5",
          strokeWeight: 5,
        },
      })

      directionsService.route(
        {
          origin: pickupCoords,
          destination: dropoffCoords,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK && result) {
            directionsRenderer.setDirections(result)

            // Extract ETA and distance
            const route = result.routes[0]
            if (route && route.legs[0]) {
              setEta(route.legs[0].duration?.text || null)
              setDistance(route.legs[0].distance?.text || null)
            }
          }
        },
      )
    }

    loadMap()
  }, [apiKey, job])

  const handleNavigateToPickup = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const currentLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }

        // Open Google Maps app or website with directions
        const url = `https://www.google.com/maps/dir/?api=1&origin=${currentLocation.lat},${currentLocation.lng}&destination=${job.pickup.lat},${job.pickup.lng}&travelmode=driving`
        window.open(url, "_blank")
      })
    }
  }

  const handleNavigateToDropoff = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const currentLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }

        // Open Google Maps app or website with directions
        const url = `https://www.google.com/maps/dir/?api=1&origin=${currentLocation.lat},${currentLocation.lng}&destination=${job.dropoff.lat},${job.dropoff.lng}&travelmode=driving`
        window.open(url, "_blank")
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[500px] w-full items-center justify-center rounded-lg bg-muted">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-[500px] w-full items-center justify-center rounded-lg bg-muted">
        <p className="text-muted-foreground">Failed to load map</p>
      </div>
    )
  }

  return (
    <div className="relative">
      <div ref={mapRef} className="h-[500px] w-full"></div>
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}
      <div className="absolute bottom-4 right-4 flex gap-2">
        <Button onClick={handleNavigateToPickup} className="shadow-lg">
          <MapPin className="h-4 w-4 mr-2 text-green-500" />
          Pickup
        </Button>
        <Button onClick={handleNavigateToDropoff} className="shadow-lg">
          <MapPin className="h-4 w-4 mr-2 text-red-500" />
          Dropoff
        </Button>
      </div>
      {eta && distance && (
        <div className="absolute bottom-4 left-4 rounded-md bg-background p-3 shadow-md">
          <p className="font-medium">ETA: {eta}</p>
          <p className="text-sm text-muted-foreground">Distance: {distance}</p>
        </div>
      )}
    </div>
  )
}
