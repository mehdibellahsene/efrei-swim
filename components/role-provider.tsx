"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import type { Role } from "@/lib/types"

type RoleContextType = {
  role: Role
  setRole: (role: Role) => void
  hasAccess: (requiredRoles: Role[]) => boolean
}

const RoleContext = createContext<RoleContextType | undefined>(undefined)

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role | null>(null)

  useEffect(() => {
    const fetchUserRole = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const userRole = session?.user?.user_metadata?.role || "visiteur"
      setRole(userRole)
    }

    fetchUserRole()
  }, [])

  if (role === null) {
    return <div>Loading...</div> // Placeholder while role is being fetched
  }

  const hasAccess = (requiredRoles: Role[]) => {
    return requiredRoles.includes(role)
  }

  return (
    <RoleContext.Provider value={{ role, setRole, hasAccess }}>
      {children}
    </RoleContext.Provider>
  )
}

export function useRole() {
  const context = useContext(RoleContext)
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider')
  }
  return context
}

