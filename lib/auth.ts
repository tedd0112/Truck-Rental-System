"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import type { User, Session } from "@supabase/supabase-js"
import { getSupabaseBrowserClient } from "./supabase"

// Define the context type
interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  error: Error | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, userData: any) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

// Create the context
const AuthContext = createContext<AuthContextType | null>(null)

// Auth Provider component
export function AuthProvider(props: { children: React.ReactNode }) {
  // State
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Get Supabase client
  const supabase = getSupabaseBrowserClient()

  // Initialize auth
  useEffect(() => {
    async function initializeAuth() {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("Error getting session:", error)
          setError(error)
        } else {
          setSession(data.session)
          setUser(data.session?.user ?? null)
        }
      } catch (err) {
        console.error("Error initializing auth:", err)
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  // Auth methods
  async function signIn(email: string, password: string) {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
    } catch (error) {
      console.error("Sign in error:", error)
      throw error
    }
  }

  async function signUp(email: string, password: string, userData: any) {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      })
      if (error) throw error
    } catch (error) {
      console.error("Sign up error:", error)
      throw error
    }
  }

  async function signInWithGoogle() {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (error) {
      console.error("Google sign in error:", error)
      throw error
    }
  }

  async function signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error("Sign out error:", error)
      throw error
    }
  }

  // Create context value
  const value = {
    user,
    session,
    loading,
    error,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
  }

  // Return the provider with children
  return React.createElement(AuthContext.Provider, { value }, props.children)
}

// Auth hook
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
