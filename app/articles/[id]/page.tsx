"use client"

import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Calendar } from "lucide-react"
import { useEffect, useState } from "react"
import { getArticle, addComment } from "@/lib/supabase-api"
import type { Article, Comment } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import { supabase } from "@/lib/supabase-client"
import { Textarea } from "@/components/ui/textarea"

export default function PublicArticlePage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)

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

  useEffect(() => {
    async function fetchComments() {
      try {
        const { data, error } = await supabase
          .from("comments")
          .select(`
            *,
            profiles:author_id (
              full_name,
              avatar_url,
              role
            )
          `)
          .eq("article_id", articleId)
          .order("created_at", { ascending: false })

        if (error) throw error

        const transformedComments = data.map(comment => ({
          ...comment,
          author_name: comment.profiles?.full_name || "Utilisateur inconnu",
          author_avatar: comment.profiles?.avatar_url || null,
          author_role: comment.profiles?.role || "visiteur"
        }))

        setComments(transformedComments)
      } catch (error) {
        console.error("Error fetching comments:", error)
        toast({
          title: "Erreur",
          description: "Impossible de charger les commentaires.",
          variant: "destructive",
        })
      }
    }

    if (articleId) {
      fetchComments()
    }
  }, [articleId, toast])

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) {
      toast({
        title: "Erreur",
        description: "Le commentaire ne peut pas être vide.",
        variant: "destructive",
      })
      return
    }
    
    try {
      const comment = await addComment(articleId, newComment)
      if (comment) {
        setComments((prev) => [comment, ...prev])
        setNewComment("")
        toast({
          title: "Commentaire ajouté",
          description: "Votre commentaire a été publié avec succès.",
        })
      }
    } catch (error: any) {
      console.error("Error adding comment:", error)
      toast({
        title: "Erreur", 
        description: error.message || "Impossible d'ajouter le commentaire. Veuillez réessayer.",
        variant: "destructive",
      })
    }
  }

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
                src={article.author?.avatar || article.author_avatar || "/profile.png"}
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

      <section className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Commentaires ({comments.length})</h2>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Ajouter un commentaire</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddComment} className="space-y-4">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Partagez votre avis..."
                className="min-h-[100px]"
                required
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmittingComment}>
                  {isSubmittingComment ? "Publication..." : "Publier"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {comments.length > 0 ? (
          <ul className="space-y-4">
            {comments.map((comment) => (
              <li key={comment.id} className="border rounded-lg p-4 bg-card">
                <div className="flex items-center mb-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.author_avatar || "/profile.png"} />
                    <AvatarFallback>{(comment.author_name?.charAt(0) || "?").toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="ml-2">
                    <div className="font-medium text-sm">{comment.author_name}</div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                        {comment.author_role}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(comment.created_at).toLocaleDateString("fr-FR", {
                          day: "numeric", 
                          month: "short", 
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="whitespace-pre-wrap text-sm">{comment.content}</p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Aucun commentaire pour le moment. Soyez le premier à commenter !
          </div>
        )}
      </section>
    </div>
  )
}

