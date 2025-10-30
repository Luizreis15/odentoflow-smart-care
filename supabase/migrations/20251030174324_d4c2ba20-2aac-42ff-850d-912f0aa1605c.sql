-- Add tipo column to stock_locations if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'stock_locations' 
    AND column_name = 'tipo'
  ) THEN
    ALTER TABLE public.stock_locations 
    ADD COLUMN tipo TEXT DEFAULT 'deposito';
  END IF;
END $$;