"use client"

import { useRole } from "@/components/role-provider"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Users } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function RoleSwitcher() {
  const { role, setRole } = useRole()
  const { toast } = useToast()

  const handleRoleChange = (newRole: "visiteur" | "athlete" | "membre" | "admin") => {
    setRole(newRole)
    toast({
      title: "Rôle modifié",
      description: `Vous êtes maintenant connecté en tant que ${newRole}.`,
      duration: 3000,
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Users className="h-4 w-4" />
          <span className="capitalize">{role}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleRoleChange("visiteur")}>Visiteur</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleRoleChange("athlete")}>Athlète</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleRoleChange("membre")}>Membre</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleRoleChange("admin")}>Admin</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

