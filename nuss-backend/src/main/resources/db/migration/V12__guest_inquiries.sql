CREATE TABLE guest_inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guest_name VARCHAR(255) NOT NULL,
    guest_email VARCHAR(255) NOT NULL,
    guest_phone VARCHAR(50),
    question TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'new',
    staff_answer TEXT,
    answered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_guest_inquiry_status CHECK (status IN ('new', 'in_progress', 'done'))
);

CREATE INDEX idx_guest_inquiries_status_created ON guest_inquiries (status, created_at DESC);
CREATE INDEX idx_guest_inquiries_created ON guest_inquiries (created_at DESC);
