"use client"

import type React from "react"

import { useState } from "react"
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
import { samplePurchases } from "@/lib/sample-data"
import { DollarSign, Plus } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRole } from "@/components/role-provider"

export default function BudgetPage() {
  const { role } = useRole()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)

  const handleCreatePurchase = (e: React.FormEvent) => {
    e.preventDefault()
    setOpen(false)
    toast({
      title: "Dépense ajoutée",
      description: "La dépense a été ajoutée avec succès.",
    })
  }

  // Calculer le total des dépenses
  const totalExpenses = samplePurchases.reduce((total, purchase) => total + purchase.amount, 0)

  // Grouper les dépenses par catégorie
  const expensesByCategory = samplePurchases.reduce(
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
                  <Select>
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
              {samplePurchases.map((purchase) => (
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

