export type Role = 'admin' | 'membre' | 'athlete' | 'visiteur'

export interface Profile {
  id: string
  created_at: string
  full_name: string
  email: string
  avatar_url: string | null
  role: Role
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar?: string;
}

export interface Event {
  id: string
  title: string
  description: string
  date: string
  location: string
  type: 'entrainement' | 'competition' | 'sortie'
  created_by: string
  participants?: string[]
}

export interface EventRegistration {
  id: string;
  user_id: string;
  event_id: string;
  registered_at: Date;
}

export interface Attendance {
  id: string;
  eventId: string;
  userId: string;
  status: "registered" | "absent" | "attended";
  absenceReason?: string;
}

export interface Card {
  id: string
  purchase_price: number
  entries: number
  entries_total: number
  status: 'active' | 'inactive'
  notes?: string | null
  owner_id?: string | null
}

export interface CardUsage {
  id: string;
  cardId: string;
  eventId?: string;
  entriesUsed: number;
  usedBy: string;
  usedAt: string;
}

export interface Purchase {
  id: string
  label: string
  amount: number
  date: string
  category: string
  notes?: string | null
  created_by: string
}

export interface Article {
  id: string;
  title: string;
  content: string;
  image_url?: string; // Added for compatibility
  cover_image?: string;
  created_at: string;
  author_id?: string;
  author_name?: string;
  author_avatar?: string;
  likes?: number;
  comments_count?: number;
  author?: {
    id: string;
    name: string;
    avatar: string;
    role: string;
  };
}

export interface Comment {
  id: string
  content: string
  article_id: string
  author_id: string
  created_at: string
  author?: {
    name: string
    avatar?: string
  }
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName?: string;
  action: string;
  details?: string;
  createdAt: string;
}

