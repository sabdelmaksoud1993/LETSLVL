-- ============================================
-- FULL-TEXT SEARCH INDEX FOR PRODUCTS
-- ============================================

-- Add search vector column
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create function to update search vector
CREATE OR REPLACE FUNCTION products_search_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := to_tsvector('english',
    coalesce(NEW.title, '') || ' ' ||
    coalesce(NEW.brand, '') || ' ' ||
    coalesce(NEW.description, '') || ' ' ||
    coalesce(array_to_string(NEW.tags, ' '), '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger (drop first to make idempotent)
DROP TRIGGER IF EXISTS products_search_trigger ON public.products;

CREATE TRIGGER products_search_trigger
  BEFORE INSERT OR UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION products_search_update();

-- Create GIN index for fast search
CREATE INDEX IF NOT EXISTS idx_products_search ON public.products USING GIN(search_vector);

-- Update existing rows to populate search_vector
UPDATE public.products SET search_vector = to_tsvector('english',
  coalesce(title, '') || ' ' ||
  coalesce(brand, '') || ' ' ||
  coalesce(description, '') || ' ' ||
  coalesce(array_to_string(tags, ' '), '')
);
