import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarIcon } from "lucide-react";
import type { Article } from "@/lib/types";
import Image from "next/image";

// Helper function to format date
function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "Date inconnue";
  
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  } catch (e) {
    return "Date invalide";
  }
}

export function ArticlePreview({ article }: { article: Article }) {
  // Use image_url if available, fall back to cover_image, then to placeholder
  const imageUrl = article.image_url || article.cover_image || '/placeholder.svg';
  
  // Create a direct path to the article using the correct route
  const articlePath = article.id 
    ? `/articles/${article.id}`  // Updated path to match the actual page location
    : '/forum';
  
  return (
    <Link 
      href={articlePath} 
      className="block h-full"
    >
      <Card className="overflow-hidden flex flex-col h-full cursor-pointer transition-shadow hover:shadow-md">
        <div className="relative h-48 w-full overflow-hidden">
          <Image 
            src={imageUrl}
            alt={article.title || "Article image"}
            fill
            className="object-cover transition-transform hover:scale-105"
            onError={(e) => {
              // Fallback to placeholder if image fails to load
              (e.target as HTMLImageElement).src = '/placeholder.svg';
            }}
            priority={false}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <CardHeader className="p-4">
          <CardTitle className="line-clamp-2">{article.title}</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 flex-grow">
          <p className="text-sm text-muted-foreground line-clamp-3">{article.content}</p>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={article.author_avatar || "/placeholder.svg"} />
              <AvatarFallback>{article.author_name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">{article.author_name}</span>
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
            <CalendarIcon className="mr-1 h-3 w-3" />
            {formatDate(article.created_at)}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}

