"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
import { useToast } from "@/hooks/use-toast"
import { Plus } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { useRole } from "@/components/role-provider"
import { ArticlePreview } from "@/components/article-preview"
import { createArticle, getAllArticles } from "@/lib/supabase-api"
import type { Article } from "@/lib/types"

export default function ForumPage() {
  const { role } = useRole()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [articles, setArticles] = useState<Article[]>([]) // Initialize with empty array
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchArticles()
  }, [])

  // Function to fetch articles from the database
  const fetchArticles = async () => {
    setIsLoading(true)
    try {
      const fetchedArticles = await getAllArticles(100)
      console.log("Fetched articles:", fetchedArticles)
      
      if (fetchedArticles && fetchedArticles.length > 0) {
        setArticles(fetchedArticles)
      }
    } catch (error) {
      console.error("Error fetching articles:", error)
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les articles.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateArticle = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Get form data
    const form = e.target as HTMLFormElement
    const title = (form.querySelector('#title') as HTMLInputElement).value
    const content = (form.querySelector('#content') as HTMLTextAreaElement).value
    const coverImage = (form.querySelector('#coverImage') as HTMLInputElement).value || null
    
    try {
      await createArticle(title, content, coverImage)
      setOpen(false)
      toast({
        title: "Article créé",
        description: "L'article a été créé avec succès.",
      })
      
      // Fetch the updated list of articles after creating a new one
      fetchArticles()
      
    } catch (error) {
      console.error("handleCreateArticle error:", error)
      toast({
        title: "Erreur",
        description: "Impossible de créer l'article. Veuillez réessayer.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Forum</h1>
          <p className="text-muted-foreground mt-1">Actualités et articles du club de natation</p>
        </div>

        {(role === "membre" || role === "admin") && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Créer un article
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[725px]">
              <DialogHeader>
                <DialogTitle>Créer un nouvel article</DialogTitle>
                <DialogDescription>Rédigez un nouvel article pour le forum.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateArticle} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Titre</Label>
                  <Input id="title" placeholder="Titre de l'article" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coverImage">Image de couverture (URL)</Label>
                  <Input id="coverImage" placeholder="https://exemple.com/image.jpg" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Contenu</Label>
                  <Textarea id="content" placeholder="Contenu de l'article..." rows={10} required />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Publication en cours..." : "Publier l'article"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
        {articles.map((article) => (
          <ArticlePreview key={article.id} article={article} />
        ))}
      </div>
    </div>
  )
}

