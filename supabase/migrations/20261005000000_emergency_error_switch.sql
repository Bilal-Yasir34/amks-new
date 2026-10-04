-- ==============================================================================
-- EMERGENCY ERROR SWITCH (SUPABASE PAUSE KILLSWITCH)
-- ==============================================================================

-- 1. Ensure columns exist on the settings table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'settings' AND column_name = 'error_switch_active'
  ) THEN
    ALTER TABLE settings ADD COLUMN error_switch_active boolean NOT NULL DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'settings' AND column_name = 'error_switch_message'
  ) THEN
    ALTER TABLE settings ADD COLUMN error_switch_message text DEFAULT NULL;
  END IF;
END $$;

-- 2. Create secure RPC function to toggle the error switch using master PIN
CREATE OR REPLACE FUNCTION public.toggle_emergency_error_switch(
  enable_switch boolean,
  secret_pin text,
  custom_message text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify master security PIN
  IF secret_pin NOT IN ('amks9900', '9900', 'amks@emergency2026') THEN
    RAISE EXCEPTION 'Access Denied: Invalid security PIN';
  END IF;

  UPDATE settings
  SET 
    error_switch_active = enable_switch,
    error_switch_message = custom_message,
    social_links = jsonb_set(
      COALESCE(social_links, '{}'::jsonb),
      '{_error_switch_active}',
      to_jsonb(enable_switch)
    ),
    updated_at = now()
  WHERE id = 1;

  RETURN jsonb_build_object(
    'success', true,
    'error_switch_active', enable_switch,
    'updated_at', now()
  );
END;
$$;

-- 3. Grant execution rights to anon and authenticated users
GRANT EXECUTE ON FUNCTION public.toggle_emergency_error_switch(boolean, text, text) TO anon, authenticated;
