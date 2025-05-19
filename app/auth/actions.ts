"use server"

import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

// Create a Supabase client with admin privileges for server-side operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
)

// Create a Supabase client for server components
const createServerClient = () => {
  const cookieStore = cookies()
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "", {
    cookies: {
      get(name) {
        return cookieStore.get(name)?.value
      },
      set(name, value, options) {
        cookieStore.set(name, value, options)
      },
      remove(name, options) {
        cookieStore.set(name, "", { ...options, maxAge: 0 })
      },
    },
  })
}

export async function registerUser(formData: FormData) {
  try {
    // Extract form data
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const firstName = formData.get("firstName") as string
    const lastName = formData.get("lastName") as string
    const userType = formData.get("userType") as string
    const phoneNumber = formData.get("phoneNumber") as string
    const licenseNumber = formData.get("licenseNumber") as string
    const licenseExpiry = formData.get("licenseExpiry") as string

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !userType) {
      return { error: "All fields are required" }
    }

    // Validate environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing Supabase environment variables")
      return { error: "Server configuration error. Please contact support." }
    }

    // Create user with admin API to bypass email verification
    const { data: userData, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm the email
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        user_type: userType,
        phone: phoneNumber,
        ...(userType === "driver"
          ? {
              license_number: licenseNumber,
              license_expiry: licenseExpiry,
            }
          : {}),
      },
    })

    if (createUserError) {
      console.error("Error creating user:", createUserError)
      return { error: createUserError.message || "Failed to create user account" }
    }

    if (!userData.user) {
      return { error: "Failed to create user account" }
    }

    console.log("User created successfully:", userData.user.id)

    // Create profile in the database
    try {
      const profileData = {
        id: userData.user.id,
        email: userData.user.email,
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber,
        user_type: userType,
        ...(userType === "driver"
          ? {
              license_number: licenseNumber,
              license_expiry: licenseExpiry,
            }
          : {}),
      }

      const { error: profileError } = await supabaseAdmin.from("profiles").insert(profileData)

      if (profileError) {
        console.error("Error creating profile:", profileError)
        // Continue even if profile creation fails
      } else {
        console.log("Profile created successfully")
      }
    } catch (profileError) {
      console.error("Error creating profile:", profileError)
      // Continue even if profile creation fails
    }

    // Sign in the user
    const supabase = createServerClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      console.error("Error signing in:", signInError)
      return {
        success: true,
        message: "Account created successfully. Please sign in with your credentials.",
      }
    }

    return {
      success: true,
      redirect: true,
      message: "Account created successfully. You are now signed in.",
    }
  } catch (error: any) {
    console.error("Registration error:", error)
    return {
      error: error.message || "An unexpected error occurred during registration. Please try again.",
    }
  }
}
