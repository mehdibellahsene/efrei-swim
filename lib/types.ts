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
  present: boolean
  cardUsedId?: string
}

export interface Card {
  id: string
  cardId: string
  totalEntries: number
  remainingEntries: number
  status: "active" | "inactive"
  purchasePrice: number
  notes?: string
}

export interface Purchase {
  id: string
  amount: number
  label: string
  date: string
  relatedCardId?: string
  category: string
}

export interface Article {
  id: string
  authorId: string
  author: User
  title: string
  content: string
  coverImage: string
  createdAt: string
}

