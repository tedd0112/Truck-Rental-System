"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { Truck, AlertCircle, Upload, Calendar, Check, X, Eye, EyeOff } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Comprehensive list of country codes with Zimbabwe included
const countryCodes = [
  // Africa
  { code: "+263", country: "Zimbabwe" },
  { code: "+27", country: "South Africa" },
  { code: "+254", country: "Kenya" },
  { code: "+234", country: "Nigeria" },
  { code: "+233", country: "Ghana" },
  { code: "+256", country: "Uganda" },
  { code: "+255", country: "Tanzania" },
  { code: "+251", country: "Ethiopia" },
  { code: "+20", country: "Egypt" },
  { code: "+212", country: "Morocco" },
  { code: "+213", country: "Algeria" },
  { code: "+244", country: "Angola" },
  { code: "+267", country: "Botswana" },
  { code: "+226", country: "Burkina Faso" },
  { code: "+257", country: "Burundi" },
  { code: "+237", country: "Cameroon" },
  { code: "+238", country: "Cape Verde" },
  { code: "+236", country: "Central African Republic" },
  { code: "+235", country: "Chad" },
  { code: "+269", country: "Comoros" },
  { code: "+242", country: "Congo" },
  { code: "+243", country: "Congo (DRC)" },
  { code: "+253", country: "Djibouti" },
  { code: "+240", country: "Equatorial Guinea" },
  { code: "+291", country: "Eritrea" },
  { code: "+268", country: "Eswatini" },
  { code: "+241", country: "Gabon" },
  { code: "+220", country: "Gambia" },
  { code: "+224", country: "Guinea" },
  { code: "+245", country: "Guinea-Bissau" },
  { code: "+225", country: "Ivory Coast" },
  { code: "+266", country: "Lesotho" },
  { code: "+231", country: "Liberia" },
  { code: "+218", country: "Libya" },
  { code: "+261", country: "Madagascar" },
  { code: "+265", country: "Malawi" },
  { code: "+223", country: "Mali" },
  { code: "+222", country: "Mauritania" },
  { code: "+230", country: "Mauritius" },
  { code: "+258", country: "Mozambique" },
  { code: "+264", country: "Namibia" },
  { code: "+227", country: "Niger" },
  { code: "+250", country: "Rwanda" },
  { code: "+239", country: "São Tomé and Príncipe" },
  { code: "+221", country: "Senegal" },
  { code: "+232", country: "Sierra Leone" },
  { code: "+252", country: "Somalia" },
  { code: "+211", country: "South Sudan" },
  { code: "+249", country: "Sudan" },
  { code: "+216", country: "Tunisia" },
  { code: "+260", country: "Zambia" },

  // North America
  { code: "+1", country: "US/Canada" },
  { code: "+1242", country: "Bahamas" },
  { code: "+1246", country: "Barbados" },
  { code: "+1268", country: "Antigua and Barbuda" },
  { code: "+1345", country: "Cayman Islands" },
  { code: "+1441", country: "Bermuda" },
  { code: "+1473", country: "Grenada" },
  { code: "+1649", country: "Turks and Caicos" },
  { code: "+1664", country: "Montserrat" },
  { code: "+1670", country: "Northern Mariana Islands" },
  { code: "+1671", country: "Guam" },
  { code: "+1758", country: "Saint Lucia" },
  { code: "+1767", country: "Dominica" },
  { code: "+1784", country: "Saint Vincent and the Grenadines" },
  { code: "+1787", country: "Puerto Rico" },
  { code: "+1809", country: "Dominican Republic" },
  { code: "+1868", country: "Trinidad and Tobago" },
  { code: "+1869", country: "Saint Kitts and Nevis" },
  { code: "+1876", country: "Jamaica" },
  { code: "+52", country: "Mexico" },
  { code: "+501", country: "Belize" },
  { code: "+502", country: "Guatemala" },
  { code: "+503", country: "El Salvador" },
  { code: "+504", country: "Honduras" },
  { code: "+505", country: "Nicaragua" },
  { code: "+506", country: "Costa Rica" },
  { code: "+507", country: "Panama" },
  { code: "+509", country: "Haiti" },

  // South America
  { code: "+54", country: "Argentina" },
  { code: "+55", country: "Brazil" },
  { code: "+56", country: "Chile" },
  { code: "+57", country: "Colombia" },
  { code: "+58", country: "Venezuela" },
  { code: "+591", country: "Bolivia" },
  { code: "+592", country: "Guyana" },
  { code: "+593", country: "Ecuador" },
  { code: "+595", country: "Paraguay" },
  { code: "+597", country: "Suriname" },
  { code: "+598", country: "Uruguay" },
  { code: "+51", country: "Peru" },

  // Europe
  { code: "+30", country: "Greece" },
  { code: "+31", country: "Netherlands" },
  { code: "+32", country: "Belgium" },
  { code: "+33", country: "France" },
  { code: "+34", country: "Spain" },
  { code: "+351", country: "Portugal" },
  { code: "+352", country: "Luxembourg" },
  { code: "+353", country: "Ireland" },
  { code: "+354", country: "Iceland" },
  { code: "+355", country: "Albania" },
  { code: "+356", country: "Malta" },
  { code: "+357", country: "Cyprus" },
  { code: "+358", country: "Finland" },
  { code: "+359", country: "Bulgaria" },
  { code: "+36", country: "Hungary" },
  { code: "+370", country: "Lithuania" },
  { code: "+371", country: "Latvia" },
  { code: "+372", country: "Estonia" },
  { code: "+373", country: "Moldova" },
  { code: "+374", country: "Armenia" },
  { code: "+375", country: "Belarus" },
  { code: "+376", country: "Andorra" },
  { code: "+377", country: "Monaco" },
  { code: "+378", country: "San Marino" },
  { code: "+379", country: "Vatican City" },
  { code: "+380", country: "Ukraine" },
  { code: "+381", country: "Serbia" },
  { code: "+382", country: "Montenegro" },
  { code: "+383", country: "Kosovo" },
  { code: "+385", country: "Croatia" },
  { code: "+386", country: "Slovenia" },
  { code: "+387", country: "Bosnia and Herzegovina" },
  { code: "+389", country: "North Macedonia" },
  { code: "+39", country: "Italy" },
  { code: "+40", country: "Romania" },
  { code: "+41", country: "Switzerland" },
  { code: "+420", country: "Czech Republic" },
  { code: "+421", country: "Slovakia" },
  { code: "+423", country: "Liechtenstein" },
  { code: "+43", country: "Austria" },
  { code: "+44", country: "UK" },
  { code: "+45", country: "Denmark" },
  { code: "+46", country: "Sweden" },
  { code: "+47", country: "Norway" },
  { code: "+48", country: "Poland" },
  { code: "+49", country: "Germany" },
  { code: "+7", country: "Russia" },

  // Asia
  { code: "+60", country: "Malaysia" },
  { code: "+61", country: "Australia" },
  { code: "+62", country: "Indonesia" },
  { code: "+63", country: "Philippines" },
  { code: "+64", country: "New Zealand" },
  { code: "+65", country: "Singapore" },
  { code: "+66", country: "Thailand" },
  { code: "+673", country: "Brunei" },
  { code: "+675", country: "Papua New Guinea" },
  { code: "+676", country: "Tonga" },
  { code: "+677", country: "Solomon Islands" },
  { code: "+678", country: "Vanuatu" },
  { code: "+679", country: "Fiji" },
  { code: "+680", country: "Palau" },
  { code: "+681", country: "Wallis and Futuna" },
  { code: "+682", country: "Cook Islands" },
  { code: "+683", country: "Niue" },
  { code: "+685", country: "Samoa" },
  { code: "+686", country: "Kiribati" },
  { code: "+687", country: "New Caledonia" },
  { code: "+688", country: "Tuvalu" },
  { code: "+689", country: "French Polynesia" },
  { code: "+690", country: "Tokelau" },
  { code: "+691", country: "Micronesia" },
  { code: "+692", country: "Marshall Islands" },
  { code: "+81", country: "Japan" },
  { code: "+82", country: "South Korea" },
  { code: "+84", country: "Vietnam" },
  { code: "+850", country: "North Korea" },
  { code: "+852", country: "Hong Kong" },
  { code: "+853", country: "Macau" },
  { code: "+855", country: "Cambodia" },
  { code: "+856", country: "Laos" },
  { code: "+86", country: "China" },
  { code: "+880", country: "Bangladesh" },
  { code: "+886", country: "Taiwan" },
  { code: "+90", country: "Turkey" },
  { code: "+91", country: "India" },
  { code: "+92", country: "Pakistan" },
  { code: "+93", country: "Afghanistan" },
  { code: "+94", country: "Sri Lanka" },
  { code: "+95", country: "Myanmar" },
  { code: "+960", country: "Maldives" },
  { code: "+961", country: "Lebanon" },
  { code: "+962", country: "Jordan" },
  { code: "+963", country: "Syria" },
  { code: "+964", country: "Iraq" },
  { code: "+965", country: "Kuwait" },
  { code: "+966", country: "Saudi Arabia" },
  { code: "+967", country: "Yemen" },
  { code: "+968", country: "Oman" },
  { code: "+970", country: "Palestine" },
  { code: "+971", country: "United Arab Emirates" },
  { code: "+972", country: "Israel" },
  { code: "+973", country: "Bahrain" },
  { code: "+974", country: "Qatar" },
  { code: "+975", country: "Bhutan" },
  { code: "+976", country: "Mongolia" },
  { code: "+977", country: "Nepal" },
  { code: "+992", country: "Tajikistan" },
  { code: "+993", country: "Turkmenistan" },
  { code: "+994", country: "Azerbaijan" },
  { code: "+995", country: "Georgia" },
  { code: "+996", country: "Kyrgyzstan" },
  { code: "+998", country: "Uzbekistan" },
]

export default function RegisterPage() {
  // Form state
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [countryCode, setCountryCode] = useState("+263") // Set Zimbabwe as default
  const [phoneNumber, setPhoneNumber] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [userType, setUserType] = useState("passenger")
  const [profilePicture, setProfilePicture] = useState<File | null>(null)
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null)
  const [licenseNumber, setLicenseNumber] = useState("")
  const [licenseExpiry, setLicenseExpiry] = useState<Date | undefined>(undefined)
  const [rememberMe, setRememberMe] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)

  // UI state
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(false)

  // Password strength
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [passwordFeedback, setPasswordFeedback] = useState<string[]>([])

  // Form validation
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [formTouched, setFormTouched] = useState<Record<string, boolean>>({})

  const router = useRouter()
  const { toast } = useToast()

  // Get full phone number with country code
  const getFullPhoneNumber = () => {
    return `${countryCode}${phoneNumber.replace(/\D/g, "")}`
  }

  // Handle profile picture change
  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setProfilePicture(file)

      // Create preview
      const reader = new FileReader()
      reader.onload = (event) => {
        setProfilePicturePreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Calculate password strength
  useEffect(() => {
    if (!password) {
      setPasswordStrength(0)
      setPasswordFeedback([])
      return
    }

    const feedback = []
    let strength = 0

    // Length check
    if (password.length >= 8) {
      strength += 25
    } else {
      feedback.push("Password should be at least 8 characters")
    }

    // Uppercase check
    if (/[A-Z]/.test(password)) {
      strength += 25
    } else {
      feedback.push("Include at least one uppercase letter")
    }

    // Number check
    if (/\d/.test(password)) {
      strength += 25
    } else {
      feedback.push("Include at least one number")
    }

    // Special character check
    if (/[^A-Za-z0-9]/.test(password)) {
      strength += 25
    } else {
      feedback.push("Include at least one special character")
    }

    setPasswordStrength(strength)
    setPasswordFeedback(feedback)
  }, [password])

  // Field validation
  const validateField = (name: string, value: any) => {
    const errors: Record<string, string> = {}

    switch (name) {
      case "firstName":
        if (!value) errors.firstName = "First name is required"
        break
      case "lastName":
        if (!value) errors.lastName = "Last name is required"
        break
      case "email":
        if (!value) {
          errors.email = "Email is required"
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          errors.email = "Email is invalid"
        }
        break
      case "phoneNumber":
        if (!value) errors.phoneNumber = "Phone number is required"
        break
      case "password":
        if (!value) {
          errors.password = "Password is required"
        } else if (value.length < 8) {
          errors.password = "Password must be at least 8 characters"
        }
        break
      case "confirmPassword":
        if (!value) {
          errors.confirmPassword = "Please confirm your password"
        } else if (value !== password) {
          errors.confirmPassword = "Passwords do not match"
        }
        break
      case "licenseNumber":
        if (userType === "driver" && !value) {
          errors.licenseNumber = "License number is required for drivers"
        }
        break
      case "licenseExpiry":
        if (userType === "driver" && !value) {
          errors.licenseExpiry = "License expiry date is required for drivers"
        }
        break
      case "termsAccepted":
        if (!value) {
          errors.termsAccepted = "You must accept the terms and conditions"
        }
        break
    }

    return errors
  }

  // Handle field blur for validation
  const handleBlur = (name: string, value: any) => {
    const newFormTouched = { ...formTouched, [name]: true }
    setFormTouched(newFormTouched)

    const fieldErrors = validateField(name, value)
    setFormErrors({ ...formErrors, ...fieldErrors })
  }

  // Validate all fields
  const validateForm = () => {
    const allFields = {
      firstName,
      lastName,
      email,
      phoneNumber,
      password,
      confirmPassword,
      termsAccepted,
      ...(userType === "driver" ? { licenseNumber, licenseExpiry } : {}),
    }

    let errors: Record<string, string> = {}

    Object.entries(allFields).forEach(([name, value]) => {
      const fieldErrors = validateField(name, value)
      errors = { ...errors, ...fieldErrors }
    })

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate all fields
    if (!validateForm()) {
      setError("Please fix the errors in the form")
      return
    }

    if (!termsAccepted) {
      setError("You must accept the terms and conditions")
      return
    }

    setIsLoading(true)

    try {
      // Upload profile picture if provided
      let profilePictureUrl = null
      if (profilePicture) {
        try {
          // Check if the bucket exists, if not create it
          const { data: buckets } = await supabase.storage.listBuckets()
          const bucketName = "profile-pictures"
          const bucketExists = buckets?.some((bucket) => bucket.name === bucketName)

          if (!bucketExists) {
            console.log("Creating profile-pictures bucket...")
            const { error: createBucketError } = await supabase.storage.createBucket(bucketName, {
              public: true,
              fileSizeLimit: 5242880, // 5MB
            })

            if (createBucketError) {
              console.error("Error creating bucket:", createBucketError)
              throw createBucketError
            }
          }

          // Now upload the file
          const fileExt = profilePicture.name.split(".").pop()
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

          const { error: uploadError, data: uploadData } = await supabase.storage
            .from(bucketName)
            .upload(fileName, profilePicture)

          if (!uploadError && uploadData) {
            const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(fileName)
            profilePictureUrl = urlData.publicUrl
          } else if (uploadError) {
            console.error("Error uploading profile picture:", uploadError)
            throw uploadError
          }
        } catch (uploadError) {
          console.error("Error handling profile picture:", uploadError)
          // Show a toast notification but continue with registration
          toast({
            title: "Profile picture upload failed",
            description: "We couldn't upload your profile picture, but you can add it later from your profile.",
            variant: "destructive",
          })
          // Continue even if profile picture upload fails
        }
      }

      // Get full phone number
      const fullPhoneNumber = getFullPhoneNumber()

      // Register the user with Supabase
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            phone: fullPhoneNumber,
            user_type: userType,
            avatar_url: profilePictureUrl,
            ...(userType === "driver"
              ? {
                  license_number: licenseNumber,
                  license_expiry: licenseExpiry?.toISOString(),
                }
              : {}),
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (signUpError) {
        throw signUpError
      }

      if (!data.user) {
        throw new Error("Failed to create user")
      }

      console.log("User created successfully:", data.user.id)

      // Create profile in the database
      try {
        // Check if profiles table exists
        const { error: tableCheckError } = await supabase.from("profiles").select("id").limit(1)

        // If table doesn't exist, we'll handle it in the redirect flow
        if (!tableCheckError) {
          const profileData = {
            id: data.user.id,
            email: email,
            first_name: firstName,
            last_name: lastName,
            phone_number: fullPhoneNumber,
            user_type: userType,
            avatar_url: profilePictureUrl,
            ...(userType === "driver"
              ? {
                  license_number: licenseNumber,
                  license_expiry: licenseExpiry?.toISOString(),
                }
              : {}),
          }

          const { error: profileError } = await supabase.from("profiles").insert(profileData)

          if (profileError && !profileError.message.includes("does not exist")) {
            console.error("Error creating profile:", profileError)
          } else {
            console.log("Profile created successfully")
          }
        }
      } catch (profileError) {
        console.error("Error creating profile:", profileError)
        // Continue even if profile creation fails - it will be handled in the redirect
      }

      toast({
        title: "Registration successful",
        description: "Your account has been created successfully. Please check your email for verification.",
      })

      // Sign in the user if remember me is checked
      if (rememberMe) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (signInError) {
          console.error("Error signing in:", signInError)
          router.push("/auth/login?registered=true")
        } else {
          // Redirect to auth/redirect which will handle the flow based on user type
          router.push("/auth/redirect")
        }
      } else {
        router.push("/auth/login?registered=true")
      }
    } catch (error: any) {
      console.error("Registration error:", error)
      setError(error.message || "An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      })

      if (error) throw error

      // The user will be redirected to Google's authentication page
      // No need to navigate manually as Supabase handles the redirect
    } catch (error: any) {
      console.error("Google sign in error:", error)
      setError(error.message || "There was an error signing in with Google.")
      setIsLoading(false)
    }
  }

  return (
    <div className="container flex items-center justify-center py-8 md:py-12">
      <Card className="w-full max-w-4xl">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <Truck className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Create Your Account</CardTitle>
          <CardDescription className="text-center">
            Choose your account type and enter your information to get started
          </CardDescription>
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Account Type Selection */}
            <div className="space-y-2">
              <Label>Account Type</Label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  className={cn(
                    "flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer",
                    userType === "passenger" ? "border-primary" : "border-muted",
                  )}
                  onClick={() => setUserType("passenger")}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mb-3 h-6 w-6"
                  >
                    <path d="M19 7v10c0 3-2 5-5 5H5" />
                    <path d="M5 2h10l4 5" />
                    <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                  <div className="space-y-1 text-center">
                    <span className="text-base font-medium">Passenger</span>
                    <p className="text-sm text-muted-foreground">For users needing hauling services</p>
                  </div>
                </button>
                <button
                  type="button"
                  className={cn(
                    "flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer",
                    userType === "driver" ? "border-primary" : "border-muted",
                  )}
                  onClick={() => setUserType("driver")}
                >
                  <Truck className="mb-3 h-6 w-6" />
                  <div className="space-y-1 text-center">
                    <span className="text-base font-medium">Driver</span>
                    <p className="text-sm text-muted-foreground">For truck owners offering services</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-medium mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    onBlur={() => handleBlur("firstName", firstName)}
                    className={formErrors.firstName && formTouched.firstName ? "border-red-500" : ""}
                    required
                  />
                  {formErrors.firstName && formTouched.firstName && (
                    <p className="text-sm text-red-500">{formErrors.firstName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    onBlur={() => handleBlur("lastName", lastName)}
                    className={formErrors.lastName && formTouched.lastName ? "border-red-500" : ""}
                    required
                  />
                  {formErrors.lastName && formTouched.lastName && (
                    <p className="text-sm text-red-500">{formErrors.lastName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => handleBlur("email", email)}
                    className={formErrors.email && formTouched.email ? "border-red-500" : ""}
                    required
                  />
                  {formErrors.email && formTouched.email && <p className="text-sm text-red-500">{formErrors.email}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <div className="flex gap-2">
                    <Select value={countryCode} onValueChange={setCountryCode}>
                      <SelectTrigger className="w-[110px]">
                        <SelectValue placeholder="Code" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[200px] overflow-y-auto">
                        {countryCodes.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            {country.code} ({country.country})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      placeholder="123-456-7890"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      onBlur={() => handleBlur("phoneNumber", phoneNumber)}
                      className={formErrors.phoneNumber && formTouched.phoneNumber ? "border-red-500 flex-1" : "flex-1"}
                      required
                    />
                  </div>
                  {formErrors.phoneNumber && formTouched.phoneNumber && (
                    <p className="text-sm text-red-500">{formErrors.phoneNumber}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={passwordVisible ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onBlur={() => handleBlur("password", password)}
                      className={formErrors.password && formTouched.password ? "border-red-500 pr-10" : "pr-10"}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      onClick={() => setPasswordVisible(!passwordVisible)}
                    >
                      {passwordVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {password && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Progress value={passwordStrength} className="h-2" />
                        <span className="text-xs">
                          {passwordStrength === 0 && "Weak"}
                          {passwordStrength === 25 && "Fair"}
                          {passwordStrength === 50 && "Good"}
                          {passwordStrength === 75 && "Strong"}
                          {passwordStrength === 100 && "Excellent"}
                        </span>
                      </div>
                      {passwordFeedback.length > 0 && (
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {passwordFeedback.map((feedback, index) => (
                            <li key={index} className="flex items-center gap-1">
                              <X className="h-3 w-3 text-red-500" />
                              {feedback}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                  {formErrors.password && formTouched.password && (
                    <p className="text-sm text-red-500">{formErrors.password}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={confirmPasswordVisible ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onBlur={() => handleBlur("confirmPassword", confirmPassword)}
                      className={
                        formErrors.confirmPassword && formTouched.confirmPassword ? "border-red-500 pr-10" : "pr-10"
                      }
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                    >
                      {confirmPasswordVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {confirmPassword && password === confirmPassword && (
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <Check className="h-3 w-3" />
                      Passwords match
                    </div>
                  )}
                  {formErrors.confirmPassword && formTouched.confirmPassword && (
                    <p className="text-sm text-red-500">{formErrors.confirmPassword}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Role-Specific Fields */}
            {userType === "passenger" && (
              <div>
                <h3 className="text-lg font-medium mb-4">Passenger Profile (Optional)</h3>
                <div className="space-y-2">
                  <Label htmlFor="profilePicture">Profile Picture</Label>
                  <div className="flex items-center gap-4">
                    {profilePicturePreview ? (
                      <div className="relative w-20 h-20 rounded-full overflow-hidden">
                        <img
                          src={profilePicturePreview || "/placeholder.svg"}
                          alt="Profile preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                          onClick={() => {
                            setProfilePicture(null)
                            setProfilePicturePreview(null)
                          }}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                        <Upload className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1">
                      <Input
                        id="profilePicture"
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePictureChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("profilePicture")?.click()}
                      >
                        Choose Image
                      </Button>
                      <p className="text-xs text-muted-foreground mt-1">JPG, PNG or GIF, max 5MB</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {userType === "driver" && (
              <div>
                <h3 className="text-lg font-medium mb-4">Driver Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="licenseNumber">License Number</Label>
                    <Input
                      id="licenseNumber"
                      placeholder="DL12345678"
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      onBlur={() => handleBlur("licenseNumber", licenseNumber)}
                      className={formErrors.licenseNumber && formTouched.licenseNumber ? "border-red-500" : ""}
                      required
                    />
                    {formErrors.licenseNumber && formTouched.licenseNumber && (
                      <p className="text-sm text-red-500">{formErrors.licenseNumber}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="licenseExpiry">License Expiry Date</Label>
                    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          id="licenseExpiry"
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !licenseExpiry && "text-muted-foreground",
                            formErrors.licenseExpiry && formTouched.licenseExpiry ? "border-red-500" : "",
                          )}
                          onClick={() => setCalendarOpen(true)}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {licenseExpiry ? format(licenseExpiry, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={licenseExpiry}
                          onSelect={(date) => {
                            setLicenseExpiry(date)
                            setCalendarOpen(false)
                            handleBlur("licenseExpiry", date)
                          }}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {formErrors.licenseExpiry && formTouched.licenseExpiry && (
                      <p className="text-sm text-red-500">{formErrors.licenseExpiry}</p>
                    )}
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="driverProfilePicture">Profile Picture</Label>
                    <div className="flex items-center gap-4">
                      {profilePicturePreview ? (
                        <div className="relative w-20 h-20 rounded-full overflow-hidden">
                          <img
                            src={profilePicturePreview || "/placeholder.svg"}
                            alt="Profile preview"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                            onClick={() => {
                              setProfilePicture(null)
                              setProfilePicturePreview(null)
                            }}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                          <Upload className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1">
                        <Input
                          id="driverProfilePicture"
                          type="file"
                          accept="image/*"
                          onChange={handleProfilePictureChange}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById("driverProfilePicture")?.click()}
                        >
                          Choose Image
                        </Button>
                        <p className="text-xs text-muted-foreground mt-1">JPG, PNG or GIF, max 5MB</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rememberMe"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label htmlFor="rememberMe" className="text-sm font-normal">
                  Remember me
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={termsAccepted}
                  onCheckedChange={(checked) => {
                    setTermsAccepted(checked as boolean)
                    handleBlur("termsAccepted", checked)
                  }}
                  className={formErrors.termsAccepted && formTouched.termsAccepted ? "border-red-500" : ""}
                  required
                />
                <Label htmlFor="terms" className="text-sm font-normal">
                  I agree to the{" "}
                  <Link href="/terms" className="text-blue-600 hover:text-blue-800">
                    Terms and Conditions
                  </Link>
                </Label>
              </div>
              {formErrors.termsAccepted && formTouched.termsAccepted && (
                <p className="text-sm text-red-500">{formErrors.termsAccepted}</p>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create account"}
              </Button>

              <div className="flex items-center">
                <Separator className="flex-1" />
                <span className="mx-4 text-xs text-muted-foreground">OR</span>
                <Separator className="flex-1" />
              </div>

              <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading}>
                <svg
                  className="mr-2 h-4 w-4"
                  aria-hidden="true"
                  focusable="false"
                  data-prefix="fab"
                  data-icon="google"
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 488 512"
                >
                  <path
                    fill="currentColor"
                    d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                  ></path>
                </svg>
                Sign in with Google
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-blue-600 hover:text-blue-800">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
