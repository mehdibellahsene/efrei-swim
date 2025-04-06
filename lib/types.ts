export interface User {
  id: string
  email: string
  name: string
  role: "visiteur" | "athlete" | "membre" | "admin"
  avatar?: string
}

export interface Event {
  id: string
  title: string
  description: string
  type: "entrainement" | "competition" | "sortie"
  date: string
  duration: number
  location: string
  participants?: User[]
}

export interface Attendance {
  id: string
  eventId: string
  userId: string
  status: "registered" | "absent" | "attended"
  absenceReason?: string
}

export interface Card {
  id: string
  cardId: string
  totalEntries: number
  remainingEntries: number
  status: "active" | "inactive"
  purchasePrice: number
  notes?: string
  createdBy?: string
  createdAt?: string
  updatedAt?: string
}

export interface CardUsage {
  id: string
  cardId: string
  eventId?: string
  entriesUsed: number
  usedBy: string
  usedAt: string
}

export interface Purchase {
  id: string
  amount: number
  label: string
  date: string
  category: string
  relatedCardId?: string
  relatedCardName?: string
  createdBy?: string
  createdAt?: string
}

export interface Article {
  id: string
  title: string
  content: string
  coverImage?: string
  createdAt: string
  authorId: string
  author?: User
  updatedAt?: string
}

export interface ActivityLog {
  id: string
  userId: string
  userName?: string
  action: string
  details?: string
  createdAt: string
}

