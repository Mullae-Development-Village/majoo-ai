-- Create user type enum
CREATE TYPE user_type AS ENUM ('youth', 'senior');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type user_type NOT NULL,
  full_name TEXT NOT NULL,
  age INTEGER,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Categories policies
CREATE POLICY "Categories are viewable by everyone"
  ON public.categories FOR SELECT
  TO authenticated
  USING (true);

-- Create profile_assets table
CREATE TABLE public.profile_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, category_id)
);

-- Enable RLS on profile_assets
ALTER TABLE public.profile_assets ENABLE ROW LEVEL SECURITY;

-- Profile assets policies
CREATE POLICY "Users can view all profile assets"
  ON public.profile_assets FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage their own profile assets"
  ON public.profile_assets FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = profile_assets.profile_id
    AND profiles.user_id = auth.uid()
  ));

-- Create profile_needs table
CREATE TABLE public.profile_needs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, category_id)
);

-- Enable RLS on profile_needs
ALTER TABLE public.profile_needs ENABLE ROW LEVEL SECURITY;

-- Profile needs policies
CREATE POLICY "Users can view all profile needs"
  ON public.profile_needs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage their own profile needs"
  ON public.profile_needs FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = profile_needs.profile_id
    AND profiles.user_id = auth.uid()
  ));

-- Insert default categories
INSERT INTO public.categories (name, type) VALUES
  ('스마트폰 기본', 'digital'),
  ('온행/공공 앱 사용', 'digital'),
  ('키오스크 연습', 'digital'),
  ('PC (문서 작성, 이메일)', 'digital'),
  ('이력서/자소서 피드백', 'career'),
  ('모의 면접 (인사팀 관점)', 'career'),
  ('00 산업 이야기', 'career'),
  ('경력/전문분야', 'experience'),
  ('인생 상담', 'life'),
  ('취미/특기', 'hobby');

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();