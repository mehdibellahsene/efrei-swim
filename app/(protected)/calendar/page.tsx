"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { EventCard } from "@/components/event-card"
import { useRole } from "@/components/role-provider"
import { Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { CalendarView } from "@/components/calendar-view"
import { getUpcomingEvents, createEvent } from "@/lib/supabase-api"
import { sampleEvents } from "@/lib/sample-data"
import type { Event } from "@/lib/types"

export default function CalendarPage() {
  const { role } = useRole()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [eventType, setEventType] = useState<"entrainement" | "competition" | "sortie">("entrainement")

  // Fetch events from the database
  useEffect(() => {
    async function fetchEvents() {
      try {
        const data = await getUpcomingEvents(100, null)
        setEvents(data || [])
      } catch (error) {
        console.error("Error fetching events:", error)
        // Fallback to sample data if there's an error
        setEvents(sampleEvents)
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

  // Filtrer les événements par type
  const trainings = events.filter((event) => event.type === "entrainement")
  const competitions = events.filter((event) => event.type === "competition")
  const outings = events.filter((event) => event.type === "sortie")

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)
    
    try {
      // Get form data
      const form = e.target as HTMLFormElement
      const title = (form.querySelector('#title') as HTMLInputElement).value
      const date = (form.querySelector('#date') as HTMLInputElement).value
      const time = (form.querySelector('#time') as HTMLInputElement).value
      const duration = parseInt((form.querySelector('#duration') as HTMLInputElement).value)
      const location = (form.querySelector('#location') as HTMLInputElement).value
      const description = (form.querySelector('#description') as HTMLTextAreaElement).value
      
      // Format the date and time
      const dateTime = new Date(`${date}T${time}`).toISOString()
      
      // Create the event
      await createEvent(title, description, eventType, dateTime, duration, location)
      
      // Refresh the events list
      const updatedEvents = await getUpcomingEvents(100, null)
      setEvents(updatedEvents || [])
      
      setOpen(false)
      toast({
        title: "Événement créé",
        description: "L'événement a été créé avec succès.",
      })
    } catch (error) {
      console.error("Error creating event:", error)
      toast({
        title: "Erreur",
        description: "Impossible de créer l'événement. Veuillez réessayer.",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Calendrier</h1>
          <p className="text-muted-foreground mt-1">Consultez et inscrivez-vous aux événements à venir</p>
        </div>

        {(role === "membre" || role === "admin") && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Créer un événement
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Créer un nouvel événement</DialogTitle>
                <DialogDescription>Remplissez les informations pour créer un nouvel événement.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateEvent} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Titre</Label>
                  <Input id="title" placeholder="Titre de l'événement" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" type="date" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Heure</Label>
                    <Input id="time" type="time" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Durée (minutes)</Label>
                    <Input id="duration" type="number" min="15" step="15" defaultValue="60" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select 
                      defaultValue="entrainement" 
                      onValueChange={(value) => setEventType(value as "entrainement" | "competition" | "sortie")}
                    >
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Type d'événement" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entrainement">Entraînement</SelectItem>
                        <SelectItem value="competition">Compétition</SelectItem>
                        <SelectItem value="sortie">Sortie</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Lieu</Label>
                  <Input id="location" placeholder="Lieu de l'événement" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="Description de l'événement" rows={3} required />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? "Création en cours..." : "Créer l'événement"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Tabs defaultValue="calendar" className="mt-6">
        <TabsList>
          <TabsTrigger value="calendar">Calendrier</TabsTrigger>
          <TabsTrigger value="all">Tous</TabsTrigger>
          <TabsTrigger value="trainings">Entraînements</TabsTrigger>
          <TabsTrigger value="competitions">Compétitions</TabsTrigger>
          <TabsTrigger value="outings">Sorties</TabsTrigger>
        </TabsList>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p>Chargement des événements...</p>
          </div>
        ) : (
          <>
            <TabsContent value="calendar" className="mt-6">
              <CalendarView events={events} />
            </TabsContent>

            <TabsContent value="all" className="mt-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </TabsContent>
            <TabsContent value="trainings" className="mt-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {trainings.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </TabsContent>
            <TabsContent value="competitions" className="mt-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {competitions.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </TabsContent>
            <TabsContent value="outings" className="mt-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {outings.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  )
}

