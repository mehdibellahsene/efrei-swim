"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useRole } from "@/components/role-provider"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { setRole } = useRole()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.endsWith("@efrei.net")) {
      toast({
        title: "Erreur",
        description: "Seules les adresses email se terminant par @efrei.net sont autorisées.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    // Simuler l'envoi d'un magic link
    setTimeout(() => {
      toast({
        title: "Magic Link envoyé",
        description: "Vérifiez votre boîte mail pour vous connecter.",
      })
      setIsLoading(false)

      // Pour la démo, on simule une connexion immédiate
      setTimeout(() => {
        // Déterminer le rôle en fonction de l'email
        if (email.includes("admin")) {
          setRole("admin")
        } else if (email.includes("membre")) {
          setRole("membre")
        } else {
          setRole("athlete")
        }

        router.push("/dashboard")
      }, 2000)
    }, 1500)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
              <span className="text-blue-600">EFREI</span> Swim
            </Link>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Connexion</CardTitle>
          <CardDescription className="text-center">
            Entrez votre adresse email pour recevoir un lien de connexion
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="vous@efrei.net"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Envoi en cours..." : "Envoyer le lien de connexion"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-muted-foreground text-center">
            Pas encore de compte ?{" "}
            <Link href="/auth/signup" className="text-blue-600 hover:underline">
              Inscrivez-vous
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

