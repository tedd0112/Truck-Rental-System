"use client"

import { useEffect, useRef, useState } from "react"
import { Loader2 } from "lucide-react"
import { useMapsApiKey } from "@/hooks/use-maps-api-key"

interface TruckLocationMapProps {
  location: {
    address: string
    lat: number
    lng: number
  }
}

export default function TruckLocationMap({ location }: TruckLocationMapProps) {
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

      const locationCoords = { lat: location.lat, lng: location.lng }
      const map = new window.google.maps.Map(mapRef.current!, {
        center: locationCoords,
        zoom: 15,
        mapTypeControl: false,
      })

      new window.google.maps.Marker({
        position: locationCoords,
        map,
        title: location.address,
      })
    }

    loadMap()
  }, [apiKey, location])

  if (isLoading) {
    return (
      <div className="flex h-[300px] w-full items-center justify-center rounded-lg bg-muted">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-[300px] w-full items-center justify-center rounded-lg bg-muted">
        <p className="text-muted-foreground">Failed to load map</p>
      </div>
    )
  }

  return (
    <div className="relative h-[300px] w-full overflow-hidden rounded-lg">
      <div ref={mapRef} className="h-full w-full" />
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  )
}
