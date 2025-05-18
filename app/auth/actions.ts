"use server"

import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

// Create a Supabase client with admin privileges for server-side operations
// Note: In production, you should use more secure methods to handle authentication
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
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const firstName = formData.get("firstName") as string
    const lastName = formData.get("lastName") as string
    const userType = formData.get("userType") as string

    if (!email || !password || !firstName || !lastName || !userType) {
      return { error: "All fields are required" }
    }

    // For development purposes, we'll use the admin client to create a user
    // This bypasses email verification which is causing the rate limit issue
    const { data: userData, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm the email
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        user_type: userType,
      },
    })

    if (createUserError) {
      console.error("Error creating user:", createUserError)
      return { error: createUserError.message }
    }

    if (!userData.user) {
      return { error: "Failed to create user" }
    }

    // Create profile in the database
    const { error: profileError } = await supabaseAdmin.from("profiles").insert({
      id: userData.user.id,
      email: userData.user.email,
      first_name: firstName,
      last_name: lastName,
      user_type: userType,
    })

    if (profileError) {
      console.error("Error creating profile:", profileError)
      // We'll continue even if profile creation fails
    }

    // Sign in the user
    const supabase = createServerClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      console.error("Error signing in:", signInError)
      return { success: true, message: "Account created successfully. Please sign in." }
    }

    return { success: true, redirect: true }
  } catch (error: any) {
    console.error("Registration error:", error)
    return { error: error.message || "An unexpected error occurred" }
  }
}
