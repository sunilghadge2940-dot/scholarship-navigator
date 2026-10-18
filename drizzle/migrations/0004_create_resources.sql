CREATE TABLE public.resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL DEFAULT 'book' CHECK (type IN ('book','course')),
  provider text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  pricing text NOT NULL DEFAULT 'free' CHECK (pricing IN ('free','paid')),
  price_text text NOT NULL DEFAULT '',
  official_url text NOT NULL,
  country_code text REFERENCES public.countries(code),
  education_levels text[] NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid NOT NULL,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.resources TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.resources TO authenticated;
GRANT ALL ON public.resources TO service_role;

ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public reads active resources" ON public.resources
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "staff read all resources" ON public.resources
  FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));

CREATE POLICY "editors create resources" ON public.resources
  FOR INSERT TO authenticated
  WITH CHECK ((public.has_role(auth.uid(), 'editor') OR public.has_role(auth.uid(), 'super_admin')) AND created_by = auth.uid());

CREATE POLICY "editors update resources" ON public.resources
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'editor') OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'editor') OR public.has_role(auth.uid(), 'super_admin'));

CREATE TRIGGER resources_touch BEFORE UPDATE ON public.resources
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();