CREATE TABLE restaurants (
    id UUID PRIMARY KEY,
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    cover_image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE restaurant_contents (
    id UUID PRIMARY KEY,
    restaurant_id UUID NOT NULL REFERENCES restaurants (id) ON DELETE CASCADE,
    locale VARCHAR(5) NOT NULL,
    slug VARCHAR(200),
    title VARCHAR(300),
    short_description TEXT,
    seo_title VARCHAR(300),
    seo_description TEXT,
    document_draft JSONB NOT NULL DEFAULT '{"version":1,"root":{"id":"root","type":"root","props":{},"children":[]}}'::jsonb,
    document_published JSONB,
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_restaurant_contents_restaurant_locale UNIQUE (restaurant_id, locale),
    CONSTRAINT chk_restaurant_contents_locale CHECK (locale IN ('vi', 'en'))
);

CREATE UNIQUE INDEX uq_restaurant_contents_locale_slug_published
    ON restaurant_contents (locale, slug)
    WHERE is_published = TRUE AND slug IS NOT NULL AND btrim(slug) <> '';

CREATE INDEX idx_restaurants_active_order ON restaurants (is_active, display_order);

-- Seed: single restaurant page (vi + en published)
INSERT INTO restaurants (id, display_order, is_active, cover_image_url, created_at, updated_at)
VALUES
    ('22222222-2222-2222-2222-222222222201', 1, TRUE, NULL, NOW(), NOW());

INSERT INTO restaurant_contents (
    id, restaurant_id, locale, slug, title, short_description,
    seo_title, seo_description, document_draft, document_published,
    is_published, published_at, created_at, updated_at
)
VALUES
(
    '33333333-3333-3333-3333-333333333301',
    '22222222-2222-2222-2222-222222222201',
    'vi',
    'nha-hang',
    'Nhà hàng',
    'Bữa sáng đến bàn tối với hải sản và hương vị Phú Quốc trong khuôn viên resort.',
    'Nhà hàng | Mai Phương Resort',
    'Giới thiệu nhà hàng tại Mai Phương Resort Phú Quốc.',
    '{
      "version": 1,
      "root": {
        "id": "root",
        "type": "root",
        "props": {},
        "children": [
          {
            "id": "blk_heading_main",
            "type": "heading",
            "props": { "text": "Nhà hàng Mai Phương", "level": 2, "align": "left", "color": "#243b3e", "margin": { "top": 0, "bottom": 16 } },
            "children": []
          },
          {
            "id": "blk_text_main",
            "type": "text",
            "props": { "text": "Không gian ẩm thực trong khuôn viên với hải sản tươi và hương vị đảo Ngọc. Trang này chỉ mang tính giới thiệu.", "align": "left", "color": "#5c6b6e", "fontSize": 16, "margin": { "top": 0, "bottom": 24 } },
            "children": []
          },
          {
            "id": "blk_spacer_main",
            "type": "spacer",
            "props": { "height": 24 },
            "children": []
          }
        ]
      }
    }'::jsonb,
    '{
      "version": 1,
      "root": {
        "id": "root",
        "type": "root",
        "props": {},
        "children": [
          {
            "id": "blk_heading_main",
            "type": "heading",
            "props": { "text": "Nhà hàng Mai Phương", "level": 2, "align": "left", "color": "#243b3e", "margin": { "top": 0, "bottom": 16 } },
            "children": []
          },
          {
            "id": "blk_text_main",
            "type": "text",
            "props": { "text": "Không gian ẩm thực trong khuôn viên với hải sản tươi và hương vị đảo Ngọc. Trang này chỉ mang tính giới thiệu.", "align": "left", "color": "#5c6b6e", "fontSize": 16, "margin": { "top": 0, "bottom": 24 } },
            "children": []
          },
          {
            "id": "blk_spacer_main",
            "type": "spacer",
            "props": { "height": 24 },
            "children": []
          }
        ]
      }
    }'::jsonb,
    TRUE,
    NOW(),
    NOW(),
    NOW()
),
(
    '33333333-3333-3333-3333-333333333302',
    '22222222-2222-2222-2222-222222222201',
    'en',
    'restaurant',
    'Restaurant',
    'Breakfast through dinner with seafood and Phu Quoc flavors on the resort grounds.',
    'Restaurant | Mai Phuong Resort',
    'An introduction to the restaurant at Mai Phuong Resort Phu Quoc.',
    '{
      "version": 1,
      "root": {
        "id": "root",
        "type": "root",
        "props": {},
        "children": [
          {
            "id": "blk_heading_main_en",
            "type": "heading",
            "props": { "text": "Mai Phuong Restaurant", "level": 2, "align": "left", "color": "#243b3e", "margin": { "top": 0, "bottom": 16 } },
            "children": []
          },
          {
            "id": "blk_text_main_en",
            "type": "text",
            "props": { "text": "On-site dining with fresh seafood and island flavors. This page is for introduction only.", "align": "left", "color": "#5c6b6e", "fontSize": 16, "margin": { "top": 0, "bottom": 24 } },
            "children": []
          }
        ]
      }
    }'::jsonb,
    '{
      "version": 1,
      "root": {
        "id": "root",
        "type": "root",
        "props": {},
        "children": [
          {
            "id": "blk_heading_main_en",
            "type": "heading",
            "props": { "text": "Mai Phuong Restaurant", "level": 2, "align": "left", "color": "#243b3e", "margin": { "top": 0, "bottom": 16 } },
            "children": []
          },
          {
            "id": "blk_text_main_en",
            "type": "text",
            "props": { "text": "On-site dining with fresh seafood and island flavors. This page is for introduction only.", "align": "left", "color": "#5c6b6e", "fontSize": 16, "margin": { "top": 0, "bottom": 24 } },
            "children": []
          }
        ]
      }
    }'::jsonb,
    TRUE,
    NOW(),
    NOW(),
    NOW()
);
