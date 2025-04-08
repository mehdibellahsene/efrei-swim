"use client"

import { useEffect, useState } from "react"
import { useRole } from "@/components/role-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, CreditCard, DollarSign, Users } from "lucide-react"
import { EventCard } from "@/components/event-card"
import { getUpcomingEvents, getAllPurchases, getAllCards, getAllUsers } from "@/lib/supabase-api"
import type { Event, Purchase, Card as CardType, Profile } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

export default function DashboardPage() {
  const { role } = useRole()
  const { toast } = useToast()
  const [events, setEvents] = useState<Event[]>([])
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [cards, setCards] = useState<CardType[]>([])
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      
      try {
        // Fetch all required data in parallel
        const [eventsData, purchasesData, cardsData, usersData] = await Promise.all([
          getUpcomingEvents(5), 
          getAllPurchases(),
          getAllCards(),
          getAllUsers()
        ]);
        
        setEvents(eventsData || []);
        setPurchases(purchasesData || []);
        setCards(cardsData || []);
        setUsers(usersData || []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les données du tableau de bord.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [toast]);

  const totalBudget = purchases.reduce((acc, curr) => acc + Number(curr.amount), 0)
  const activeCardCount = cards.filter(card => card.status === "active").length
  const activeMemberCount = users.filter(user => user.role === "membre").length
  const upcomingEventsCount = events.length

  return (
    <div className="flex-1 space-y-4 p-6 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Tableau de bord</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Événements à venir
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : upcomingEventsCount}
            </div>
            <p className="text-xs text-muted-foreground">
              Prochains événements programmés
            </p>
          </CardContent>
        </Card>
        
        {(role === "admin" || role === "membre") && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Budget (30 jours)
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : `${totalBudget.toFixed(2)} €`}
              </div>
              <p className="text-xs text-muted-foreground">
                Dépenses des 30 derniers jours
              </p>
            </CardContent>
          </Card>
        )}
        
        {role === "admin" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Cartes actives
              </CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : activeCardCount}
              </div>
              <p className="text-xs text-muted-foreground">
                Cartes avec des entrées restantes
              </p>
            </CardContent>
          </Card>
        )}
        
        {role === "admin" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Membres actifs
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : activeMemberCount}
              </div>
              <p className="text-xs text-muted-foreground">
                Utilisateurs avec rôle "membre"
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Événements à venir</CardTitle>
            <CardDescription>
              Les prochains événements programmés sur votre calendrier
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            {loading ? (
              <div className="flex items-center justify-center h-[200px]">
                Chargement...
              </div>
            ) : events.length > 0 ? (
              <div className="space-y-8">
                {events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                Aucun événement à venir
              </div>
            )}
          </CardContent>
        </Card>
        
        {(role === "admin" || role === "membre") && (
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Dernières dépenses</CardTitle>
              <CardDescription>
                Résumé des transactions récentes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-[200px]">
                  Chargement...
                </div>
              ) : purchases.length > 0 ? (
                <div className="space-y-4">
                  {purchases.slice(0, 5).map((purchase) => (
                    <div key={purchase.id} className="flex items-center">
                      <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">{purchase.label}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(purchase.date).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div className="ml-auto font-medium">
                        {Number(purchase.amount).toFixed(2)} €
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                  Aucune dépense récente
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

