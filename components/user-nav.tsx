"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRole } from "@/components/role-provider"
import { useRouter } from "next/navigation"
import { LogOut, User } from "lucide-react"

export function UserNav() {
  const { role, setRole } = useRole()
  const router = useRouter()

  const handleLogout = () => {
    setRole("visiteur")
    router.push("/")
  }

  // Determine user info based on role
  let userName = "Utilisateur"
  let userEmail = "utilisateur@efrei.net"

  if (role === "admin") {
    userName = "Admin"
    userEmail = "admin@efrei.net"
  } else if (role === "membre") {
    userName = "Sophie Martin"
    userEmail = "membre@efrei.net"
  } else if (role === "athlete") {
    userName = "Thomas Dubois"
    userEmail = "athlete@efrei.net"
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder.svg?height=32&width=32" alt={userName} />
            <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userName}</p>
            <p className="text-xs leading-none text-muted-foreground">{userEmail}</p>
            <p className="text-xs leading-none text-muted-foreground capitalize mt-1">Rôle: {role}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            <span>Profil</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Déconnexion</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

