"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export function EnvChecker() {
  const [showAlert, setShowAlert] = useState(false)
  const [missingVars, setMissingVars] = useState<string[]>([])

  useEffect(() => {
    const checkEnvVars = async () => {
      try {
        // Check Supabase variables
        const requiredClientVars = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"]

        const missing = requiredClientVars.filter((varName) => !process.env[varName] || process.env[varName] === "")

        // Check Google Maps API key via server
        const mapsResponse = await fetch("/api/maps")
        if (!mapsResponse.ok) {
          missing.push("GOOGLE_MAPS_API_KEY")
        } else {
          const { apiKey } = await mapsResponse.json()
          if (!apiKey) {
            missing.push("GOOGLE_MAPS_API_KEY")
          }
        }

        if (missing.length > 0) {
          setMissingVars(missing)
          setShowAlert(true)
        }
      } catch (error) {
        console.error("Error checking environment variables:", error)
      }
    }

    checkEnvVars()
  }, [])

  if (!showAlert) return null

  return (
    <Alert variant="destructive" className="mb-4 mx-auto max-w-4xl">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Missing Environment Variables</AlertTitle>
      <AlertDescription>
        <p>The following environment variables are missing or using placeholder values:</p>
        <ul className="list-disc pl-5 mt-2">
          {missingVars.map((varName) => (
            <li key={varName}>{varName}</li>
          ))}
        </ul>
        <p className="mt-2">
          Please add these variables to your <code>.env.local</code> file or Vercel environment variables.
        </p>
      </AlertDescription>
    </Alert>
  )
}
