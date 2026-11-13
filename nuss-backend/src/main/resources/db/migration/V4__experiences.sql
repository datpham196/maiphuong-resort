CREATE TABLE experiences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    experience_group VARCHAR(20) NOT NULL,
    layout VARCHAR(30) NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_experiences_group
        CHECK (experience_group IN ('destination', 'tour', 'ticket')),
    CONSTRAINT chk_experiences_layout
        CHECK (layout IN ('story', 'itinerary', 'ticket'))
);

CREATE INDEX idx_experiences_group_order
    ON experiences (experience_group, display_order);

CREATE INDEX idx_experiences_active
    ON experiences (is_active);

CREATE TABLE experience_contents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    experience_id UUID NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
    locale VARCHAR(10) NOT NULL,
    slug VARCHAR(255),
    title VARCHAR(255),
    short_description TEXT,
    description TEXT,
    itinerary TEXT,
    duration_text VARCHAR(100),
    price_amount NUMERIC(12, 2),
    price_currency VARCHAR(10) NOT NULL DEFAULT 'VND',
    price_note VARCHAR(255),
    conditions TEXT,
    seo_title VARCHAR(255),
    seo_description TEXT,
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_experience_contents_experience_locale UNIQUE (experience_id, locale)
);

CREATE UNIQUE INDEX uq_experience_contents_locale_slug
    ON experience_contents (locale, slug)
    WHERE slug IS NOT NULL;

CREATE INDEX idx_experience_contents_public
    ON experience_contents (locale, is_published);

CREATE TABLE experience_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    experience_id UUID NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    storage_key TEXT NOT NULL,
    alt_text VARCHAR(255),
    display_order INTEGER NOT NULL DEFAULT 0,
    is_cover BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_experience_images_experience_order
    ON experience_images (experience_id, display_order);

CREATE UNIQUE INDEX uq_experience_images_one_cover
    ON experience_images (experience_id)
    WHERE is_cover = TRUE;

-- Seed: 1 destination, 1 tour, 1 ticket (vi + en drafts published for local preview)
INSERT INTO experiences (id, experience_group, layout, display_order, is_active)
VALUES
    ('11111111-1111-1111-1111-111111111101', 'destination', 'story', 1, TRUE),
    ('11111111-1111-1111-1111-111111111102', 'tour', 'itinerary', 1, TRUE),
    ('11111111-1111-1111-1111-111111111103', 'ticket', 'ticket', 1, TRUE);

INSERT INTO experience_contents (
    experience_id, locale, slug, title, short_description, description,
    itinerary, duration_text, price_amount, price_currency, price_note, conditions,
    is_published
) VALUES
(
    '11111111-1111-1111-1111-111111111101', 'vi', 'bai-sao',
    'Bãi Sao',
    'Cát trắng, nước nông và không khí biển êm phía nam đảo.',
    'Bãi Sao là gợi ý điểm đến gần khu nghỉ, phù hợp buổi sáng hoặc chiều muộn trên đảo Ngọc.',
    NULL, NULL, NULL, 'VND', NULL, NULL, TRUE
),
(
    '11111111-1111-1111-1111-111111111101', 'en', 'sao-beach',
    'Sao Beach',
    'White sand, shallow water, and a calm southern shore.',
    'Sao Beach is a nearby destination tip for slow mornings or late afternoons on Pearl Island.',
    NULL, NULL, NULL, 'VND', NULL, NULL, TRUE
),
(
    '11111111-1111-1111-1111-111111111102', 'vi', 'tour-hon-mong-tay',
    'Tour Hòn Móng Tay',
    'Hành trình trong ngày quanh đảo nhỏ, lặn ngắm san hô.',
    'Tour đưa khách ra vùng biển quanh An Thới để ngắm san hô và nghỉ trên thuyền.',
    E'08:00 Đón tại resort\n09:30 Ra đảo\n12:00 Ăn trưa trên thuyền\n15:30 Về lại bến',
    '6 giờ', 890000, 'VND', '/ người', NULL, TRUE
),
(
    '11111111-1111-1111-1111-111111111102', 'en', 'mong-tay-island-tour',
    'Mong Tay Island Tour',
    'A same-day journey with coral snorkeling around the southern islands.',
    'The tour heads toward the An Thoi waters for snorkeling and a quiet lunch on the boat.',
    E'08:00 Pickup at the resort\n09:30 Arrive at the island\n12:00 Lunch on the boat\n15:30 Return to the pier',
    '6 hours', 890000, 'VND', '/ guest', NULL, TRUE
),
(
    '11111111-1111-1111-1111-111111111103', 'vi', 've-vinpearl',
    'Vé Vinpearl',
    'Thông tin vé tham quan khu vui chơi trên đảo (giá giới thiệu).',
    'Resort hỗ trợ giới thiệu thông tin vé; đặt mua trực tiếp sẽ cập nhật khi có quy trình chính thức.',
    NULL, NULL, 950000, 'VND', '/ người',
    'Giá giới thiệu, có thể đổi theo mùa. Mang theo giấy tờ tùy thân khi vào cổng.',
    TRUE
),
(
    '11111111-1111-1111-1111-111111111103', 'en', 'vinpearl-ticket',
    'Vinpearl Ticket',
    'Introductory ticket notes for the island leisure park.',
    'The resort shares ticket information; direct purchase flow will be added later.',
    NULL, NULL, 950000, 'VND', '/ guest',
    'Introductory rate; may change by season. Bring ID at the gate.',
    TRUE
);
