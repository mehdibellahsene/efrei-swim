"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Password validation
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.")
      return
    }
    
    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.")
      return
    }
    
    setError(null)
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({ password })
      
      if (error) {
        throw error
      }

      toast({
        title: "Mot de passe mis à jour",
        description: "Votre mot de passe a été modifié avec succès.",
      })
      
      // Redirect to login after successful password update
      setTimeout(() => {
        router.push("/auth/login")
      }, 2000)
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la mise à jour du mot de passe.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Check if the user has a valid session from the password reset link
  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession()
      
      if (error || !data.session) {
        toast({
          title: "Session invalide",
          description: "Votre lien de réinitialisation est invalide ou a expiré.",
          variant: "destructive",
        })
        router.push("/auth/reset-password")
      }
    }
    
    checkSession()
  }, [router, toast])

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <span className="flex items-center gap-2 font-bold text-xl">
              <span className="text-blue-600">EFREI</span> Swim
            </span>
          </div>
          <CardTitle className="text-2xl">Nouveau mot de passe</CardTitle>
          <CardDescription>
            Créez un nouveau mot de passe pour votre compte
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-4">
            {error && (
              <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="password">Nouveau mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <p className="text-xs text-muted-foreground">
                Au moins 6 caractères
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mise à jour...
                </>
              ) : (
                "Mettre à jour le mot de passe"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
