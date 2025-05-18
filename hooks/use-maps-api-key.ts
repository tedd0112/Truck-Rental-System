"use client"

import { useState, useEffect } from "react"

interface MapsApiKeyState {
  apiKey: string | null
  isLoading: boolean
  error: Error | null
}

export function useMapsApiKey() {
  const [state, setState] = useState<MapsApiKeyState>({
    apiKey: null,
    isLoading: true,
    error: null,
  })

  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const response = await fetch("/api/maps")

        if (!response.ok) {
          throw new Error("Failed to fetch Maps API key")
        }

        const data = await response.json()

        if (data.error) {
          throw new Error(data.error)
        }

        setState({
          apiKey: data.apiKey,
          isLoading: false,
          error: null,
        })
      } catch (error) {
        setState({
          apiKey: null,
          isLoading: false,
          error: error instanceof Error ? error : new Error("Unknown error"),
        })
      }
    }

    fetchApiKey()
  }, [])

  return state
}
