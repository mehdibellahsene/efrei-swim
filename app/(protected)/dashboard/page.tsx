"use client"

import { useEffect, useState } from "react"
import { useRole } from "@/components/role-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { sampleEvents, sampleArticles } from "@/lib/sample-data"
import { Calendar, CreditCard, DollarSign, Users } from "lucide-react"
import { EventCard } from "@/components/event-card"
import { getUpcomingEvents } from "@/lib/supabase-api"
import type { Event } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

export default function DashboardPage() {
  const { role } = useRole()
  const { toast } = useToast()
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch upcoming events
  useEffect(() => {
    async function fetchEvents() {
      try {
        const data = await getUpcomingEvents(3, null)
        setUpcomingEvents(data || [])
      } catch (error) {
        console.error("Error fetching events:", error)
        // Fallback to sample data if there's an error
        const fallbackEvents = sampleEvents
          .filter((event) => new Date(event.date) > new Date())
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, 3)
        
        setUpcomingEvents(fallbackEvents)
        toast({
          title: "Erreur",
          description: "Impossible de charger les événements. Affichage des données de test.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [toast])

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Tableau de bord</h1>
        <p className="text-muted-foreground">Bienvenue sur votre tableau de bord EFREI Swim.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entraînements</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Entraînements ce mois-ci</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Participations</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Vos participations ce mois-ci</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entrées restantes</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">22</div>
            <p className="text-xs text-muted-foreground">Sur toutes les cartes actives</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1 250 €</div>
            <p className="text-xs text-muted-foreground">Budget restant pour l'année</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-8">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Événements à venir</CardTitle>
            <CardDescription>Les prochains événements auxquels vous pouvez participer</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <p>Chargement des événements...</p>
              </div>
            ) : upcomingEvents.length > 0 ? (
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Aucun événement à venir</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Derniers articles</CardTitle>
            <CardDescription>Les dernières actualités du club</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sampleArticles.slice(0, 2).map((article) => (
                <div key={article.id} className="border-b pb-4 last:border-0">
                  <h3 className="font-medium line-clamp-1">{article.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{article.content}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-muted-foreground">
                      {new Date(article.createdAt).toLocaleDateString("fr-FR")}
                    </span>
                    <span className="text-xs">•</span>
                    <span className="text-xs text-muted-foreground">{article.author.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

