-- Create verticals table for dynamic management
CREATE TABLE public.verticals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.verticals ENABLE ROW LEVEL SECURITY;

-- Anyone can view active verticals
CREATE POLICY "Anyone can view active verticals"
ON public.verticals
FOR SELECT
USING (is_active = true);

-- Admins can view all verticals
CREATE POLICY "Admins can view all verticals"
ON public.verticals
FOR SELECT
USING (is_admin_user(auth.uid()));

-- Admins can manage verticals
CREATE POLICY "Admins can manage verticals"
ON public.verticals
FOR ALL
USING (is_admin_user(auth.uid()));

-- Add trigger for updated_at
CREATE TRIGGER update_verticals_updated_at
BEFORE UPDATE ON public.verticals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default verticals
INSERT INTO public.verticals (name, description, display_order) VALUES
('Masoom', 'Child welfare and education programs', 1),
('Road Safety', 'Community road safety awareness and enforcement', 2),
('Climate Change', 'Environmental sustainability and green initiatives', 3),
('Thalir', 'Youth empowerment and skill development', 4),
('Yuva', 'Young professional networking and leadership', 5),
('Health', 'Public health awareness and medical camps', 6),
('Innovation', 'Technology and entrepreneurship initiatives', 7),
('Sports', 'Sports events and fitness programs', 8),
('Membership', 'Member engagement and community building', 9);