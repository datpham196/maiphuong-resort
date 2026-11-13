CREATE TABLE booking_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_code VARCHAR(40) NOT NULL UNIQUE,
    room_type_id UUID REFERENCES room_types(id),
    room_external_id VARCHAR(100) NOT NULL,
    room_slug VARCHAR(255),
    room_name VARCHAR(255),
    arrival_date DATE NOT NULL,
    departure_date DATE NOT NULL,
    adults INTEGER NOT NULL,
    children INTEGER NOT NULL DEFAULT 0,
    guest_name VARCHAR(255) NOT NULL,
    guest_phone VARCHAR(50) NOT NULL,
    guest_email VARCHAR(255),
    notes TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'new',
    mode VARCHAR(30) NOT NULL DEFAULT 'request',
    total_amount NUMERIC(14, 2),
    currency VARCHAR(10) NOT NULL DEFAULT 'VND',
    pms_booking_reference VARCHAR(100),
    pms_booking_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    availability_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_booking_dates CHECK (departure_date > arrival_date),
    CONSTRAINT chk_booking_adults CHECK (adults >= 1),
    CONSTRAINT chk_booking_children CHECK (children >= 0)
);

CREATE INDEX idx_booking_requests_created ON booking_requests (created_at DESC);
CREATE INDEX idx_booking_requests_status ON booking_requests (status);
