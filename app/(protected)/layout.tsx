"use client"

import type React from "react"

import { MainNav } from "@/components/main-nav"
import { UserNav } from "@/components/user-nav"
import { useRole } from "@/components/role-provider"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"
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
  const { role } = useRole()
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useAuth()
  const { toast } = useToast()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (role === "visiteur") {
      router.push("/auth/login")
      return
    }

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
  }, [role, router, pathname, toast])

  if (role === "visiteur") {
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

