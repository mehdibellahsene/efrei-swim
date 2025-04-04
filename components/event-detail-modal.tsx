"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Clock, MapPin, Users, CreditCard, AlertTriangle } from "lucide-react"
import { useRole } from "@/components/role-provider"
import { useToast } from "@/hooks/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { sampleCards } from "@/lib/sample-data"
import type { Event, User } from "@/lib/types"

interface EventDetailModalProps {
  event: Event
  isOpen: boolean
  onClose: () => void
}

export function EventDetailModal({ event, isOpen, onClose }: EventDetailModalProps) {
  const { role } = useRole()
  const { toast } = useToast()
  const [isRegistered, setIsRegistered] = useState(false)
  const [selectedCards, setSelectedCards] = useState<string[]>([])
  const [absenceReason, setAbsenceReason] = useState<string>("")
  const [isAbsent, setIsAbsent] = useState(false)

  const handleRegister = () => {
    setIsRegistered(true)
    toast({
      title: "Inscription réussie",
      description: `Vous êtes inscrit à l'événement "${event.title}"`,
    })
  }

  const handleUnregister = () => {
    setIsRegistered(false)
    toast({
      title: "Désinscription réussie",
      description: `Vous êtes désinscrit de l'événement "${event.title}"`,
    })
  }

  const handleAbsenceSubmit = () => {
    setIsAbsent(true)
    toast({
      title: "Absence signalée",
      description: "Votre absence a été enregistrée",
    })
  }

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
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60

    if (hours === 0) {
      return `${mins} min`
    } else if (mins === 0) {
      return `${hours} h`
    } else {
      return `${hours} h ${mins} min`
    }
  }

  // Déterminer la couleur en fonction du type d'événement
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

  const activeCards = sampleCards.filter((card) => card.status === "active")

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl">{event.title}</DialogTitle>
          <DialogDescription>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getEventColor()}`}
            >
              {event.type === "entrainement" ? "Entraînement" : event.type === "competition" ? "Compétition" : "Sortie"}
            </span>
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Détails</TabsTrigger>
            <TabsTrigger value="participants">Participants</TabsTrigger>
            {(role === "membre" || role === "admin") && <TabsTrigger value="gestion">Gestion</TabsTrigger>}
          </TabsList>

          <TabsContent value="details" className="space-y-4 py-4">
            <div className="space-y-3">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-3 text-muted-foreground" />
                <span>{formatDate(event.date)}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-3 text-muted-foreground" />
                <span>
                  {formatTime(event.date)} • {formatDuration(event.duration)}
                </span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-3 text-muted-foreground" />
                <span>{event.location}</span>
              </div>
              <div className="flex items-start mt-4">
                <div className="bg-muted p-4 rounded-lg w-full">
                  <h4 className="font-medium mb-2">Description</h4>
                  <p>{event.description}</p>
                </div>
              </div>

              {event.type === "entrainement" && (
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Informations supplémentaires</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Apportez votre maillot de bain et bonnet</li>
                    <li>Douche obligatoire avant d'entrer dans la piscine</li>
                    <li>Casier à disposition (prévoir un jeton ou une pièce de 1€)</li>
                  </ul>
                </div>
              )}

              {event.type === "competition" && (
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Informations compétition</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Licence obligatoire</li>
                    <li>Arrivée 1h avant le début des épreuves</li>
                    <li>Catégories: Junior et Senior</li>
                  </ul>
                </div>
              )}

              {/* Section d'absence déplacée ici */}
              {(role === "athlete" || role === "membre" || role === "admin") && (
                <div className="border p-4 rounded-lg space-y-3 mt-4">
                  <h3 className="font-medium flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    Signaler une absence
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="absence" checked={isAbsent} onCheckedChange={(checked) => setIsAbsent(!!checked)} />
                      <Label htmlFor="absence">Je ne pourrai pas être présent</Label>
                    </div>

                    {isAbsent && (
                      <div className="space-y-2 mt-2">
                        <Label htmlFor="absence-reason">Raison de l'absence</Label>
                        <Select value={absenceReason} onValueChange={setAbsenceReason}>
                          <SelectTrigger id="absence-reason">
                            <SelectValue placeholder="Sélectionner une raison" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="maladie">Maladie</SelectItem>
                            <SelectItem value="blessure">Blessure</SelectItem>
                            <SelectItem value="travail">Travail/Études</SelectItem>
                            <SelectItem value="transport">Problème de transport</SelectItem>
                            <SelectItem value="autre">Autre</SelectItem>
                          </SelectContent>
                        </Select>

                        <Button size="sm" onClick={handleAbsenceSubmit} disabled={!absenceReason} className="mt-2">
                          Confirmer l'absence
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="participants" className="py-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Participants ({event.participants?.length || 0})
                </h3>
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                {event.participants && event.participants.length > 0 ? (
                  event.participants.map((participant: User) => (
                    <div key={participant.id} className="flex items-center justify-between p-2 border rounded-md">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={participant.avatar} alt={participant.name} />
                          <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{participant.name}</p>
                          <p className="text-xs text-muted-foreground">{participant.role}</p>
                        </div>
                      </div>
                      {(role === "admin" || role === "membre") && (
                        <Badge variant="outline" className="text-xs">
                          Présent
                        </Badge>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">Aucun participant inscrit pour le moment</div>
                )}
              </div>
            </div>
          </TabsContent>

          {(role === "membre" || role === "admin") && (
            <TabsContent value="gestion" className="py-4">
              <div className="space-y-6">
                {role === "membre" && (
                  <div className="space-y-3">
                    <h3 className="font-medium flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Cartes à débiter pour l'événement
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Sélectionnez les cartes qui seront utilisées pour cet événement. Ces cartes seront débitées pour
                      tous les participants.
                    </p>
                    <div className="space-y-2">
                      {activeCards.length > 0 ? (
                        activeCards.map((card) => (
                          <div key={card.id} className="flex items-center space-x-2 border p-3 rounded-md">
                            <Checkbox
                              id={`card-${card.id}`}
                              checked={selectedCards.includes(card.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedCards([...selectedCards, card.id])
                                } else {
                                  setSelectedCards(selectedCards.filter((id) => id !== card.id))
                                }
                              }}
                            />
                            <Label htmlFor={`card-${card.id}`} className="flex-1">
                              <div className="flex justify-between items-center">
                                <span>{card.cardId}</span>
                                <span className="text-sm text-muted-foreground">
                                  {card.remainingEntries} / {card.totalEntries} entrées
                                </span>
                              </div>
                            </Label>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-muted-foreground">Aucune carte active disponible</div>
                      )}

                      {selectedCards.length > 0 && (
                        <div className="mt-4 p-3 bg-muted rounded-md">
                          <p className="text-sm font-medium">Cartes sélectionnées: {selectedCards.length}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Ces cartes seront utilisées pour débiter les entrées de tous les participants à cet
                            événement.
                          </p>
                          <Button size="sm" className="mt-3 w-full">
                            Confirmer la sélection des cartes
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Autres options de gestion pourraient être ajoutées ici */}
                <div className="border p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Options supplémentaires</h3>
                  {role === "admin" && (
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full">
                        Modifier l'événement
                      </Button>
                      <Button variant="outline" size="sm" className="w-full">
                        Envoyer un rappel aux participants
                      </Button>
                      <Button variant="destructive" size="sm" className="w-full">
                        Annuler l'événement
                      </Button>
                    </div>
                  )}
                  {role === "membre" && !role.includes("admin") && (
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full">
                        Télécharger la liste des participants
                      </Button>
                      <Button variant="outline" size="sm" className="w-full">
                        Envoyer un message aux participants
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>

        <DialogFooter className="flex justify-between items-center gap-2">
          {isRegistered ? (
            <Button variant="outline" onClick={handleUnregister}>
              Se désinscrire
            </Button>
          ) : (
            <Button onClick={handleRegister}>S'inscrire</Button>
          )}
          <Button variant="ghost" onClick={onClose}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

