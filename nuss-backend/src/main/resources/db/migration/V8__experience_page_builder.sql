-- Add page-builder documents to experience contents (same pattern as restaurants).
ALTER TABLE experience_contents
    ADD COLUMN IF NOT EXISTS document_draft JSONB NOT NULL
        DEFAULT '{"version":1,"root":{"id":"root","type":"root","props":{},"children":[]}}'::jsonb,
    ADD COLUMN IF NOT EXISTS document_published JSONB,
    ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

-- Keep layout column for backward compatibility; new posts default to layout1.
-- UI no longer exposes layout selection; public detail uses document_published.
