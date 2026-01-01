-- Create site_settings table for admin-configurable settings
CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Admins can manage settings
CREATE POLICY "Admins can manage settings"
ON public.site_settings
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Anyone can read settings (needed to check payment URL)
CREATE POLICY "Settings are publicly readable"
ON public.site_settings
FOR SELECT
USING (true);

-- Insert default Paystack setting
INSERT INTO public.site_settings (key, value, description)
VALUES ('paystack_payment_url', '', 'Paystack payment page URL for premium subscriptions');

-- Create trigger for updated_at
CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();