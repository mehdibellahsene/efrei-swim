"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useRole } from "@/components/role-provider"
import { Calendar, CreditCard, DollarSign, LayoutDashboard, MessageSquare, Settings, Users } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast" 
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export function MainNav() {
  const pathname = usePathname()
  const { role } = useRole()
  const { toast } = useToast()
  const router = useRouter()

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

  // Navigation items based on user role
  const navItems = [
    {
      title: "Tableau de bord",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["athlete", "membre", "admin"],
    },
    {
      title: "Calendrier",
      href: "/calendar",
      icon: Calendar,
      roles: ["athlete", "membre", "admin"],
    },
    {
      title: "Entrées",
      href: "/cards",
      icon: CreditCard,
      roles: ["membre", "admin"],
    },
    {
      title: "Budget",
      href: "/budget",
      icon: DollarSign,
      roles: ["athlete", "membre", "admin"],
    },
    {
      title: "Forum",
      href: "/forum",
      icon: MessageSquare,
      roles: ["athlete", "membre", "admin"],
    },
    {
      title: "Gestion Utilisateurs",
      href: "/admin",
      icon: Users,
      roles: ["admin"],
    },
  ]

  // Filter items based on user role
  const filteredNavItems = navItems.filter((item) => item.roles.includes(role))

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      {filteredNavItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary",
            pathname === item.href ? "text-primary" : "text-muted-foreground",
          )}
        >
          <item.icon className="h-4 w-4" />
          <span className="hidden md:inline">{item.title}</span>
        </Link>
      ))}
    </nav>
  )
}

