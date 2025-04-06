"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type { Event } from "@/lib/types"
import { useRole } from "@/components/role-provider"
import { useToast } from "@/hooks/use-toast"
import { Calendar, Clock, MapPin, Users } from "lucide-react"
import { EventDetailModal } from "@/components/event-detail-modal"
import { registerForEvent, unregisterFromEvent } from "@/lib/supabase-api"
import { useAuth } from "@/components/supabase-auth-provider"

interface EventCardProps {
  event: Event
  onUpdate?: () => void
}

export function EventCard({ event, onUpdate }: EventCardProps) {
  const { role } = useRole()
  const { user } = useAuth()
  const { toast } = useToast()
  const [isRegistered, setIsRegistered] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  // Check if user is registered for this event
  useEffect(() => {
    if (user && event.participants) {
      const registered = event.participants.some(p => p.id === user.id)
      setIsRegistered(registered)
    }
  }, [event.participants, user])

  const handleRegister = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsLoading(true)
    try {
      await registerForEvent(event.id)
      setIsRegistered(true)
      toast({
        title: "Inscription réussie",
        description: `Vous êtes inscrit à l'événement "${event.title}"`,
      })
      if (onUpdate) onUpdate()
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de vous inscrire à cet événement. Veuillez réessayer.",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUnregister = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsLoading(true)
    try {
      await unregisterFromEvent(event.id)
      setIsRegistered(false)
      toast({
        title: "Désinscription réussie",
        description: `Vous êtes désinscrit de l'événement "${event.title}"`,
      })
      if (onUpdate) onUpdate()
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de vous désinscrire de cet événement. Veuillez réessayer.",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  // Format functions
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}h${remainingMinutes}` : `${hours}h`
  }

  // Determine the color based on the event type
  const getEventColor = () => {
    switch (event.type) {
      case "entrainement":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "competition":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "sortie":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  return (
    <>
      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setIsModalOpen(true)}>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{event.title}</CardTitle>
              <CardDescription className="mt-1">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getEventColor()}`}
                >
                  {event.type === "entrainement"
                    ? "Entraînement"
                    : event.type === "competition"
                      ? "Compétition"
                      : "Sortie"}
                </span>
              </CardDescription>
            </div>
            {event.participants && event.participants.length > 0 && (
              <div className="flex items-center text-xs text-muted-foreground">
                <Users className="h-3 w-3 mr-1" />
                {event.participants.length}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="space-y-2 text-sm">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{formatDate(event.date)}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>
                {formatTime(event.date)} • {formatDuration(event.duration)}
              </span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{event.location}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          {role !== "visiteur" &&
            (isRegistered ? (
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={handleUnregister}
                disabled={isLoading}
              >
                {isLoading ? "Chargement..." : "Se désinscrire"}
              </Button>
            ) : (
              <Button 
                className="w-full" 
                onClick={handleRegister}
                disabled={isLoading}
              >
                {isLoading ? "Chargement..." : "S'inscrire"}
              </Button>
            ))}
        </CardFooter>
      </Card>

      <EventDetailModal 
        event={event} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onUpdate={onUpdate}
      />
    </>
  )
}

