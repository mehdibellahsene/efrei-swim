"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { getAllCards, createCard } from "@/lib/supabase-api"
import { Edit, Plus, Trash } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function CardsPage() {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [selectedCard, setSelectedCard] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [cards, setCards] = useState<any[]>([])
  const [isLoadingCards, setIsLoadingCards] = useState(true)

  const fetchCards = async () => {
    setIsLoadingCards(true)
    try {
      const data = await getAllCards(100)
      setCards(data || [])
    } catch (error) {
      console.error("Error fetching cards:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les cartes. Veuillez réessayer.",
        variant: "destructive",
      })
      setCards([])
    } finally {
      setIsLoadingCards(false)
    }
  }

  useEffect(() => {
    fetchCards()
  }, [])

  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const form = e.target as HTMLFormElement
    const cardId = (form.querySelector('#cardId') as HTMLInputElement).value
    const totalEntries = parseInt((form.querySelector('#totalEntries') as HTMLInputElement).value)
    const purchasePrice = parseFloat((form.querySelector('#purchasePrice') as HTMLInputElement).value)
    const notes = (form.querySelector('#notes') as HTMLTextAreaElement).value || null

    try {
      await createCard(cardId, totalEntries, purchasePrice, notes)
      setOpen(false)
      toast({
        title: "Carte créée",
        description: "La carte a été créée avec succès.",
      })
      fetchCards()
    } catch (error) {
      console.error(error)
      toast({
        title: "Erreur",
        description: "Impossible de créer la carte. Veuillez réessayer.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditCard = (e: React.FormEvent) => {
    e.preventDefault()
    setEditOpen(false)
    toast({
      title: "Carte modifiée",
      description: "La carte a été modifiée avec succès.",
    })
  }

  const handleDeleteCard = (id: string) => {
    toast({
      title: "Carte supprimée",
      description: "La carte a été supprimée avec succès.",
    })
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des entrées</h1>
          <p className="text-muted-foreground mt-1">Gérez les cartes d'entrées pour la piscine</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Ajouter une carte
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Ajouter une nouvelle carte</DialogTitle>
              <DialogDescription>
                Remplissez les informations pour ajouter une nouvelle carte d'entrées.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateCard} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="cardId">Identifiant de la carte</Label>
                <Input id="cardId" placeholder="ex: CARD-001" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="totalEntries">Nombre total d'entrées</Label>
                  <Input id="totalEntries" type="number" min="1" defaultValue="10" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purchasePrice">Prix d'achat (€)</Label>
                  <Input id="purchasePrice" type="number" min="0" step="0.01" defaultValue="45.00" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" placeholder="Notes supplémentaires" rows={3} />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Création en cours..." : "Ajouter la carte"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Modifier la carte</DialogTitle>
              <DialogDescription>Modifiez les informations de la carte d'entrées.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditCard} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-cardId">Identifiant de la carte</Label>
                <Input id="edit-cardId" defaultValue="CARD-001" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-totalEntries">Nombre total d'entrées</Label>
                  <Input id="edit-totalEntries" type="number" min="1" defaultValue="10" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-remainingEntries">Entrées restantes</Label>
                  <Input id="edit-remainingEntries" type="number" min="0" defaultValue="7" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-purchasePrice">Prix d'achat (€)</Label>
                  <Input id="edit-purchasePrice" type="number" min="0" step="0.01" defaultValue="45.00" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Statut</Label>
                  <Select defaultValue="active">
                    <SelectTrigger id="edit-status">
                      <SelectValue placeholder="Statut de la carte" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-notes">Notes</Label>
                <Textarea id="edit-notes" defaultValue="Carte achetée le 01/03/2025" rows={3} />
              </div>
              <DialogFooter>
                <Button type="submit">Enregistrer les modifications</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="active" className="mt-6">
        <TabsList>
          <TabsTrigger value="active">Cartes actives</TabsTrigger>
          <TabsTrigger value="all">Toutes les cartes</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Cartes actives</CardTitle>
              <CardDescription>Liste des cartes d'entrées actuellement actives</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingCards ? (
                <div className="py-8 text-center">Chargement des cartes...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Entrées</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Prix d'achat</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cards.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6">
                          Aucune carte trouvée. Créez votre première carte !
                        </TableCell>
                      </TableRow>
                    ) : (
                      cards
                        .filter((card) => card.status === "active")
                        .map((card) => (
                          <TableRow key={card.id}>
                            <TableCell className="font-medium">{card.card_id || card.cardId}</TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                <div className="flex justify-between text-sm">
                                  <span>
                                    {card.remaining_entries || card.remainingEntries} / {card.total_entries || card.totalEntries}
                                  </span>
                                  <span className="text-muted-foreground">
                                    {Math.round(((card.remaining_entries || card.remainingEntries) / (card.total_entries || card.totalEntries)) * 100)}%
                                  </span>
                                </div>
                                <Progress value={((card.remaining_entries || card.remainingEntries) / (card.total_entries || card.totalEntries)) * 100} />
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={card.status === "active" ? "default" : "secondary"}>
                                {card.status === "active" ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell>{(card.purchase_price || card.purchasePrice).toFixed(2)} €</TableCell>
                            <TableCell className="max-w-[200px] truncate">{card.notes}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setSelectedCard(card.id)
                                    setEditOpen(true)
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                  <span className="sr-only">Modifier</span>
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteCard(card.id)}>
                                  <Trash className="h-4 w-4" />
                                  <span className="sr-only">Supprimer</span>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="all" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Toutes les cartes</CardTitle>
              <CardDescription>Liste complète de toutes les cartes d'entrées</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingCards ? (
                <div className="py-8 text-center">Chargement des cartes...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Entrées</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Prix d'achat</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cards.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6">
                          Aucune carte trouvée. Créez votre première carte !
                        </TableCell>
                      </TableRow>
                    ) : (
                      cards.map((card) => (
                        <TableRow key={card.id}>
                          <TableCell className="font-medium">{card.card_id || card.cardId}</TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <div className="flex justify-between text-sm">
                                <span>
                                  {card.remaining_entries || card.remainingEntries} / {card.total_entries || card.totalEntries}
                                </span>
                                <span className="text-muted-foreground">
                                  {Math.round(((card.remaining_entries || card.remainingEntries) / (card.total_entries || card.totalEntries)) * 100)}%
                                </span>
                              </div>
                              <Progress value={((card.remaining_entries || card.remainingEntries) / (card.total_entries || card.totalEntries)) * 100} />
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={card.status === "active" ? "default" : "secondary"}>
                              {card.status === "active" ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>{(card.purchase_price || card.purchasePrice).toFixed(2)} €</TableCell>
                          <TableCell className="max-w-[200px] truncate">{card.notes}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedCard(card.id)
                                  setEditOpen(true)
                                }}
                              >
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Modifier</span>
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteCard(card.id)}>
                                <Trash className="h-4 w-4" />
                                <span className="sr-only">Supprimer</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

