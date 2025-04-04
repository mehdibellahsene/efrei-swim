import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { CalendarIcon } from "lucide-react"
import Link from "next/link"
import type { Article } from "@/lib/types"

interface ArticlePreviewProps {
  article: Article
}

export function ArticlePreview({ article }: ArticlePreviewProps) {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-video w-full overflow-hidden">
        <img
          src={article.coverImage || "/placeholder.svg"}
          alt={article.title}
          className="h-full w-full object-cover transition-all hover:scale-105"
        />
      </div>
      <CardHeader>
        <CardTitle className="line-clamp-1">{article.title}</CardTitle>
        <CardDescription className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4" />
          {new Date(article.createdAt).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="line-clamp-3 text-sm text-muted-foreground">{article.content}</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={article.author.avatar} alt={article.author.name} />
            <AvatarFallback>{article.author.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground">{article.author.name}</span>
        </div>
        <Link href={`/forum/${article.id}`}>
          <Button variant="ghost" size="sm">
            Lire plus
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

