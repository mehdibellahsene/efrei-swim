import { supabase } from "../supabase";
import type { Card } from "./types";

// Get upcoming events
export const getUpcomingEvents = async (limit = 5, type = null) => {
  const { data, error } = await supabase
    .rpc('get_upcoming_events', { limit_count: limit, filter_type: type });
    
  if (error) throw error;
  return data;
};

// Register for an event
export const registerForEvent = async (eventId) => {
  const { data, error } = await supabase
    .rpc('register_for_event', { event_id: eventId });
    
  if (error) throw error;
  return data;
};

// Unregister from an event
export const unregisterFromEvent = async (eventId) => {
  const { data, error } = await supabase
    .rpc('unregister_from_event', { event_id: eventId });
    
  if (error) throw error;
  return data;
};

// Create a new card
export const createCard = async (cardId, totalEntries, purchasePrice, notes = null) => {
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
export const createArticle = async (title, content, coverImage = null) => {
  const { data, error } = await supabase
    .rpc('create_article', { 
      title: title,
      content: content,
      cover_image: coverImage
    });
    
  if (error) throw error;
  return data;
}; 