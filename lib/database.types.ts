export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          full_name: string
          email: string
          avatar_url: string | null
          role: 'admin' | 'membre' | 'athlete' | 'visiteur'
        }
        Insert: {
          id: string
          created_at?: string
          full_name?: string
          email: string
          avatar_url?: string | null
          role?: 'admin' | 'membre' | 'athlete' | 'visiteur'
        }
        Update: {
          id?: string
          created_at?: string
          full_name?: string
          email?: string
          avatar_url?: string | null
          role?: 'admin' | 'membre' | 'athlete' | 'visiteur'
        }
      }
      events: {
        Row: {
          id: string
          created_at: string
          title: string
          description: string
          date: string
          location: string
          type: 'entrainement' | 'competition' | 'sortie'
          created_by: string
          participants: string[] | null
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          description: string
          date: string
          location: string
          type: 'entrainement' | 'competition' | 'sortie'
          created_by: string
          participants?: string[] | null
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          description?: string
          date?: string
          location?: string
          type?: 'entrainement' | 'competition' | 'sortie'
          created_by?: string
          participants?: string[] | null
        }
      }
      cards: {
        Row: {
          id: string
          created_at: string
          purchase_price: number
          entries: number
          entries_total: number
          status: 'active' | 'inactive'
          notes: string | null
          owner_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          purchase_price: number
          entries: number
          entries_total: number
          status?: 'active' | 'inactive'
          notes?: string | null
          owner_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          purchase_price?: number
          entries?: number
          entries_total?: number
          status?: 'active' | 'inactive'
          notes?: string | null
          owner_id?: string | null
        }
      }
      purchases: {
        Row: {
          id: string
          created_at: string
          label: string
          amount: number
          date: string
          category: string
          notes: string | null
          created_by: string
        }
        Insert: {
          id?: string
          created_at?: string
          label: string
          amount: number
          date: string
          category: string
          notes?: string | null
          created_by: string
        }
        Update: {
          id?: string
          created_at?: string
          label?: string
          amount?: number
          date?: string
          category?: string
          notes?: string | null
          created_by?: string
        }
      }
      articles: {
        Row: {
          id: string
          created_at: string
          title: string
          content: string
          cover_image: string | null
          author_id: string
          likes: number
          comments_count: number
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          content: string
          cover_image?: string | null
          author_id: string
          likes?: number
          comments_count?: number
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          content?: string
          cover_image?: string | null
          author_id?: string
          likes?: number
          comments_count?: number
        }
      }
      comments: {
        Row: {
          id: string
          created_at: string
          content: string
          article_id: string
          author_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          content: string
          article_id: string
          author_id: string
        }
        Update: {
          id?: string
          created_at?: string
          content?: string
          article_id?: string
          author_id?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
