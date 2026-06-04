-- Profile additions
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS diamonds integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS theme text NOT NULL DEFAULT 'dark',
  ADD COLUMN IF NOT EXISTS language text NOT NULL DEFAULT 'en';

-- AIRCIMP tokens
CREATE TABLE IF NOT EXISTS public.aircimp_tokens (
  code text PRIMARY KEY,
  redeemed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  redeemed_at timestamptz,
  generated_by uuid,
  generated_at timestamptz DEFAULT now()
);
GRANT SELECT, INSERT ON public.aircimp_tokens TO authenticated;
GRANT SELECT ON public.aircimp_tokens TO anon;
GRANT ALL ON public.aircimp_tokens TO service_role;
ALTER TABLE public.aircimp_tokens ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tokens_select_all" ON public.aircimp_tokens;
CREATE POLICY "tokens_select_all" ON public.aircimp_tokens FOR SELECT USING (true);
DROP POLICY IF EXISTS "tokens_insert_premium" ON public.aircimp_tokens;
CREATE POLICY "tokens_insert_premium" ON public.aircimp_tokens FOR INSERT TO authenticated
  WITH CHECK (
    generated_by = auth.uid()
    AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.verified = true)
  );

CREATE TABLE IF NOT EXISTS public.token_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL REFERENCES public.aircimp_tokens(code),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.token_redemptions TO authenticated;
GRANT ALL ON public.token_redemptions TO service_role;
ALTER TABLE public.token_redemptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "redemptions_select_own" ON public.token_redemptions;
CREATE POLICY "redemptions_select_own" ON public.token_redemptions FOR SELECT TO authenticated USING (user_id = auth.uid());

INSERT INTO public.aircimp_tokens (code) VALUES
  ('AIRCIMP-GOLD-001'),
  ('AIRCIMP-GOLD-002'),
  ('AIRCIMP-GOLD-003'),
  ('AIRCIMP-GOLD-004'),
  ('AIRCIMP-GOLD-005')
ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION public.redeem_aircimp_token(token_code text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uid uuid := auth.uid();
  norm text := upper(trim(token_code));
  tok public.aircimp_tokens%ROWTYPE;
BEGIN
  IF uid IS NULL THEN RETURN jsonb_build_object('ok', false, 'error', 'You must be signed in.'); END IF;
  SELECT * INTO tok FROM public.aircimp_tokens WHERE code = norm FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok', false, 'error', 'Unknown token code.'); END IF;
  IF tok.redeemed_by IS NOT NULL THEN RETURN jsonb_build_object('ok', false, 'error', 'This token has already been burned.'); END IF;
  UPDATE public.aircimp_tokens SET redeemed_by = uid, redeemed_at = now() WHERE code = norm;
  INSERT INTO public.token_redemptions (code, user_id) VALUES (norm, uid);
  UPDATE public.profiles SET verified = true, diamonds = diamonds + 100 WHERE id = uid;
  RETURN jsonb_build_object('ok', true, 'token', norm, 'diamonds', 100);
END;
$$;
REVOKE EXECUTE ON FUNCTION public.redeem_aircimp_token(text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.redeem_aircimp_token(text) TO authenticated;

CREATE OR REPLACE FUNCTION public.generate_aircimp_token()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uid uuid := auth.uid();
  is_premium boolean;
  new_code text;
BEGIN
  IF uid IS NULL THEN RETURN jsonb_build_object('ok', false, 'error', 'Sign in required.'); END IF;
  SELECT verified INTO is_premium FROM public.profiles WHERE id = uid;
  IF NOT COALESCE(is_premium, false) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Only verified members can generate tokens.');
  END IF;
  new_code := 'LUMERA-' || upper(substr(replace(gen_random_uuid()::text,'-',''), 1, 10));
  INSERT INTO public.aircimp_tokens(code, generated_by, generated_at) VALUES (new_code, uid, now());
  RETURN jsonb_build_object('ok', true, 'code', new_code);
END;
$$;
REVOKE EXECUTE ON FUNCTION public.generate_aircimp_token() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.generate_aircimp_token() TO authenticated;

-- Storage policies (idempotent)
DO $$ BEGIN
  CREATE POLICY "media_read_all" ON storage.objects FOR SELECT TO public
    USING (bucket_id IN ('post-media','avatars','story-media'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "media_insert_own" ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (
      bucket_id IN ('post-media','avatars','story-media')
      AND (storage.foldername(name))[1] = auth.uid()::text
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "media_update_own" ON storage.objects FOR UPDATE TO authenticated
    USING (
      bucket_id IN ('post-media','avatars','story-media')
      AND (storage.foldername(name))[1] = auth.uid()::text
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "media_delete_own" ON storage.objects FOR DELETE TO authenticated
    USING (
      bucket_id IN ('post-media','avatars','story-media')
      AND (storage.foldername(name))[1] = auth.uid()::text
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;