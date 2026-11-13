CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE staff_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'STAFF',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE room_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_id VARCHAR(100) NOT NULL UNIQUE,
    hotel_id VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    max_occupancy INTEGER,
    beds_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    rack_rate NUMERIC(12, 2),
    inventory_count INTEGER,
    pms_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_seen_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_room_types_occupancy_positive
        CHECK (max_occupancy IS NULL OR max_occupancy > 0)
);

CREATE INDEX idx_room_types_active ON room_types (is_active);
CREATE INDEX idx_room_types_hotel ON room_types (hotel_id);

CREATE TABLE room_contents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_type_id UUID NOT NULL REFERENCES room_types(id),
    locale VARCHAR(10) NOT NULL,
    slug VARCHAR(255),
    title VARCHAR(255),
    short_description TEXT,
    description TEXT,
    amenities JSONB NOT NULL DEFAULT '[]'::jsonb,
    seo_title VARCHAR(255),
    seo_description TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_room_contents_room_locale UNIQUE (room_type_id, locale)
);

CREATE UNIQUE INDEX uq_room_contents_locale_slug
    ON room_contents (locale, slug)
    WHERE slug IS NOT NULL;

CREATE INDEX idx_room_contents_public
    ON room_contents (locale, is_published, display_order);

CREATE TABLE room_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_type_id UUID NOT NULL REFERENCES room_types(id),
    image_url TEXT NOT NULL,
    storage_key TEXT NOT NULL,
    alt_text VARCHAR(255),
    display_order INTEGER NOT NULL DEFAULT 0,
    is_cover BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_room_images_room_order
    ON room_images (room_type_id, display_order);

CREATE UNIQUE INDEX uq_room_images_one_cover_per_room
    ON room_images (room_type_id)
    WHERE is_cover = TRUE;

CREATE TABLE pms_sync_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trigger_type VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    finished_at TIMESTAMPTZ,
    total_fetched INTEGER NOT NULL DEFAULT 0,
    total_created INTEGER NOT NULL DEFAULT 0,
    total_updated INTEGER NOT NULL DEFAULT 0,
    total_deactivated INTEGER NOT NULL DEFAULT 0,
    error_message TEXT,
    CONSTRAINT chk_pms_sync_runs_trigger
        CHECK (trigger_type IN ('SCHEDULED', 'MANUAL')),
    CONSTRAINT chk_pms_sync_runs_status
        CHECK (status IN ('RUNNING', 'SUCCESS', 'FAILED'))
);

CREATE INDEX idx_pms_sync_runs_started_at ON pms_sync_runs (started_at DESC);
