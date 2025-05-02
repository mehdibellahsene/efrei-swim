"use client"

import type React from "react"

import { MainNav } from "@/components/main-nav"
import { UserNav } from "@/components/user-nav"
import { useRole } from "@/components/role-provider"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { ModeToggle } from "@/components/mode-toggle"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { role, setRole } = useRole()
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)

  // Check authentication status and update role
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true)
      
      // Get the current session from Supabase
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        // User is authenticated, update role based on user metadata
        const userRole = session.user.user_metadata?.role || 'athlete'
        setRole(userRole)
      } else if (!isLoading) {
        // Only redirect if not the initial load
        router.push("/auth/login")
      }
      
      setIsLoading(false)
    }
    
    checkAuth()
  }, [router, setRole])

  // Handle access control for protected routes
  useEffect(() => {
    if (isLoading) return // Skip checks while loading

    // Redirect from admin page if not admin
    if (pathname.includes("/admin") && role !== "admin") {
      toast({
        title: "Accès refusé",
        description: "Vous n'avez pas les droits d'accès à cette page d'administration",
        variant: "destructive",
      })
      router.push("/dashboard")
      return
    }

    // Redirect from cards page if not membre or admin
    if (pathname.startsWith("/cards") && role !== "membre" && role !== "admin") {
      router.push("/dashboard")
    }
  }, [role, router, pathname, toast, isLoading])

  // Show loading state or nothing while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    )
  }

  // If still visitor role after auth check completed, redirect to login
  if (role === "visiteur" && !isLoading) {
    router.push("/auth/login")
    return null
  }

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès.",
      })
      
      router.push("/")
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la déconnexion.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex flex-col min-h-screen w-full">
      <header className="border-b w-full">
        <div className="container mx-auto px-4 md:px-6 flex justify-between items-center h-16">
          <div className="flex items-center gap-2 font-bold text-xl">
            <Link href="/">
              <span className="text-blue-600">EFREI</span> Swim
            </Link>
          </div>
          <nav className="flex items-center gap-6">
            <MainNav />
            <ModeToggle />
            <UserNav />
          </nav>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 md:px-6">
        {children}
      </main>
    </div>
  )
}

