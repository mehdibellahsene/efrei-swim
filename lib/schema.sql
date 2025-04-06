-- Drop existing objects to create brand new ones
DROP TABLE IF EXISTS articles CASCADE;
DROP TABLE IF EXISTS cards CASCADE;
DROP TABLE IF EXISTS event_registrations CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

DROP FUNCTION IF EXISTS create_event CASCADE;
DROP FUNCTION IF EXISTS create_card CASCADE;
DROP FUNCTION IF EXISTS get_upcoming_events CASCADE;
DROP FUNCTION IF EXISTS register_for_event CASCADE;
DROP FUNCTION IF EXISTS unregister_from_event CASCADE;
DROP FUNCTION IF EXISTS create_article CASCADE;
DROP FUNCTION IF EXISTS update_modified_column CASCADE;
DROP FUNCTION IF EXISTS create_profile_for_user CASCADE;

-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'visiteur',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create events table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('entrainement', 'competition', 'sortie')),
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER NOT NULL, -- in minutes
  location TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create event_registrations table to track user event registrations
CREATE TABLE event_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  event_id UUID REFERENCES events(id) NOT NULL,
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, event_id)
);

-- Create cards table for tracking entry cards
CREATE TABLE cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  card_id TEXT UNIQUE NOT NULL,
  total_entries INTEGER NOT NULL,
  remaining_entries INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  purchase_price DECIMAL(10, 2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create articles table for the forum/news section
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  cover_image TEXT,
  author_id UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an event with proper validation
CREATE OR REPLACE FUNCTION create_event(
  title TEXT,
  description TEXT,
  type TEXT,
  event_date TIMESTAMP WITH TIME ZONE,
  duration INTEGER,
  location TEXT
) RETURNS events AS $$
DECLARE
  new_event events;
BEGIN
  -- Validate inputs
  IF type NOT IN ('entrainement', 'competition', 'sortie') THEN
    RAISE EXCEPTION 'Invalid event type';
  END IF;

  -- Insert the event
  INSERT INTO events(title, description, type, event_date, duration, location)
  VALUES (title, description, type, event_date, duration, location)
  RETURNING * INTO new_event;
  
  RETURN new_event;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a card with validation
CREATE OR REPLACE FUNCTION create_card(
  card_id TEXT,
  total_entries INTEGER,
  purchase_price DECIMAL(10, 2),
  notes TEXT DEFAULT NULL
) RETURNS cards AS $$
DECLARE
  new_card cards;
BEGIN
  -- Validate inputs
  IF total_entries <= 0 THEN
    RAISE EXCEPTION 'Total entries must be positive';
  END IF;

  -- Insert the card
  INSERT INTO cards(card_id, total_entries, remaining_entries, purchase_price, notes)
  VALUES (card_id, total_entries, total_entries, purchase_price, notes)
  RETURNING * INTO new_card;
  
  RETURN new_card;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get upcoming events with filtering
CREATE OR REPLACE FUNCTION get_upcoming_events(
  limit_count INTEGER DEFAULT 5,
  filter_type TEXT DEFAULT NULL
) RETURNS SETOF events AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM events
  WHERE 
    event_date >= NOW() AND
    (filter_type IS NULL OR type = filter_type)
  ORDER BY event_date ASC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Register user for an event
CREATE OR REPLACE FUNCTION register_for_event(
  event_id UUID
) RETURNS event_registrations AS $$
DECLARE
  user_id UUID;
  new_registration event_registrations;
BEGIN
  -- Get the current user's ID
  user_id := auth.uid();
  
  -- Ensure user exists
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- Insert the registration
  INSERT INTO event_registrations(user_id, event_id)
  VALUES (user_id, event_id)
  RETURNING * INTO new_registration;
  
  RETURN new_registration;
EXCEPTION
  WHEN unique_violation THEN
    RAISE EXCEPTION 'Already registered for this event';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Unregister from an event
CREATE OR REPLACE FUNCTION unregister_from_event(
  event_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  user_id UUID;
  rows_deleted INTEGER;
BEGIN
  -- Get the current user's ID
  user_id := auth.uid();
  
  -- Ensure user exists
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- Delete the registration
  DELETE FROM event_registrations
  WHERE user_id = user_id AND event_id = event_id
  RETURNING 1 INTO rows_deleted;
  
  RETURN rows_deleted > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create an article
CREATE OR REPLACE FUNCTION create_article(
  title TEXT,
  content TEXT,
  cover_image TEXT DEFAULT NULL
) RETURNS articles AS $$
DECLARE
  user_id UUID;
  new_article articles;
BEGIN
  -- Get the current user's ID
  user_id := auth.uid();
  
  -- Ensure user exists
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- Insert the article
  INSERT INTO articles(title, content, cover_image, author_id)
  VALUES (title, content, cover_image, user_id)
  RETURNING * INTO new_article;
  
  RETURN new_article;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Events policies
CREATE POLICY "Events are viewable by everyone"
  ON events FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert events"
  ON events FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Only admins can update events"
  ON events FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Only admins can delete events"
  ON events FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- Registration policies
CREATE POLICY "Users can view their own registrations"
  ON event_registrations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all registrations"
  ON event_registrations FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Users can register themselves"
  ON event_registrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unregister themselves"
  ON event_registrations FOR DELETE
  USING (auth.uid() = user_id);

-- Cards policies (admin access only) - Split the "FOR ALL" policy
CREATE POLICY "Only admins can view cards"
  ON cards FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Only admins can insert cards"
  ON cards FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Only admins can update cards"
  ON cards FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Only admins can delete cards"
  ON cards FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- Articles policies
CREATE POLICY "Articles are viewable by everyone"
  ON articles FOR SELECT
  USING (true);

CREATE POLICY "Only membres and admins can create articles"
  ON articles FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND (role = 'membre' OR role = 'admin')
  ));

CREATE POLICY "Users can edit their own articles"
  ON articles FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Admins can edit all articles"
  ON articles FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Users can delete their own articles"
  ON articles FOR DELETE
  USING (auth.uid() = author_id);

CREATE POLICY "Admins can delete any article"
  ON articles FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- Update the updated_at timestamp for profiles
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profile_modified
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Update the updated_at timestamp for articles
CREATE TRIGGER update_article_modified
BEFORE UPDATE ON articles
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Create default profile on user signup with better error handling
CREATE OR REPLACE FUNCTION create_profile_for_user()
RETURNS TRIGGER AS $$
DECLARE
  user_fullname TEXT;
BEGIN
  -- Safely extract full name from user metadata with better fallback handling
  -- First try to get from raw_user_meta_data, then from user_metadata for magic links
  user_fullname := 
    COALESCE(
      NEW.raw_user_meta_data->>'full_name', 
      NEW.user_metadata->>'full_name',
      NEW.raw_user_meta_data->>'name',
      NEW.user_metadata->>'name'
    );

  -- If still null, use email for username (safely)
  IF user_fullname IS NULL OR user_fullname = '' THEN
    user_fullname := CASE 
      WHEN NEW.email IS NOT NULL AND NEW.email <> '' THEN 
        COALESCE(split_part(NEW.email, '@', 1), 'Unknown User')
      ELSE 
        'Unknown User'
    END;
  END IF;

  INSERT INTO profiles (id, full_name, role)
  VALUES (
    NEW.id,
    user_fullname,
    'visiteur'
  )
  ON CONFLICT (id) DO UPDATE
  SET full_name = EXCLUDED.full_name
  WHERE profiles.full_name IS NULL OR profiles.full_name = '';

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the user creation
    RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if it exists before recreating it
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION create_profile_for_user();