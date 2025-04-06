"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

type Role = "visiteur" | "athlete" | "membre" | "admin"

interface RoleContextType {
  role: Role
  setRole: (role: Role) => void
}

const RoleContext = createContext<RoleContextType | undefined>(undefined)

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>("visiteur")

  // Persistence of role in localStorage, but only for remembering between page loads
  useEffect(() => {
    const savedRole = localStorage.getItem("userRole") as Role
    if (savedRole) {
      setRole(savedRole)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("userRole", role)
  }, [role])

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {children}
    </RoleContext.Provider>
  )
}

export function useRole() {
  const context = useContext(RoleContext)
  if (context === undefined) {
    throw new Error("useRole must be used within a RoleProvider")
  }
  return context
}

