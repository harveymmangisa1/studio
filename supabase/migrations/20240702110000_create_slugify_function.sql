
-- Function to create a URL-friendly slug from a string
CREATE OR REPLACE FUNCTION public.slugify(
  "value" TEXT
)
RETURNS TEXT AS $$
  -- 1. Lowercase the string
  -- 2. Replace all non-alphanumeric characters with a hyphen
  -- 3. Collapse consecutive hyphens into a single hyphen
  -- 4. Trim leading and trailing hyphens
  SELECT trim(BOTH '-' FROM regexp_replace(lower("value"), '[^a-z0-9]+', '-', 'g'));
$$ LANGUAGE SQL IMMUTABLE;
