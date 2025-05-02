"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Event } from "@/lib/types"
import { EventDetailModal } from "@/components/event-detail-modal"

interface CalendarViewProps {
  events: Event[]
}

export function CalendarView({ events }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event)
    setIsModalOpen(true)
  }

  // Get current month and year
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  // Get days in current month
  const daysInMonth = getDaysInMonth(currentYear, currentMonth)

  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  let firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth)
  // Adjust for Monday as first day of week
  firstDayOfMonth = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1

  // Create calendar days array
  const days = []

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null)
  }

  // Add days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  // Get events for the current month
  const eventsInMonth = events.filter((event) => {
    const eventDate = new Date(event.date)
    return eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear
  })

  // Group events by day
  const eventsByDay: Record<number, Event[]> = {}
  eventsInMonth.forEach((event) => {
    const eventDate = new Date(event.date)
    const day = eventDate.getDate()
    if (!eventsByDay[day]) {
      eventsByDay[day] = []
    }
    eventsByDay[day].push(event)
  })

  // Format month name
  const monthName = currentDate.toLocaleDateString("fr-FR", { month: "long" })

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold capitalize">
          {monthName} {currentYear}
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day) => (
          <div key={day} className="text-center font-medium py-2 text-sm">
            {day}
          </div>
        ))}

        {days.map((day, index) => (
          <div
            key={index}
            className={cn("min-h-[100px] border rounded-md p-1", day === null ? "bg-muted/50" : "hover:bg-muted/50")}
          >
            {day !== null && (
              <>
                <div className="text-right text-sm p-1">{day}</div>
                <div className="space-y-1">
                  {eventsByDay[day]?.map((event, eventIndex) => {
                    // Determine color based on event type
                    let bgColor = "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                    if (event.type === "competition") {
                      bgColor = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                    } else if (event.type === "sortie") {
                      bgColor = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                    }
                    
                    // Add opacity for past events
                    const isPastEvent = new Date(event.date) < new Date()
                    if (isPastEvent) {
                      bgColor += " opacity-60"
                    }

                    return (
                      <div
                        key={eventIndex}
                        className={cn("text-xs p-1 rounded cursor-pointer truncate", bgColor)}
                        onClick={() => handleEventClick(event)}
                      >
                        {new Date(event.date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })} -{" "}
                        {event.title}
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {selectedEvent && (
        <EventDetailModal event={selectedEvent} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  )
}

