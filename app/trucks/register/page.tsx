"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Truck, Upload, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/lib/auth"

export default function RegisterTruckPage() {
  const { user } = useAuth()
  const [name, setName] = useState("")
  const [make, setMake] = useState("")
  const [model, setModel] = useState("")
  const [year, setYear] = useState("")
  const [size, setSize] = useState("")
  const [capacity, setCapacity] = useState("")
  const [description, setDescription] = useState("")
  const [dailyRate, setDailyRate] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
  const { toast } = useToast()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImage(file)

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          setImagePreview(e.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!user) {
      setError("You must be logged in to register a truck")
      return
    }

    setIsLoading(true)

    try {
      let imageUrl = "/placeholder.svg?height=400&width=800"

      // Upload image if provided
      if (image) {
        try {
          // Check if the bucket exists, if not create it
          const { data: buckets } = await supabase.storage.listBuckets()
          const bucketName = "truck-images"
          const bucketExists = buckets?.some((bucket) => bucket.name === bucketName)

          if (!bucketExists) {
            console.log("Creating truck-images bucket...")
            const { error: createBucketError } = await supabase.storage.createBucket(bucketName, {
              public: true,
              fileSizeLimit: 10485760, // 10MB
            })

            if (createBucketError) {
              console.error("Error creating bucket:", createBucketError)
              throw createBucketError
            }
          }

          // Now upload the file
          const fileExt = image.name.split(".").pop()
          const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`
          const filePath = `${fileName}`

          const { error: uploadError } = await supabase.storage.from(bucketName).upload(filePath, image)

          if (!uploadError) {
            const {
              data: { publicUrl },
            } = supabase.storage.from(bucketName).getPublicUrl(filePath)
            imageUrl = publicUrl
          } else {
            console.error("Storage error:", uploadError)
            toast({
              title: "Image upload failed",
              description: "We couldn't upload your truck image, but you can add it later.",
              variant: "destructive",
            })
            // Continue with placeholder image
          }
        } catch (storageError) {
          console.error("Storage error:", storageError)
          toast({
            title: "Image upload failed",
            description: "We couldn't upload your truck image, but you can add it later.",
            variant: "destructive",
          })
          // Continue with placeholder image
        }
      }

      // Create truck record in database
      const { error: insertError } = await supabase.from("trucks").insert([
        {
          name,
          make,
          model,
          year: Number.parseInt(year),
          size,
          capacity: Number.parseFloat(capacity),
          description,
          daily_rate: Number.parseFloat(dailyRate),
          image_url: imageUrl,
          owner_id: user.id,
          features: [],
          location: {
            address: "Not specified",
            lat: 0,
            lng: 0,
          },
          availability: true,
        },
      ])

      if (insertError) {
        throw insertError
      }

      toast({
        title: "Truck registered successfully",
        description: "Your truck has been registered and is now available for rental.",
      })

      // Redirect to driver app
      router.push("/driver")
    } catch (error: any) {
      console.error("Truck registration error:", error)
      setError(error.message || "There was an error registering your truck.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container py-8">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Truck className="h-6 w-6 text-blue-600" />
              <CardTitle>Register Your Truck</CardTitle>
            </div>
            <CardDescription>Provide details about your truck to make it available for rental</CardDescription>
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Truck Name</Label>
                    <Input
                      id="name"
                      placeholder="Heavy Duty Moving Truck"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="make">Make</Label>
                    <Input
                      id="make"
                      placeholder="Ford"
                      value={make}
                      onChange={(e) => setMake(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="model">Model</Label>
                    <Input
                      id="model"
                      placeholder="F-150"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year">Year</Label>
                    <Input
                      id="year"
                      placeholder="2022"
                      type="number"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="size">Size</Label>
                    <Select value={size} onValueChange={setSize} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select truck size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small (Under 10ft)</SelectItem>
                        <SelectItem value="medium">Medium (10-20ft)</SelectItem>
                        <SelectItem value="large">Large (20-26ft)</SelectItem>
                        <SelectItem value="extra-large">Extra Large (Over 26ft)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Capacity (tons)</Label>
                    <Input
                      id="capacity"
                      placeholder="5.5"
                      type="number"
                      step="0.1"
                      value={capacity}
                      onChange={(e) => setCapacity(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your truck and its features..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dailyRate">Daily Rate ($)</Label>
                  <Input
                    id="dailyRate"
                    placeholder="99.99"
                    type="number"
                    step="0.01"
                    value={dailyRate}
                    onChange={(e) => setDailyRate(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Truck Photo</Label>
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("image")?.click()}
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Upload Photo
                    </Button>
                    <Input id="image" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    <span className="text-sm text-muted-foreground">{image ? image.name : "No file selected"}</span>
                  </div>

                  {imagePreview && (
                    <div className="mt-4">
                      <div className="relative h-48 w-full overflow-hidden rounded-md">
                        <img
                          src={imagePreview || "/placeholder.svg"}
                          alt="Truck preview"
                          className="object-cover w-full h-full"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Registering..." : "Register Truck"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              By registering your truck, you agree to our{" "}
              <a href="/terms" className="text-blue-600 hover:text-blue-800">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy" className="text-blue-600 hover:text-blue-800">
                Privacy Policy
              </a>
              .
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
