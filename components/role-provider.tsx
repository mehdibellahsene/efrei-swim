"use client"

import { createContext, useContext, useState } from "react"
import type { Role } from "@/lib/types"

type RoleContextType = {
  role: Role
  setRole: (role: Role) => void
  hasAccess: (requiredRoles: Role[]) => boolean
}

const RoleContext = createContext<RoleContextType | undefined>(undefined)

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>('visiteur')

  // Utility function to check if user has required role
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

