"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRole } from "@/components/role-provider"
import { useRouter } from "next/navigation"
import { User } from "@supabase/supabase-js"

type AuthContextType = {
  user: User | null
  isLoading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { setRole } = useRole()
  const router = useRouter()

  const signOut = async () => {
    await supabase.auth.signOut()
    setRole("visiteur")
    router.push("/")
  }

  // Initial session fetch and profile setup
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        setUser(session?.user || null)
        
        if (session?.user) {
          // Fetch user profile to get role
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single()
          
          if (profile) {
            setRole(profile.role)
          } else if (error) {
            console.error("Error fetching profile:", error)
            
            // Try to create a profile if it doesn't exist
            try {
              const { error: createError } = await supabase.from('profiles').insert({
                id: session.user.id,
                full_name: session.user.user_metadata.full_name || 
                           session.user.user_metadata.name || 
                           session.user.email?.split('@')[0] || 
                           'User',
                role: 'visiteur'
              })
              
              if (createError) throw createError
              setRole('visiteur')
            } catch (createErr) {
              console.error("Failed to create profile:", createErr)
              setRole('visiteur')
            }
          }
        } else {
          setRole("visiteur")
        }
      } catch (error) {
        console.error("Error in auth setup:", error)
        setRole("visiteur")
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchSession()
  }, [setRole, router])

  // Auth state change listener
  useEffect(() => {
    const { data: subscription } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user || null)
      
      if (session?.user) {
        try {
          const { data: profile, error } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .single()

          if (profile) {
            setRole(profile.role)
          } else {
            setRole("visiteur")
          }
          
          if (error) throw error
        } catch (error) {
          console.error("Error fetching profile on auth change:", error)
          setRole("visiteur")
        }
      } else {
        setRole("visiteur")
      }
    })

    return () => subscription.unsubscribe()
  }, [setRole])

  return (
    <AuthContext.Provider value={{ user, isLoading, signOut }}>
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