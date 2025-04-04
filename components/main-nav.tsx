"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useRole } from "@/components/role-provider"
import { Calendar, CreditCard, DollarSign, LayoutDashboard, MessageSquare, Settings } from "lucide-react"

export function MainNav() {
  const pathname = usePathname()
  const { role } = useRole()

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
      title: "Administration",
      href: "/admin",
      icon: Settings,
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

