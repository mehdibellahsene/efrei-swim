"use client"

import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Calendar } from "lucide-react"
import { useEffect, useState } from "react"
import { getArticle } from "@/lib/supabase-api"
import type { Article } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

export default function PublicArticlePage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)

  const articleId = params.id as string

  useEffect(() => {
    async function fetchArticle() {
      try {
        setLoading(true)
        const data = await getArticle(articleId)
        setArticle(data)
      } catch (error) {
        console.error("Error fetching article:", error)
        toast({
          title: "Erreur",
          description: "Impossible de charger l'article. Veuillez réessayer.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchArticle()
  }, [articleId, toast])

  if (loading) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="flex justify-center items-center py-8">
            <p>Chargement de l'article...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>Article non trouvé</CardTitle>
            <CardDescription>L'article que vous recherchez n'existe pas.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.push("/")}>Retour à l'accueil</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  const imageUrl = article.image_url || article.cover_image || "/placeholder.svg"

  return (
    <div className="container py-8 max-w-4xl mx-auto px-4">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="relative aspect-video w-full overflow-hidden">
          <Image
            src={imageUrl}
            alt={article.title || "Image de l'article"}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 1200px, 1200px"
            onError={(e) => {
              (e.target as any).src = "/placeholder.svg"
            }}
          />
        </div>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl">{article.title}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-2">
                <Calendar className="h-4 w-4" />
                {new Date(article.created_at || article.createdAt || "").toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-6 pb-6 border-b">
            <Avatar>
              <AvatarImage
                src={article.author?.avatar || article.author_avatar || "/placeholder.svg"}
                alt={article.author?.name || article.author_name || ""}
              />
              <AvatarFallback>{(article.author?.name || article.author_name || "?").charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{article.author?.name || article.author_name}</div>
              <div className="text-sm text-muted-foreground">
                {article.author?.role === "membre" ? "Membre" : "Admin"}
              </div>
            </div>
          </div>

          <div className="prose dark:prose-invert max-w-none">
            <p className="whitespace-pre-wrap">{article.content}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
