import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Calendar, CreditCard, Users } from "lucide-react"
import { ArticlePreview } from "@/components/article-preview"
import { sampleArticles } from "@/lib/sample-data"

export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container mx-auto flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <span className="text-blue-600">EFREI</span> Swim
          </div>
          <nav className="hidden md:flex gap-6">
            <Link href="/" className="text-sm font-medium">
              Accueil
            </Link>
            <Link href="/forum" className="text-sm font-medium">
              Forum
            </Link>
            <Link href="/a-propos" className="text-sm font-medium">
              À propos
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/auth/login">
              <Button variant="outline" size="sm">
                Connexion
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm">Inscription</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-blue-50 to-white dark:from-blue-950 dark:to-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Bienvenue chez EFREI Swim
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Le club de natation de l&apos;école d&apos;ingénieurs EFREI à Bordeaux.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/auth/signup">
                  <Button className="bg-blue-600 hover:bg-blue-700">Rejoindre le club</Button>
                </Link>
                <Link href="/a-propos">
                  <Button variant="outline">En savoir plus</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Nos activités</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Découvrez les différentes activités proposées par notre club de natation.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 lg:gap-12 mt-8">
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <Calendar className="h-8 w-8 text-blue-600" />
                  <div className="grid gap-1">
                    <CardTitle>Entraînements</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Des séances d&apos;entraînement régulières encadrées par des coachs qualifiés.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div className="grid gap-1">
                    <CardTitle>Compétitions</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Participez à des compétitions universitaires et régionales tout au long de l&apos;année.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <CreditCard className="h-8 w-8 text-blue-600" />
                  <div className="grid gap-1">
                    <CardTitle>Sorties</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Des événements sociaux et des sorties pour renforcer l&apos;esprit d&apos;équipe.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Derniers articles</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Restez informé des dernières actualités du club.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:gap-12 mt-8">
              {sampleArticles.slice(0, 4).map((article) => (
                <ArticlePreview key={article.id} article={article} />
              ))}
            </div>
            <div className="flex justify-center mt-8">
              <Link href="/forum">
                <Button variant="outline" className="gap-2">
                  Voir tous les articles
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} EFREI Swim. Tous droits réservés.
          </p>
          <div className="flex gap-4">
            <Link href="/mentions-legales" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
              Mentions légales
            </Link>
            <Link href="/contact" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

