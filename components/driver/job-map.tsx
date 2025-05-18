"use client"

import { useEffect, useRef, useState } from "react"
import { Loader2 } from "lucide-react"
import { useMapsApiKey } from "@/hooks/use-maps-api-key"

interface JobMapProps {
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
}

export default function JobMap({ pickup, dropoff }: JobMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
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

      const pickupCoords = { lat: pickup.lat, lng: pickup.lng }
      const dropoffCoords = { lat: dropoff.lat, lng: dropoff.lng }

      const bounds = new window.google.maps.LatLngBounds()
      bounds.extend(pickupCoords)
      bounds.extend(dropoffCoords)

      const map = new window.google.maps.Map(mapRef.current!, {
        center: bounds.getCenter(),
        zoom: 12,
        mapTypeControl: false,
      })

      map.fitBounds(bounds, { padding: 50 })

      // Pickup marker
      new window.google.maps.Marker({
        position: pickupCoords,
        map,
        title: pickup.address,
        icon: {
          url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
        },
      })

      // Dropoff marker
      new window.google.maps.Marker({
        position: dropoffCoords,
        map,
        title: dropoff.address,
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
          if (status === window.google.maps.DirectionsStatus.OK) {
            directionsRenderer.setDirections(result)
          }
        },
      )
    }

    loadMap()
  }, [apiKey, pickup, dropoff])

  if (isLoading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center rounded-lg bg-muted">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center rounded-lg bg-muted">
        <p className="text-muted-foreground">Failed to load map</p>
      </div>
    )
  }

  return (
    <div className="relative h-[400px] w-full overflow-hidden rounded-lg">
      <div ref={mapRef} className="h-full w-full" />
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  )
}
