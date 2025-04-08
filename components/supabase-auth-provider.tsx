"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRole } from "@/components/role-provider"
import { useRouter } from "next/navigation"
import { User, Session } from "@supabase/supabase-js"
import { getUserProfile } from "@/lib/supabase-api"

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { setRole } = useRole()
  const router = useRouter()

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true)
      try {
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession()
        setSession(currentSession)
        setUser(currentSession?.user || null)

        if (currentSession?.user) {
          const profile = await getUserProfile(currentSession.user.id)
          setRole(profile?.role || 'visiteur')
        } else {
          setRole('visiteur')
        }
      } catch (error) {
        console.error("Error initializing auth:", error)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession)
      setUser(newSession?.user || null)
      if (newSession?.user) {
        const profile = await getUserProfile(newSession.user.id)
        setRole(profile?.role || 'visiteur')
      } else {
        setRole('visiteur')
      }
      router.refresh()
    })

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [setRole, router])

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return { error: error.message }
      if (data.user) {
        const profile = await getUserProfile(data.user.id)
        setRole(profile?.role || 'visiteur')
      }
      return {}
    } catch (error: any) {
      console.error("Error signing in:", error)
      return { error: error.message || "Failed to sign in" }
    }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } }
      })
      if (error) return { error: error.message }
      if (data.user) {
        // Optionally create a profile in your profiles table
        const { error: profileError } = await supabase.from('profiles').insert([
          { id: data.user.id, email, full_name: fullName, role: 'visiteur' }
        ])
        if (profileError) return { error: profileError.message }
      }
      return {}
    } catch (error: any) {
      console.error("Error signing up:", error)
      return { error: error.message || "Failed to sign up" }
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setSession(null)
      setRole('visiteur')
      router.push('/auth/login')
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within a SupabaseAuthProvider")
  }
  return context
}