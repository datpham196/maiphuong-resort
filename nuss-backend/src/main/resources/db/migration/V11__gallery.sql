-- Guest photo archive (Kho luu tru anh khach den MP)
CREATE TABLE gallery_images (
    id UUID PRIMARY KEY,
    url TEXT NOT NULL,
    storage_key TEXT NOT NULL,
    caption_vi TEXT,
    caption_en TEXT,
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_gallery_images_active_order ON gallery_images (is_active, display_order);
