"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { useRole } from "@/components/role-provider"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase } from "@/lib/supabase"
import { Separator } from "@/components/ui/separator"
import { Loader2, Save, User } from "lucide-react"
import Header from "@/components/Header"

export default function ProfilePage() {
  const { user } = useAuth()
  const { role } = useRole()
  const { toast } = useToast()
  
  const [isUpdating, setIsUpdating] = useState(false)
  const [userData, setUserData] = useState({
    fullName: user?.user_metadata?.full_name || "",
    email: user?.email || "",
    avatarUrl: user?.user_metadata?.avatar_url || "",
  })

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: userData.fullName,
        }
      })

      if (error) throw error

      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été mises à jour avec succès.",
      })
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la mise à jour du profil.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  if (!user) {
    return (
      <>
        <Header />
        <main className="w-full">
          <div className="container mx-auto px-4 md:px-6 py-8">
            <Card>
              <CardHeader>
                <CardTitle>Profil non disponible</CardTitle>
                <CardDescription>Veuillez vous connecter pour accéder à votre profil.</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="w-full">
        <div className="container mx-auto px-4 md:px-6 py-8">
          <h1 className="text-3xl font-bold mb-6">Mon profil</h1>

          <div className="grid gap-6 md:grid-cols-[1fr_3fr]">
            <Card className="md:row-span-2">
              <CardContent className="pt-6 flex flex-col items-center">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={userData.avatarUrl || "/placeholder.svg"} alt={userData.fullName} />
                  <AvatarFallback>
                    <User className="h-12 w-12 text-muted-foreground" />
                  </AvatarFallback>
                </Avatar>
                
                <h2 className="font-semibold text-xl mt-4">{userData.fullName}</h2>
                <p className="text-sm text-muted-foreground">{userData.email}</p>
                
                <Badge className="mt-2" variant={
                  role === "admin" ? "destructive" : 
                  role === "membre" ? "default" : 
                  "secondary"
                }>
                  {role}
                </Badge>
                
                <Separator className="my-6" />
                
                <div className="space-y-4 w-full">
                  <div>
                    <p className="text-sm font-medium">Date d'inscription</p>
                    <p className="text-sm text-muted-foreground">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString("fr-FR") : "Non disponible"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Dernière connexion</p>
                    <p className="text-sm text-muted-foreground">
                      {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString("fr-FR") : "Non disponible"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="informations" className="w-full">
              <TabsList>
                <TabsTrigger value="informations">Informations personnelles</TabsTrigger>
                <TabsTrigger value="preferences">Préférences</TabsTrigger>
              </TabsList>
              
              <TabsContent value="informations">
                <Card>
                  <CardHeader>
                    <CardTitle>Informations personnelles</CardTitle>
                    <CardDescription>
                      Gérez vos informations personnelles et comment nous pouvons vous contacter.
                    </CardDescription>
                  </CardHeader>
                  <form onSubmit={handleUpdateProfile}>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Nom complet</Label>
                        <Input 
                          id="fullName" 
                          value={userData.fullName}
                          onChange={(e) => setUserData({...userData, fullName: e.target.value})}
                          placeholder="Votre nom" 
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                          id="email"
                          value={userData.email}
                          disabled
                          placeholder="votre.email@efrei.net" 
                        />
                        <p className="text-xs text-muted-foreground">
                          L'email ne peut pas être modifié car il est utilisé pour l'authentification.
                        </p>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button type="submit" disabled={isUpdating}>
                        {isUpdating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Mise à jour...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Sauvegarder
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              </TabsContent>
              
              <TabsContent value="preferences">
                <Card>
                  <CardHeader>
                    <CardTitle>Préférences</CardTitle>
                    <CardDescription>
                      Gérez vos préférences et paramètres de notification.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Les préférences utilisateur seront disponibles dans une prochaine version.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <Card>
              <CardHeader>
                <CardTitle>Activités récentes</CardTitle>
                <CardDescription>
                  Historique de vos activités récentes sur la plateforme.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* This would be populated with actual activity data from the backend */}
                  <div className="border-b pb-4">
                    <h3 className="font-medium">Inscription à l'événement</h3>
                    <p className="text-sm text-muted-foreground">
                      Vous vous êtes inscrit à l'événement "Entraînement hebdomadaire"
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-muted-foreground">
                        {new Date().toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  )
}
