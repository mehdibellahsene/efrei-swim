-- Drop existing objects to create brand new ones
DROP TABLE IF EXISTS articles CASCADE;
DROP TABLE IF EXISTS cards CASCADE;
DROP TABLE IF EXISTS event_registrations CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS purchases CASCADE; 
DROP TABLE IF EXISTS comments CASCADE; -- Added comments table

DROP FUNCTION IF EXISTS create_event CASCADE;
DROP FUNCTION IF EXISTS create_card CASCADE;
DROP FUNCTION IF EXISTS get_upcoming_events CASCADE;
DROP FUNCTION IF EXISTS register_for_event CASCADE;
DROP FUNCTION IF EXISTS unregister_from_event CASCADE;
DROP FUNCTION IF EXISTS create_article CASCADE;
DROP FUNCTION IF EXISTS update_modified_column CASCADE;
DROP FUNCTION IF EXISTS create_profile_for_user CASCADE;

-- New functions to drop
DROP FUNCTION IF EXISTS update_article CASCADE;
DROP FUNCTION IF EXISTS delete_article CASCADE;
DROP FUNCTION IF EXISTS get_articles CASCADE;
DROP FUNCTION IF EXISTS get_article_by_id CASCADE;
DROP FUNCTION IF EXISTS update_card CASCADE;
DROP FUNCTION IF EXISTS delete_card CASCADE;
DROP FUNCTION IF EXISTS use_card_entry CASCADE;
DROP FUNCTION IF EXISTS get_all_cards CASCADE;
DROP FUNCTION IF EXISTS get_card_by_id CASCADE;
DROP FUNCTION IF EXISTS create_purchase CASCADE;
DROP FUNCTION IF EXISTS update_purchase CASCADE;
DROP FUNCTION IF EXISTS delete_purchase CASCADE;
DROP FUNCTION IF EXISTS get_budget_summary CASCADE;
DROP FUNCTION IF EXISTS update_user_role CASCADE;
DROP FUNCTION IF EXISTS get_all_users CASCADE;
DROP FUNCTION IF EXISTS increment_comment_count CASCADE; -- Added function to drop

-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL, -- Added email for easier reference
  avatar_url TEXT, -- Added avatar URL
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
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Added creator reference
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  participants UUID[] DEFAULT '{}' -- Added for tracking participants
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
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'expired', 'lost', 'suspended')) DEFAULT 'active',
  purchase_price DECIMAL(10, 2),
  notes TEXT,
  owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Added owner reference
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create articles table for the forum/news section
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  cover_image TEXT,
  author_id UUID REFERENCES profiles(id) NOT NULL,
  likes INTEGER NOT NULL DEFAULT 0, -- Added likes counter
  comments_count INTEGER NOT NULL DEFAULT 0, -- Added comments counter
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create comments table for article comments
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create purchases table for budget tracking
CREATE TABLE purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  category TEXT NOT NULL,
  purchase_date TIMESTAMP WITH TIME ZONE NOT NULL,
  description TEXT,
  receipt_url TEXT,
  created_by UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a function to increment comment count
CREATE OR REPLACE FUNCTION increment_comment_count(article_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE articles
  SET comments_count = comments_count + 1
  WHERE id = article_id;
END;
$$ LANGUAGE plpgsql;

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
  user_id UUID;
  new_event events;
BEGIN
  -- Get the current user's ID
  user_id := auth.uid();
  
  -- Ensure user is admin or membre
  IF user_id IS NULL OR NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id AND (role = 'admin' OR role = 'membre')
  ) THEN
    RAISE EXCEPTION 'Only admins and membres can create events';
  END IF;
  
  -- Validate inputs
  IF type NOT IN ('entrainement', 'competition', 'sortie') THEN
    RAISE EXCEPTION 'Invalid event type';
  END IF;

  -- Insert the event
  INSERT INTO events(title, description, type, event_date, duration, location, created_by)
  VALUES (title, description, type, event_date, duration, location, user_id)
  RETURNING * INTO new_event;
  
  RETURN new_event;
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
  
  -- Ensure user exists and is admin or membre
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id AND (role = 'admin' OR role = 'membre')
  ) THEN
    RAISE EXCEPTION 'Only admins and membres can create articles';
  END IF;

  -- Insert the article
  INSERT INTO articles(title, content, cover_image, author_id, likes, comments_count)
  VALUES (title, content, cover_image, user_id, 0, 0)
  RETURNING * INTO new_article;
  
  RETURN new_article;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create comment function
CREATE OR REPLACE FUNCTION create_comment(
  article_id UUID,
  content TEXT
) RETURNS comments AS $$
DECLARE
  user_id UUID;
  new_comment comments;
BEGIN
  -- Get the current user's ID
  user_id := auth.uid();
  
  -- Ensure user exists
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- Insert the comment
  INSERT INTO comments(content, article_id, author_id)
  VALUES (content, article_id, user_id)
  RETURNING * INTO new_comment;
  
  -- Update comment count on article
  PERFORM increment_comment_count(article_id);
  
  RETURN new_comment;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY; -- Added for comments table

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

-- Cards policies (admin access only)
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

-- Purchases policies
CREATE POLICY "Users can view their own purchases"
  ON purchases FOR SELECT
  USING (auth.uid() = created_by);

CREATE POLICY "Admins can view all purchases"
  ON purchases FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Members can view all purchases"
  ON purchases FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'membre'
  ));

CREATE POLICY "Users can create purchases if they are admin or membre"
  ON purchases FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND (role = 'admin' OR role = 'membre')
  ));

CREATE POLICY "Users can update their own purchases"
  ON purchases FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Admins can update all purchases"
  ON purchases FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Users can delete their own purchases"
  ON purchases FOR DELETE
  USING (auth.uid() = created_by);

CREATE POLICY "Admins can delete any purchase"
  ON purchases FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- Comments policies
CREATE POLICY "Comments are viewable by everyone"
  ON comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authors can update their own comments"
  ON comments FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Admins can update all comments"
  ON comments FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Authors can delete their own comments"
  ON comments FOR DELETE
  USING (auth.uid() = author_id);

CREATE POLICY "Admins can delete any comment"
  ON comments FOR DELETE
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

-- Update the updated_at timestamp for purchases
CREATE TRIGGER update_purchase_modified
BEFORE UPDATE ON purchases
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Create default profile on user signup with better error handling
CREATE OR REPLACE FUNCTION create_profile_for_user()
RETURNS TRIGGER AS $$
DECLARE
  user_fullname TEXT;
BEGIN
  -- Safely extract full name from user metadata with better fallback handling
  -- Fix field names to match Supabase auth.users table structure
  user_fullname := 
    COALESCE(
      NEW.raw_user_meta_data->>'full_name', 
      NEW.raw_app_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      NEW.raw_app_meta_data->>'name'
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

  INSERT INTO profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    user_fullname,
    NEW.email,
    'visiteur'
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email
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

-- Function to synchronize existing users with profiles table
CREATE OR REPLACE FUNCTION sync_existing_users()
RETURNS void AS $$
DECLARE
  existing_user RECORD;
  user_fullname TEXT;
BEGIN
  FOR existing_user IN SELECT * FROM auth.users LOOP
    -- Check if user already has a profile
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = existing_user.id) THEN
      -- Extract fullname with same logic as in create_profile_for_user
      -- Fix field names to match Supabase auth.users table structure
      user_fullname := 
        COALESCE(
          existing_user.raw_user_meta_data->>'full_name', 
          existing_user.raw_app_meta_data->>'full_name',
          existing_user.raw_user_meta_data->>'name',
          existing_user.raw_app_meta_data->>'name'
        );

      -- If still null, use email for username (safely)
      IF user_fullname IS NULL OR user_fullname = '' THEN
        user_fullname := CASE 
          WHEN existing_user.email IS NOT NULL AND existing_user.email <> '' THEN 
            COALESCE(split_part(existing_user.email, '@', 1), 'Unknown User')
          ELSE 
            'Unknown User'
        END;
      END IF;

      -- Create profile for existing user
      INSERT INTO profiles (id, full_name, email, role)
      VALUES (
        existing_user.id,
        user_fullname,
        existing_user.email,
        'visiteur'
      );
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Call the synchronization function on database initialization
SELECT sync_existing_users();

-- Sample admin user
DO $$
DECLARE
  admin_id UUID;
  user_exists BOOLEAN;
  user_email TEXT;
BEGIN
  -- Check if there are any users in auth.users table
  SELECT EXISTS (SELECT 1 FROM auth.users LIMIT 1) INTO user_exists;
  
  -- Only proceed if we have users
  IF user_exists THEN
    -- First check if we already have an admin user
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE role = 'admin') THEN
      -- Get the first user from auth.users to make them admin
      SELECT id, email INTO admin_id, user_email FROM auth.users LIMIT 1;
      
      IF admin_id IS NOT NULL THEN
        -- If the user already has a profile, update it; otherwise insert
        IF EXISTS (SELECT 1 FROM profiles WHERE id = admin_id) THEN
          UPDATE profiles SET role = 'admin' WHERE id = admin_id;
        ELSE
          INSERT INTO profiles (id, full_name, email, role, created_at, updated_at)
          VALUES (
            admin_id, 
            COALESCE(
              (SELECT 
                COALESCE(
                  raw_user_meta_data->>'full_name',
                  raw_app_meta_data->>'full_name',
                  raw_user_meta_data->>'name',
                  raw_app_meta_data->>'name',
                  split_part(email, '@', 1)
                ) 
              FROM auth.users WHERE id = admin_id),
              'Admin User'
            ),
            user_email,
            'admin', 
            NOW(), 
            NOW()
          );
        END IF;
        
        RAISE NOTICE 'User with ID % has been set as admin', admin_id;
      END IF;
    END IF;
  ELSE
    RAISE NOTICE 'No users found in auth.users table. Skipping admin user creation.';
  END IF;
END
$$;

-- Sample events
INSERT INTO events (title, description, type, event_date, duration, location, created_at)
VALUES
  ('Entraînement hebdomadaire', 'Venez vous entraîner avec nous pour améliorer votre technique.', 'entrainement', NOW() + interval '1 week', 120, 'Piscine municipale', NOW()),
  ('Compétition régionale', 'Compétition régionale de natation avec plusieurs clubs.', 'competition', NOW() + interval '2 weeks', 240, 'Piscine olympique', NOW()),
  ('Sortie de cohésion', 'Une journée de cohésion pour renforcer l''esprit d''équipe.', 'sortie', NOW() + interval '1 month', 300, 'Lac de Corbeil', NOW()),
  ('Entraînement spécial débutants', 'Session dédiée aux nouveaux membres pour apprendre les bases.', 'entrainement', NOW() + interval '3 days', 90, 'Piscine municipale', NOW()),
  ('Compétition nationale', 'Qualification pour les championnats nationaux', 'competition', NOW() + interval '3 months', 480, 'Piscine nationale', NOW())
ON CONFLICT DO NOTHING;

-- Sample cards
INSERT INTO cards (card_id, total_entries, remaining_entries, status, purchase_price, notes, created_at)
VALUES
  ('CARD-001', 10, 10, 'active', 50.00, 'Carte abonnement mensuel', NOW()),
  ('CARD-002', 20, 15, 'active', 90.00, 'Carte abonnement trimestriel', NOW()),
  ('CARD-003', 5, 0, 'expired', 25.00, 'Carte d''essai', NOW()),
  ('CARD-004', 30, 28, 'active', 120.00, 'Carte abonnement annuel', NOW()),
  ('CARD-005', 10, 8, 'active', 50.00, 'Carte standard', NOW())
ON CONFLICT DO NOTHING;

-- Sample purchases (only if admin user exists)
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  SELECT id INTO admin_user_id FROM profiles WHERE role = 'admin' LIMIT 1;
  
  IF admin_user_id IS NOT NULL THEN
    INSERT INTO purchases (title, amount, category, purchase_date, description, created_by, created_at, updated_at)
    VALUES
      ('Achat de matériel d''entraînement', 150.00, 'Équipement', NOW() - interval '2 weeks', 'Planches, pull-buoys et palmes', admin_user_id, NOW(), NOW()),
      ('Location de la piscine', 300.00, 'Location', NOW() - interval '1 month', 'Location mensuelle de la piscine municipale', admin_user_id, NOW(), NOW()),
      ('Frais d''inscription compétition', 75.00, 'Compétition', NOW() - interval '3 weeks', 'Frais d''inscription à la compétition régionale', admin_user_id, NOW(), NOW()),
      ('Achat de maillots de bain', 200.00, 'Équipement', NOW() - interval '1 week', 'Maillots de bain pour l''équipe', admin_user_id, NOW(), NOW()),
      ('Transport en bus', 120.00, 'Transport', NOW() - interval '2 months', 'Transport pour la compétition de Marseille', admin_user_id, NOW(), NOW())
    ON CONFLICT DO NOTHING;
  END IF;
END
$$;

-- Sample articles (only if admin user exists)
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  SELECT id INTO admin_user_id FROM profiles WHERE role = 'admin' LIMIT 1;
  
  IF admin_user_id IS NOT NULL THEN
    INSERT INTO articles (title, content, cover_image, author_id, created_at, updated_at)
    VALUES
      ('Bienvenue sur le site du club!', 'Nous sommes ravis de vous accueillir sur notre nouvelle plateforme en ligne. Vous pourrez y retrouver toutes les informations concernant nos activités.', '/images/welcome.jpg', admin_user_id, NOW(), NOW()),
      ('Résultats de la compétition régionale', 'Félicitations à tous nos nageurs qui ont participé à la compétition régionale du weekend dernier. Nous avons remporté 3 médailles d''or et 5 médailles d''argent.', '/images/competition.jpg', admin_user_id, NOW(), NOW()),
      ('Nouveaux horaires d''entraînement', 'À partir du mois prochain, nous modifions légèrement les horaires d''entraînement pour les différents groupes. Veuillez consulter l''article pour plus de détails.', NULL, admin_user_id, NOW(), NOW()),
      ('Préparation physique : conseils et exercices', 'La préparation physique est essentielle pour améliorer vos performances en natation. Découvrez nos conseils et exercices recommandés.', '/images/training.jpg', admin_user_id, NOW(), NOW()),
      ('Stage de perfectionnement durant les vacances', 'Nous organisons un stage de perfectionnement pendant les vacances scolaires. Les inscriptions sont ouvertes jusqu''à la fin du mois.', '/images/camp.jpg', admin_user_id, NOW(), NOW())
    ON CONFLICT DO NOTHING;
  END IF;
END
$$;

-- Register some sample event registrations if users exist
DO $$
DECLARE
  user_id UUID;
  event_id UUID;
BEGIN
  -- Get a random user
  SELECT id INTO user_id FROM profiles ORDER BY RANDOM() LIMIT 1;
  
  IF user_id IS NOT NULL THEN
    -- Get a random event
    SELECT id INTO event_id FROM events ORDER BY RANDOM() LIMIT 1;
    
    IF event_id IS NOT NULL THEN
      INSERT INTO event_registrations (user_id, event_id, registered_at)
      VALUES (user_id, event_id, NOW())
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;
END
$$;