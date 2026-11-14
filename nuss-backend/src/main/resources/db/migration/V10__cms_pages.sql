-- Fixed single CMS pages (spa, offers) — no list, no cover image.
CREATE TABLE cms_pages (
    id UUID PRIMARY KEY,
    page_key VARCHAR(40) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_cms_pages_page_key UNIQUE (page_key),
    CONSTRAINT chk_cms_pages_page_key CHECK (page_key IN ('spa', 'offers'))
);

CREATE TABLE cms_page_contents (
    id UUID PRIMARY KEY,
    page_id UUID NOT NULL REFERENCES cms_pages (id) ON DELETE CASCADE,
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
    CONSTRAINT uq_cms_page_contents_page_locale UNIQUE (page_id, locale),
    CONSTRAINT chk_cms_page_contents_locale CHECK (locale IN ('vi', 'en'))
);

CREATE INDEX idx_cms_pages_active ON cms_pages (is_active);

-- Seed spa + offers (vi draft-ready titles; unpublished until admin publishes)
INSERT INTO cms_pages (id, page_key, is_active, created_at, updated_at)
VALUES
    ('44444444-4444-4444-4444-444444444401', 'spa', TRUE, NOW(), NOW()),
    ('44444444-4444-4444-4444-444444444402', 'offers', TRUE, NOW(), NOW());

INSERT INTO cms_page_contents (
    id, page_id, locale, slug, title, short_description,
    seo_title, seo_description, document_draft, document_published,
    is_published, published_at, created_at, updated_at
)
VALUES
(
    '55555555-5555-5555-5555-555555555501',
    '44444444-4444-4444-4444-444444444401',
    'vi',
    'spa',
    'Spa',
    'Thư giãn và chăm sóc cơ thể trong không gian spa tại resort.',
    'Spa | Mai Phương Resort',
    'Giới thiệu spa tại Mai Phương Resort Phú Quốc.',
    '{
      "version": 1,
      "root": {
        "id": "root",
        "type": "root",
        "props": {},
        "children": [
          {
            "id": "blk_spa_heading_vi",
            "type": "heading",
            "props": { "text": "Spa Mai Phương", "level": 2, "align": "left", "color": "#243b3e", "margin": { "top": 0, "bottom": 16 } },
            "children": []
          },
          {
            "id": "blk_spa_text_vi",
            "type": "text",
            "props": { "text": "Không gian thư giãn trong khuôn viên resort. Chỉnh nội dung trang này từ trang quản trị Spa.", "align": "left", "color": "#5c6b6e", "fontSize": 16, "margin": { "top": 0, "bottom": 24 } },
            "children": []
          }
        ]
      }
    }'::jsonb,
    NULL,
    FALSE,
    NULL,
    NOW(),
    NOW()
),
(
    '55555555-5555-5555-5555-555555555502',
    '44444444-4444-4444-4444-444444444401',
    'en',
    'spa',
    'Spa',
    'Relax and unwind at the resort spa.',
    'Spa | Mai Phuong Resort',
    'An introduction to the spa at Mai Phuong Resort Phu Quoc.',
    '{
      "version": 1,
      "root": {
        "id": "root",
        "type": "root",
        "props": {},
        "children": [
          {
            "id": "blk_spa_heading_en",
            "type": "heading",
            "props": { "text": "Mai Phuong Spa", "level": 2, "align": "left", "color": "#243b3e", "margin": { "top": 0, "bottom": 16 } },
            "children": []
          },
          {
            "id": "blk_spa_text_en",
            "type": "text",
            "props": { "text": "A calm spa space on the resort grounds. Edit this page from the Spa admin builder.", "align": "left", "color": "#5c6b6e", "fontSize": 16, "margin": { "top": 0, "bottom": 24 } },
            "children": []
          }
        ]
      }
    }'::jsonb,
    NULL,
    FALSE,
    NULL,
    NOW(),
    NOW()
),
(
    '55555555-5555-5555-5555-555555555503',
    '44444444-4444-4444-4444-444444444402',
    'vi',
    'offers',
    'Ưu đãi',
    'Các ưu đãi và chương trình đặc biệt tại Mai Phương Resort.',
    'Ưu đãi | Mai Phương Resort',
    'Giới thiệu ưu đãi tại Mai Phương Resort Phú Quốc.',
    '{
      "version": 1,
      "root": {
        "id": "root",
        "type": "root",
        "props": {},
        "children": [
          {
            "id": "blk_offers_heading_vi",
            "type": "heading",
            "props": { "text": "Ưu đãi tại Mai Phương", "level": 2, "align": "left", "color": "#243b3e", "margin": { "top": 0, "bottom": 16 } },
            "children": []
          },
          {
            "id": "blk_offers_text_vi",
            "type": "text",
            "props": { "text": "Trang giới thiệu ưu đãi. Chỉnh nội dung từ trang quản trị Ưu đãi.", "align": "left", "color": "#5c6b6e", "fontSize": 16, "margin": { "top": 0, "bottom": 24 } },
            "children": []
          }
        ]
      }
    }'::jsonb,
    NULL,
    FALSE,
    NULL,
    NOW(),
    NOW()
),
(
    '55555555-5555-5555-5555-555555555504',
    '44444444-4444-4444-4444-444444444402',
    'en',
    'offers',
    'Offers',
    'Special offers and promotions at Mai Phuong Resort.',
    'Offers | Mai Phuong Resort',
    'An introduction to offers at Mai Phuong Resort Phu Quoc.',
    '{
      "version": 1,
      "root": {
        "id": "root",
        "type": "root",
        "props": {},
        "children": [
          {
            "id": "blk_offers_heading_en",
            "type": "heading",
            "props": { "text": "Offers at Mai Phuong", "level": 2, "align": "left", "color": "#243b3e", "margin": { "top": 0, "bottom": 16 } },
            "children": []
          },
          {
            "id": "blk_offers_text_en",
            "type": "text",
            "props": { "text": "This page introduces resort offers. Edit content from the Offers admin builder.", "align": "left", "color": "#5c6b6e", "fontSize": 16, "margin": { "top": 0, "bottom": 24 } },
            "children": []
          }
        ]
      }
    }'::jsonb,
    NULL,
    FALSE,
    NULL,
    NOW(),
    NOW()
);
