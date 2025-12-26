-- Create app_role enum for admin system
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table for secure role management
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Create albums table
CREATE TABLE public.albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  release_year INTEGER,
  genre TEXT,
  is_public BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on albums
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;

-- Albums RLS policies
CREATE POLICY "Public albums are viewable" ON public.albums
  FOR SELECT USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can create albums" ON public.albums
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own albums" ON public.albums
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own albums" ON public.albums
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all albums" ON public.albums
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Add album_id to songs table
ALTER TABLE public.songs ADD COLUMN album_id UUID REFERENCES public.albums(id) ON DELETE SET NULL;

-- Create featured_artists table
CREATE TABLE public.featured_artists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_name TEXT NOT NULL UNIQUE,
  bio TEXT,
  image_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  monthly_listeners INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on featured_artists
ALTER TABLE public.featured_artists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Featured artists are viewable" ON public.featured_artists
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage featured artists" ON public.featured_artists
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Create site_analytics table for admin dashboard
CREATE TABLE public.site_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  total_users INTEGER DEFAULT 0,
  new_users INTEGER DEFAULT 0,
  total_plays INTEGER DEFAULT 0,
  total_uploads INTEGER DEFAULT 0,
  storage_used_mb NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on site_analytics
ALTER TABLE public.site_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view analytics" ON public.site_analytics
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert analytics" ON public.site_analytics
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update analytics" ON public.site_analytics
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Trigger to update albums updated_at
CREATE TRIGGER update_albums_updated_at
  BEFORE UPDATE ON public.albums
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();