"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { sampleUsers } from "@/lib/sample-data"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MoreHorizontal, Shield, Trash, UserCheck, UserMinus } from "lucide-react"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AdminPage() {
  const { toast } = useToast()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<string | null>(null)

  const handlePromoteUser = (userId: string, newRole: "athlete" | "membre" | "admin") => {
    toast({
      title: "Utilisateur promu",
      description: `L'utilisateur a été promu au rôle de ${newRole}.`,
    })
  }

  const handleDemoteUser = (userId: string) => {
    toast({
      title: "Utilisateur rétrogradé",
      description: "L'utilisateur a été rétrogradé au rôle d'athlète.",
    })
  }

  const handleDeleteUser = () => {
    setDeleteDialogOpen(false)
    toast({
      title: "Utilisateur supprimé",
      description: "L'utilisateur a été supprimé avec succès.",
    })
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Administration</h1>
          <p className="text-muted-foreground mt-1">Gérez les utilisateurs et les rôles</p>
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
                  {sampleUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.role === "admin" ? "destructive" : user.role === "membre" ? "default" : "secondary"
                          }
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {user.role !== "admin" && (
                              <DropdownMenuItem onClick={() => handlePromoteUser(user.id, "admin")}>
                                <Shield className="h-4 w-4 mr-2" />
                                Promouvoir en admin
                              </DropdownMenuItem>
                            )}
                            {user.role !== "membre" && user.role !== "admin" && (
                              <DropdownMenuItem onClick={() => handlePromoteUser(user.id, "membre")}>
                                <UserCheck className="h-4 w-4 mr-2" />
                                Promouvoir en membre
                              </DropdownMenuItem>
                            )}
                            {(user.role === "membre" || user.role === "admin") && (
                              <DropdownMenuItem onClick={() => handleDemoteUser(user.id)}>
                                <UserMinus className="h-4 w-4 mr-2" />
                                Rétrograder en athlète
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => {
                                setSelectedUser(user.id)
                                setDeleteDialogOpen(true)
                              }}
                            >
                              <Trash className="h-4 w-4 mr-2" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer l'utilisateur</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

