"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { getAllUsers, updateUserRole, syncUserProfiles } from "@/lib/supabase-api"
import { seedInitialData } from "@/lib/seed-data"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Profile } from "@/lib/types"

export default function AdminPage() {
  const { toast } = useToast()
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [isSeedingData, setIsSeedingData] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const data = await getAllUsers()
      setUsers(data || [])
    } catch (error) {
      console.error("Error fetching users:", error)
      toast({
        title: "Erreur",
        description: "Impossible de récupérer la liste des utilisateurs.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSyncProfiles = async () => {
    setIsSyncing(true)
    try {
      const success = await syncUserProfiles()
      if (success) {
        toast({
          title: "Synchronisation réussie",
          description: "Les profils utilisateurs ont été synchronisés avec succès.",
        })
        // Refresh the user list
        await fetchUsers()
      } else {
        throw new Error("La synchronisation a échoué")
      }
    } catch (error) {
      console.error("Error syncing profiles:", error)
      toast({
        title: "Erreur",
        description: "Impossible de synchroniser les profils utilisateurs.",
        variant: "destructive",
      })
    } finally {
      setIsSyncing(false)
    }
  }

  const handleSeedData = async () => {
    setIsSeedingData(true)
    try {
      await seedInitialData()
      toast({
        title: "Initialisation réussie",
        description: "Les données initiales ont été ajoutées avec succès.",
      })
      // Refresh the user list
      await fetchUsers()
    } catch (error) {
      console.error("Error seeding data:", error)
      toast({
        title: "Erreur",
        description: "Impossible d'initialiser les données.",
        variant: "destructive",
      })
    } finally {
      setIsSeedingData(false)
    }
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Administration</h1>
        <div className="space-x-2">
          <Button 
            onClick={handleSyncProfiles} 
            disabled={isSyncing} 
            variant="outline"
          >
            {isSyncing ? "Synchronisation..." : "Synchroniser les profils"}
          </Button>
          <Button 
            onClick={handleSeedData} 
            disabled={isSeedingData}
            variant="secondary"
          >
            {isSeedingData ? "Initialisation..." : "Initialiser les données"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="users" className="mt-6">
        <TabsList>
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          <TabsTrigger value="logs">Journaux d'activité</TabsTrigger>
        </TabsList>
        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des utilisateurs</CardTitle>
              <CardDescription>Gérez les utilisateurs et leurs rôles</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" onClick={() => updateUserRole(user.id, "admin")}>
                          Promouvoir
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="logs" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Journaux d'activité</CardTitle>
              <CardDescription>Historique des activités des utilisateurs</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Détails</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>04/04/2025 10:23</TableCell>
                    <TableCell>Sophie Martin</TableCell>
                    <TableCell>Création d'événement</TableCell>
                    <TableCell>A créé l'événement "Entraînement hebdomadaire"</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>03/04/2025 16:45</TableCell>
                    <TableCell>Thomas Dubois</TableCell>
                    <TableCell>Inscription</TableCell>
                    <TableCell>S'est inscrit à l'événement "Compétition inter-écoles"</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>03/04/2025 14:12</TableCell>
                    <TableCell>Sophie Martin</TableCell>
                    <TableCell>Ajout de carte</TableCell>
                    <TableCell>A ajouté une nouvelle carte d'entrées (CARD-002)</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>02/04/2025 09:30</TableCell>
                    <TableCell>Admin</TableCell>
                    <TableCell>Promotion</TableCell>
                    <TableCell>A promu Sophie Martin au rôle de membre</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>01/04/2025 18:20</TableCell>
                    <TableCell>Sophie Martin</TableCell>
                    <TableCell>Publication</TableCell>
                    <TableCell>A publié l'article "Conseils pour améliorer votre technique de crawl"</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

