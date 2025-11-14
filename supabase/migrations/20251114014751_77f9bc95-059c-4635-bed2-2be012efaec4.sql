-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create enum for app roles
CREATE TYPE public.app_role AS ENUM ('admin', 'chair', 'co_chair', 'em', 'user');

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to check if user has admin-level access
CREATE OR REPLACE FUNCTION public.is_admin_user(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'chair', 'co_chair', 'em')
  )
$$;

-- Profiles RLS policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin_user(auth.uid()));

-- User roles RLS policies
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.is_admin_user(auth.uid()));

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Add status column to assessments for tracking review process
ALTER TABLE public.assessments
ADD COLUMN IF NOT EXISTS review_status TEXT DEFAULT 'new',
ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS admin_notes TEXT,
ADD COLUMN IF NOT EXISTS is_shortlisted BOOLEAN DEFAULT false;

-- Add index for admin queries
CREATE INDEX idx_assessments_review_status ON public.assessments(review_status);
CREATE INDEX idx_assessments_shortlisted ON public.assessments(is_shortlisted);

-- Update assessments RLS to allow admin access
CREATE POLICY "Admins can view all assessments"
  ON public.assessments FOR SELECT
  USING (public.is_admin_user(auth.uid()));

CREATE POLICY "Admins can update assessments"
  ON public.assessments FOR UPDATE
  USING (public.is_admin_user(auth.uid()));

-- Update assessment_responses RLS for admin access
CREATE POLICY "Admins can view all responses"
  ON public.assessment_responses FOR SELECT
  USING (public.is_admin_user(auth.uid()));

-- Update assessment_results RLS for admin access
CREATE POLICY "Admins can view all results"
  ON public.assessment_results FOR SELECT
  USING (public.is_admin_user(auth.uid()));

CREATE POLICY "Admins can update results"
  ON public.assessment_results FOR UPDATE
  USING (public.is_admin_user(auth.uid()));

-- Create trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create trigger for profile updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create audit log table
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on audit_log
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Audit log policies
CREATE POLICY "Admins can view audit log"
  ON public.audit_log FOR SELECT
  USING (public.is_admin_user(auth.uid()));

CREATE POLICY "Anyone can insert audit log"
  ON public.audit_log FOR INSERT
  WITH CHECK (true);

CREATE INDEX idx_audit_log_user_id ON public.audit_log(user_id);
CREATE INDEX idx_audit_log_created_at ON public.audit_log(created_at DESC);