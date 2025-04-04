"use client"

import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { sampleArticles } from "@/lib/sample-data"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Calendar, Edit } from "lucide-react"
import { useRole } from "@/components/role-provider"

export default function ArticlePage() {
  const params = useParams()
  const router = useRouter()
  const { role } = useRole()

  const articleId = params.id as string
  const article = sampleArticles.find((a) => a.id === articleId)

  if (!article) {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>Article non trouvé</CardTitle>
            <CardDescription>L'article que vous recherchez n'existe pas.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.push("/forum")}>Retour au forum</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.push("/forum")} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Retour au forum
        </Button>
      </div>

      <Card className="max-w-4xl mx-auto">
        <div className="aspect-video w-full overflow-hidden">
          <img
            src={article.coverImage || "/placeholder.svg"}
            alt={article.title}
            className="h-full w-full object-cover"
          />
        </div>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl">{article.title}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-2">
                <Calendar className="h-4 w-4" />
                {new Date(article.createdAt).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </CardDescription>
            </div>

            {(role === "membre" || role === "admin") && (
              <Button variant="outline" size="sm" className="gap-2">
                <Edit className="h-4 w-4" />
                Modifier
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-6 pb-6 border-b">
            <Avatar>
              <AvatarImage src={article.author.avatar} alt={article.author.name} />
              <AvatarFallback>{article.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{article.author.name}</div>
              <div className="text-sm text-muted-foreground">
                {article.author.role === "membre" ? "Membre" : "Admin"}
              </div>
            </div>
          </div>

          <div className="prose dark:prose-invert max-w-none">
            <p>{article.content}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

