"use client"

import type React from "react"

import { MainNav } from "@/components/main-nav"
import { UserNav } from "@/components/user-nav"
import { useRole } from "@/components/role-provider"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"
import { ModeToggle } from "@/components/mode-toggle"
import Link from "next/link"

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { role } = useRole()
  const router = useRouter()
  const pathname = usePathname()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (role === "visiteur") {
      router.push("/auth/login")
    }

    // Redirect from admin page if not admin
    if (pathname.startsWith("/admin") && role !== "admin") {
      router.push("/dashboard")
    }

    // Redirect from cards page if not membre or admin
    if (pathname.startsWith("/cards") && role !== "membre" && role !== "admin") {
      router.push("/dashboard")
    }
  }, [role, router, pathname])

  if (role === "visiteur") {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container mx-auto flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
              <span className="text-blue-600">EFREI</span> Swim
            </Link>
            <MainNav />
          </div>
          <div className="flex items-center gap-4">
            <ModeToggle />
            <UserNav />
          </div>
        </div>
      </header>
      <main className="flex-1 container mx-auto">{children}</main>
    </div>
  )
}

