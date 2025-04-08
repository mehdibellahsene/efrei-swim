"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { DollarSign, Plus } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRole } from "@/components/role-provider"
import { createPurchase, getAllPurchases } from "@/lib/supabase-api"
import type { Purchase } from "@/lib/types"

export default function BudgetPage() {
  const { role } = useRole()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [selectedCategory, setSelectedCategory] = useState("autre")
  const [isLoading, setIsLoading] = useState(true)

  // Fetch purchases when component loads
  useEffect(() => {
    fetchPurchases()
  }, [])

  const handleCreatePurchase = async (e: React.FormEvent) => {
    e.preventDefault()

    // Get the form element
    const form = e.target as HTMLFormElement

    try {
      // Extract actual form values
      const formData = {
        label: (form.querySelector("#label") as HTMLInputElement).value,
        amount: parseFloat((form.querySelector("#amount") as HTMLInputElement).value),
        date: (form.querySelector("#date") as HTMLInputElement).value, // Keep as 'date' for frontend model
        category: selectedCategory,
        notes: "", // Optional field
      }

      // Validate form data
      if (!formData.label || isNaN(formData.amount) || !formData.date || !formData.category) {
        throw new Error("Please fill in all required fields")
      }

      await createPurchase(formData)
      toast({
        title: "Dépense ajoutée",
        description: "La dépense a été ajoutée avec succès.",
      })

      // Refresh purchases (fetch updated data)
      fetchPurchases()
    } catch (error) {
      console.error("Error adding purchase:", error)
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible d'ajouter la dépense.",
        variant: "destructive",
      })
    } finally {
      setOpen(false)
    }
  }

  const fetchPurchases = async () => {
    setIsLoading(true)
    try {
      // Use direct query method to get all purchases
      const data = await getAllPurchases()
      setPurchases(data || [])
      console.log("Fetched purchases:", data)
    } catch (error) {
      console.error("Error fetching purchases:", error)
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les dépenses.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Calculer le total des dépenses
  const totalExpenses = purchases.reduce((total, purchase) => total + purchase.amount, 0)

  // Grouper les dépenses par catégorie
  const expensesByCategory = purchases.reduce(
    (acc, purchase) => {
      if (!acc[purchase.category]) {
        acc[purchase.category] = 0
      }
      acc[purchase.category] += purchase.amount
      return acc
    },
    {} as Record<string, number>,
  )

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Budget</h1>
          <p className="text-muted-foreground mt-1">Suivez les dépenses du club de natation</p>
        </div>

        {(role === "membre" || role === "admin") && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Ajouter une dépense
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Ajouter une nouvelle dépense</DialogTitle>
                <DialogDescription>Remplissez les informations pour ajouter une nouvelle dépense.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreatePurchase} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="label">Libellé</Label>
                  <Input id="label" placeholder="ex: Achat de matériel" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Montant (€)</Label>
                    <Input id="amount" type="number" min="0" step="0.01" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" type="date" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Catégorie</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entrées-piscine">Entrées piscine</SelectItem>
                      <SelectItem value="équipement">Équipement</SelectItem>
                      <SelectItem value="compétition">Compétition</SelectItem>
                      <SelectItem value="événement">Événement</SelectItem>
                      <SelectItem value="autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="relatedCardId">Carte associée (optionnel)</Label>
                  <Select>
                    <SelectTrigger id="relatedCardId">
                      <SelectValue placeholder="Sélectionner une carte" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucune</SelectItem>
                      <SelectItem value="1">CARD-001</SelectItem>
                      <SelectItem value="2">CARD-002</SelectItem>
                      <SelectItem value="3">CARD-003</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button type="submit">Ajouter la dépense</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total des dépenses</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalExpenses.toFixed(2)} €</div>
          </CardContent>
        </Card>

        {Object.entries(expensesByCategory).map(([category, amount]) => (
          <Card key={category}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{category}</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{amount.toFixed(2)} €</div>
              <p className="text-xs text-muted-foreground">
                {Math.round((amount / totalExpenses) * 100)}% du budget total
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Historique des dépenses</CardTitle>
          <CardDescription>Liste complète des dépenses du club</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Libellé</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Carte associée</TableHead>
                <TableHead className="text-right">Montant</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchases.map((purchase) => (
                <TableRow key={purchase.id}>
                  <TableCell>{new Date(purchase.date).toLocaleDateString("fr-FR")}</TableCell>
                  <TableCell className="font-medium">{purchase.label}</TableCell>
                  <TableCell>{purchase.category}</TableCell>
                  <TableCell>{purchase.relatedCardId ? `CARD-00${purchase.relatedCardId}` : "-"}</TableCell>
                  <TableCell className="text-right">{purchase.amount.toFixed(2)} €</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

