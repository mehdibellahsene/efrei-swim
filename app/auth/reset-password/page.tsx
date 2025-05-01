"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { Loader2, Mail } from "lucide-react"

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      })

      if (error) {
        throw error
      }

      setIsSubmitted(true)
      toast({
        title: "Email envoyé",
        description: "Vérifiez votre boîte mail pour réinitialiser votre mot de passe.",
      })
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'envoi du lien",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <span className="flex items-center gap-2 font-bold text-xl">
              <span className="text-blue-600">EFREI</span> Swim
            </span>
          </div>
          <CardTitle className="text-2xl">Réinitialiser le mot de passe</CardTitle>
          <CardDescription>
            Entrez votre email pour recevoir un lien de réinitialisation
          </CardDescription>
        </CardHeader>

        {isSubmitted ? (
          <CardContent className="space-y-4 pt-4">
            <div className="rounded-lg bg-green-50 p-4 text-center text-sm text-green-700">
              Un email de réinitialisation a été envoyé à <strong>{email}</strong>. 
              Veuillez vérifier votre boîte de réception et suivre les instructions.
            </div>
            <div className="text-center">
              <Link href="/auth/login">
                <Button variant="link">Retour à la connexion</Button>
              </Link>
            </div>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 pt-4">
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
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Envoi du lien...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Envoyer le lien
                  </>
                )}
              </Button>
              <div className="text-center text-sm mt-2">
                <Link href="/auth/login" className="text-blue-600 hover:underline">
                  Retour à la connexion
                </Link>
              </div>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  )
}
