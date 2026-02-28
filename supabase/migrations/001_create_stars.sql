-- Create the stars table
CREATE TABLE IF NOT EXISTS stars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path_data JSONB NOT NULL,
  color TEXT NOT NULL DEFAULT '#FFFFFF',
  stroke_width REAL NOT NULL DEFAULT 2.0,
  session_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for ordering by creation time (FIFO)
CREATE INDEX idx_stars_created_at ON stars (created_at DESC);

-- Index for rate limiting by session
CREATE INDEX idx_stars_session_created ON stars (session_id, created_at DESC);

-- Enable REPLICA IDENTITY FULL so Realtime DELETE events include the old record
ALTER TABLE stars REPLICA IDENTITY FULL;

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE stars;

-- RLS policies
ALTER TABLE stars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Stars are viewable by everyone"
  ON stars FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert stars"
  ON stars FOR INSERT
  WITH CHECK (true);

-- No DELETE policy for anon — only the trigger can delete

-- FIFO trigger: keep only the most recent MAX_STARS (200) rows
CREATE OR REPLACE FUNCTION enforce_star_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM stars
  WHERE id IN (
    SELECT id FROM stars
    ORDER BY created_at DESC
    OFFSET 200
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_enforce_star_limit
  AFTER INSERT ON stars
  FOR EACH ROW
  EXECUTE FUNCTION enforce_star_limit();

-- Rate-limit trigger: reject if same session_id inserted within last 2 seconds
CREATE OR REPLACE FUNCTION enforce_rate_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM stars
    WHERE session_id = NEW.session_id
      AND created_at > now() - INTERVAL '2 seconds'
  ) THEN
    RAISE EXCEPTION 'Rate limit exceeded: please wait before drawing another star'
      USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_enforce_rate_limit
  BEFORE INSERT ON stars
  FOR EACH ROW
  EXECUTE FUNCTION enforce_rate_limit();
