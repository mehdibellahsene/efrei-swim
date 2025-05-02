import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';
import type { Profile, Event, Card, Purchase, Article, Comment } from './types';

// Create a simple random ID generator
const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36);

// Helper function to ensure profile exists for current user
export const ensureUserProfile = async (user?: User | null) => {
  try {
    // If no user passed, get the current user
    if (!user) {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      user = currentUser;
    }
    
    if (!user) return null;
    
    // Check if user has a profile
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
      
    if (profileError && profileError.code !== 'PGRST116') {
      console.error("Error checking user profile:", profileError);
    }
    
    // If no profile exists, create one
    if (!existingProfile) {
      const fullName = user.user_metadata?.full_name || 
                     user.user_metadata?.name ||
                     (user.email ? user.email.split('@')[0] : 'Unknown User');
      
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          full_name: fullName,
          role: 'visiteur'
        })
        .select()
        .single();
        
      if (insertError) {
        console.error("Error creating user profile:", insertError);
        return null;
      }
      
      return newProfile;
    }
    
    return existingProfile;
  } catch (error) {
    console.error("Error in ensureUserProfile:", error);
    return null;
  }
};

/**
 * Synchronize all users from auth table to profiles table
 * This ensures every authenticated user has a corresponding profile
 */
export async function syncUserProfiles(): Promise<boolean> {
  try {
    // Call the sync_existing_users function in the database
    const { error } = await supabase.rpc('sync_existing_users');
    
    if (error) {
      console.error('Error synchronizing user profiles:', error);
      return false;
    }
    
    console.log('User profiles synchronized successfully');
    return true;
  } catch (error) {
    console.error('Error synchronizing user profiles:', error);
    return false;
  }
}

/**
 * Ensures that the current authenticated user has a profile
 * If not, creates one with default values
 */
export async function ensureCurrentUserProfile(): Promise<Profile | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('No authenticated user found');
      return null;
    }
    
    // Check if the user already has a profile
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "no rows found" error
      console.error('Error checking for existing profile:', fetchError);
      return null;
    }
    
    if (existingProfile) {
      return existingProfile;
    }
    
    // No profile found, create one
    const userFullName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User';
    
    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        full_name: userFullName,
        email: user.email,
        role: 'visiteur' // Default role
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('Error creating user profile:', insertError);
      return null;
    }
    
    return newProfile;
  } catch (error) {
    console.error('Error ensuring user profile:', error);
    return null;
  }
}

// User Management Functions
export async function getUserProfile(userId: string): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

export async function updateUserProfile(userId: string, updates: Partial<Profile>): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return null;
  }
}

export async function getAllUsers(limit = 100): Promise<Profile[]> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    
    // Transform the data to match the expected format
    return data.map(user => ({
      id: user.id,
      email: user.email,
      name: user.full_name,
      role: user.role,
      avatar: user.avatar_url || "/placeholder.svg?height=40&width=40"
    })) || [];
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

export async function updateUserRole(userId: string, role: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating user role:', error);
    return false;
  }
}

// Check if user is an admin
export const isUserAdmin = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error || !data) return false;
    return data.role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

// Admin-specific API functions
export const adminAPI = {
  getAllUsers: async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },
  
  updateUserRole: async (userId: string, role: 'user' | 'admin' | 'member') => {
    const { data, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId);
      
    if (error) throw error;
    return data;
  }
};

// Event Management Functions
export async function createEvent(
  title: string,
  description: string,
  type: 'entrainement' | 'competition' | 'sortie',
  event_date: string,
  duration: number,
  location: string
): Promise<Event | null> {
  try {
    // Get the current authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    const newEvent = {
      title,
      description,
      type,
      event_date, // This matches the database column name
      duration,
      location,
      created_by: user.id
    };
    
    console.log('Creating event with data:', newEvent);
    
    const { data, error } = await supabase
      .from('events')
      .insert([newEvent])
      .select()
      .single();
    
    if (error) throw error;
    
    // If your interface uses 'date' but DB uses 'event_date', transform it here
    if (data && data.event_date) {
      return {
        ...data,
        date: data.event_date
      };
    }
    
    return data;
  } catch (error) {
    console.error('Error creating event:', error);
    return null;
  }
}

export async function getUpcomingEvents(limit = 10, upcomingOnly = true): Promise<Event[]> {
  try {
    const today = new Date().toISOString();
    
    // Build the query
    let query = supabase
      .from('events')
      .select('*, profiles:created_by(*)');
    
    // Only filter by date if upcomingOnly is true
    if (upcomingOnly) {
      query = query.gte('event_date', today);
    }
    
    // Add order and limit
    query = query.order('event_date', { ascending: true }).limit(limit);
    
    // Execute the query
    const { data: events, error } = await query;
    
    if (error) throw error;
    
    // Get participants for each event
    const eventsWithParticipants = await Promise.all(
      events.map(async (event) => {
        const { data: registrations, error: regError } = await supabase
          .from('event_registrations')
          .select('profiles:user_id(*)')
          .eq('event_id', event.id);
        
        if (regError) throw regError;
        
        // Transform participants data
        const participants = registrations
          ? registrations.map(reg => ({
              id: reg.profiles.id,
              name: reg.profiles.full_name,
              email: reg.profiles.email,
              role: reg.profiles.role,
              avatar: reg.profiles.avatar_url || "/placeholder.svg?height=40&width=40"
            }))
          : [];
        
        // Return transformed event
        return {
          id: event.id,
          title: event.title,
          description: event.description,
          type: event.type,
          date: event.event_date,
          duration: event.duration,
          location: event.location,
          participants
        };
      })
    );
    
    return eventsWithParticipants;
  } catch (error) {
    console.error('Error fetching events with participants:', error);
    return [];
  }
}

export async function getEventsByType(type: 'entrainement' | 'competition' | 'sortie'): Promise<Event[]> {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('type', type)
      .order('event_date', { ascending: true });  // Changed from 'date' to 'event_date'
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error(`Error fetching ${type} events:`, error);
    return [];
  }
}

export async function updateEvent(id: string, updates: Partial<Event>): Promise<Event | null> {
  try {
    const { data, error } = await supabase
      .from('events')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating event:', error);
    return null;
  }
}

export async function registerForEvent(eventId: string): Promise<boolean> {
  try {
    // First get the user data - await is required here
    const { data: { user } } = await supabase.auth.getUser();
    
    // Check if user is authenticated
    if (!user) throw new Error('User not authenticated');
    
    console.log('Registering user for event:', { 
      userId: user.id, 
      eventId 
    });
    
    // Now insert with the actual user ID
    const { error } = await supabase
      .from('event_registrations')
      .insert({
        event_id: eventId,
        user_id: user.id
      });
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error registering for event:', error);
    return false;
  }
}

export async function unregisterFromEvent(eventId: string): Promise<boolean> {
  try {
    const { user } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    const { error } = await supabase
      .from('event_registrations')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', user.id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error unregistering from event:', error);
    return false;
  }
}

// Card Management Functions
export async function createCard(
  cardId: string, 
  totalEntries: number, 
  purchasePrice: number, 
  notes: string | null = null
): Promise<Card | null> {
  try {
    // Get the current authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Map the individual parameters to the expected database schema
    const newCard = {
      card_id: cardId,
      total_entries: totalEntries,
      remaining_entries: totalEntries, // Initially, remaining entries equal total entries
      purchase_price: purchasePrice,
      status: "active", // Default to active
      notes: notes,
      owner_id: user.id // Add the owner ID from the authenticated user
    };
    
    console.log('Creating card with data:', newCard);
    
    const { data, error } = await supabase
      .from('cards')
      .insert(newCard)
      .select()
      .single();
    
    if (error) throw error;

    // Create a corresponding purchase in the budget
    await createPurchase({
      label: `Achat de carte ${cardId}`,
      amount: purchasePrice,
      date: new Date().toISOString(),
      category: "Entrées piscine",
      notes: notes || "",
    });

    return data;
  } catch (error) {
    console.error('Error creating card:', error);
    return null;
  }
}

export async function getAllCards(limit = 100): Promise<Card[]> {
  try {
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching cards:', error);
    return [];
  }
}

export async function updateCard(id: string, updates: Partial<Card>): Promise<Card | null> {
  try {
    const { data, error } = await supabase
      .from('cards')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating card:', error);
    return null;
  }
}

export async function deleteCard(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('cards')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting card:', error);
    return false;
  }
}

// Budget Management Functions
export async function createPurchase(purchaseData: Omit<Purchase, 'id'>): Promise<Purchase | null> {
  try {
    // Get the current authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated. Please log in again.');
    }

    // Map the purchase data to match the database column names
    const dbPurchaseData = {
      title: purchaseData.label,
      amount: purchaseData.amount,
      purchase_date: purchaseData.created_at || purchaseData.date, // Handle both variants
      category: purchaseData.category,
      description: purchaseData.notes || "",
      created_by: user.id // Add the user ID as created_by
    };
    
    console.log('Creating purchase with data:', dbPurchaseData);
    
    const { data, error } = await supabase
      .from('purchases')
      .insert(dbPurchaseData)
      .select()
      .single();
    
    if (error) throw error;
    
    // Map the returned data back to our frontend model
    return {
      id: data.id,
      label: data.title,
      amount: data.amount,
      date: data.purchase_date,
      category: data.category,
      notes: data.description
    };
  } catch (error) {
    console.error('Error creating purchase:', error);
    return null;
  }
}

export async function getBudgetSummary(
  startDate?: string | null,
  endDate?: string | null,
  categoryFilter?: string | null
): Promise<Purchase[]> {
  try {
    console.log('Fetching purchases with direct query');
    
    let query = supabase
      .from('purchases')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (startDate) {
      query = query.gte('purchase_date', startDate);  // Changed from 'date' to 'purchase_date'
    }
    
    if (endDate) {
      query = query.lte('purchase_date', endDate);  // Changed from 'date' to 'purchase_date'
    }
    
    if (categoryFilter) {
      query = query.eq('category', categoryFilter);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    // Map database results to our frontend model
    return data.map(item => ({
      id: item.id,
      label: item.title,
      amount: item.amount,
      date: item.purchase_date,
      category: item.category,
      notes: item.description,
      relatedCardId: item.card_id, // Add if this exists in your schema
    })) || [];
  } catch (error) {
    console.error('Error fetching budget summary:', error);
    return [];
  }
}

export async function getAllPurchases(): Promise<Purchase[]> {
  try {
    const { data, error } = await supabase
      .from('purchases')
      .select('*')
      .order('purchase_date', { ascending: false });
    
    if (error) throw error;
    
    // Transform the data to match the expected format
    return data.map(purchase => ({
      id: purchase.id,
      label: purchase.title,
      amount: purchase.amount,
      date: purchase.purchase_date,
      category: purchase.category,
      notes: purchase.description
    })) || [];
  } catch (error) {
    console.error('Error fetching purchases:', error);
    return [];
  }
}

export async function deletePurchase(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('purchases')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting purchase:', error);
    return false;
  }
}

// Article/Forum Functions
export async function createArticle(
  title: string, 
  content: string, 
  coverImage: string | null = null
): Promise<Article | null> {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Use RPC function instead of direct insert
    const { data, error } = await supabase
      .rpc('create_article', {
        title,
        content,
        cover_image: coverImage
      });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating article:', error);
    return null;
  }
}

export async function getAllArticles(limit: number = 10): Promise<Article[]> {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select(`
        *,
        profiles:author_id (id, full_name, avatar_url, role)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;

    // Transform the data to match the Article interface
    const articles = data.map(item => ({
      id: item.id,
      title: item.title,
      content: item.content,
      image_url: processArticleImageUrl(item.cover_image), // Map cover_image to image_url and process it
      cover_image: item.cover_image, // Keep original field for compatibility
      created_at: item.created_at,
      author_id: item.author_id,
      author_name: item.profiles.full_name,
      author_avatar: item.profiles.avatar_url,
      likes: item.likes,
      comments_count: item.comments_count
    }));

    return articles;
  } catch (error) {
    console.error("Error fetching articles:", error);
    return [];
  }
}

// Helper function to ensure image URLs are absolute
function processArticleImageUrl(url: string | null): string {
  if (!url) return '/placeholder.svg';
  
  // If it's already an absolute URL, return it
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If it's a Supabase Storage URL, make it absolute
  if (url.startsWith('storage/')) {
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${url.substring(8)}`;
  }
  
  // If it starts with a slash, it's a local URL
  if (url.startsWith('/')) {
    return url;
  }
  
  // Otherwise, assume it's a relative URL and add leading slash
  return `/${url}`;
}

export async function getArticle(id: string): Promise<Article | null> {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select(`
        *,
        profiles:author_id (id, full_name, avatar_url, role)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    if (!data) return null;

    return {
      id: data.id,
      title: data.title,
      content: data.content,
      cover_image: data.cover_image,
      created_at: data.created_at,
      author: {
        id: data.profiles.id,
        name: data.profiles.full_name,
        avatar: data.profiles.avatar_url,
        role: data.profiles.role
      },
      likes: data.likes,
      comments_count: data.comments_count
    };
  } catch (error) {
    console.error('Error fetching article:', error);
    return null;
  }
}

export async function addComment(articleId: string, content: string): Promise<Comment | null> {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const commentId = generateId();
    const newComment = {
      id: commentId,
      content,
      article_id: articleId,
      author_id: user.id
    };
    
    const { error } = await supabase
      .from('comments')
      .insert([newComment]);
    
    if (error) throw error;

    // Update comment count for the article
    await supabase.rpc('increment_comment_count', { article_id: articleId });

    return {
      id: commentId,
      content,
      article_id: articleId,
      author_id: user.id,
      created_at: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error adding comment:', error);
    return null;
  }
}