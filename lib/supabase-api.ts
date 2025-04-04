import { supabase } from "./supabase";
import type { Article, Card, Event } from "./types";

// Get upcoming events
export const getUpcomingEvents = async (limit = 5, type: string | null = null): Promise<Event[]> => {
  const { data, error } = await supabase
    .rpc('get_upcoming_events', { limit_count: limit, filter_type: type });
    
  if (error) throw error;
  return data || [];
};

// Register for an event
export const registerForEvent = async (eventId: string): Promise<any> => {
  const { data, error } = await supabase
    .rpc('register_for_event', { event_id: eventId });
    
  if (error) throw error;
  return data;
};

// Unregister from an event
export const unregisterFromEvent = async (eventId: string): Promise<any> => {
  const { data, error } = await supabase
    .rpc('unregister_from_event', { event_id: eventId });
    
  if (error) throw error;
  return data;
};

// Create a new event
export const createEvent = async (
  title: string,
  description: string,
  type: "entrainement" | "competition" | "sortie",
  date: string,
  duration: number,
  location: string
): Promise<Event> => {
  const { data, error } = await supabase
    .rpc('create_event', { 
      title: title,
      description: description,
      type: type,
      event_date: date,
      duration: duration,
      location: location
    });
    
  if (error) throw error;
  return data;
};

// Create a new card
export const createCard = async (
  cardId: string, 
  totalEntries: number, 
  purchasePrice: number, 
  notes: string | null = null
): Promise<Card> => {
  const { data, error } = await supabase
    .rpc('create_card', { 
      card_id: cardId,
      total_entries: totalEntries,
      purchase_price: purchasePrice,
      notes: notes
    });
    
  if (error) throw error;
  return data;
};

// Create an article
export const createArticle = async (
  title: string, 
  content: string, 
  coverImage: string | null = null
): Promise<Article> => {
  const { data, error } = await supabase
    .rpc('create_article', { 
      title: title,
      content: content,
      cover_image: coverImage
    });
    
  if (error) throw error;
  return data;
}; 