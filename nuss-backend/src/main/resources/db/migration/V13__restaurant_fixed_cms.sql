-- Fixed CMS for restaurants: structured content, typed images, menu (no draft/publish on menu).

ALTER TABLE restaurant_contents
    ADD COLUMN IF NOT EXISTS hero_subtitle TEXT,
    ADD COLUMN IF NOT EXISTS intro_eyebrow VARCHAR(200),
    ADD COLUMN IF NOT EXISTS intro_heading VARCHAR(300),
    ADD COLUMN IF NOT EXISTS intro_body TEXT,
    ADD COLUMN IF NOT EXISTS intro_body_secondary TEXT,
    ADD COLUMN IF NOT EXISTS menu_section_eyebrow VARCHAR(200),
    ADD COLUMN IF NOT EXISTS menu_section_heading VARCHAR(300),
    ADD COLUMN IF NOT EXISTS menu_section_lead TEXT;

CREATE TABLE restaurant_images (
    id UUID PRIMARY KEY,
    restaurant_id UUID NOT NULL REFERENCES restaurants (id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL,
    image_url TEXT NOT NULL,
    storage_key TEXT NOT NULL,
    alt_text TEXT,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_restaurant_images_role CHECK (role IN ('slide', 'main', 'signature', 'menu'))
);

CREATE INDEX idx_restaurant_images_restaurant_role
    ON restaurant_images (restaurant_id, role, display_order);

CREATE TABLE restaurant_menu_categories (
    id UUID PRIMARY KEY,
    restaurant_id UUID NOT NULL REFERENCES restaurants (id) ON DELETE CASCADE,
    code VARCHAR(80) NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_restaurant_menu_categories_code UNIQUE (restaurant_id, code)
);

CREATE TABLE restaurant_menu_category_contents (
    id UUID PRIMARY KEY,
    category_id UUID NOT NULL REFERENCES restaurant_menu_categories (id) ON DELETE CASCADE,
    locale VARCHAR(5) NOT NULL,
    name VARCHAR(200) NOT NULL,
    CONSTRAINT uq_restaurant_menu_category_locale UNIQUE (category_id, locale),
    CONSTRAINT chk_restaurant_menu_category_locale CHECK (locale IN ('vi', 'en'))
);

CREATE TABLE restaurant_menu_items (
    id UUID PRIMARY KEY,
    restaurant_id UUID NOT NULL REFERENCES restaurants (id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES restaurant_menu_categories (id) ON DELETE CASCADE,
    price_amount NUMERIC(14, 2),
    price_currency VARCHAR(10) NOT NULL DEFAULT 'VND',
    price_label VARCHAR(120),
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_restaurant_menu_items_category
    ON restaurant_menu_items (category_id, display_order);

CREATE TABLE restaurant_menu_item_contents (
    id UUID PRIMARY KEY,
    item_id UUID NOT NULL REFERENCES restaurant_menu_items (id) ON DELETE CASCADE,
    locale VARCHAR(5) NOT NULL,
    name VARCHAR(300) NOT NULL,
    description TEXT,
    CONSTRAINT uq_restaurant_menu_item_locale UNIQUE (item_id, locale),
    CONSTRAINT chk_restaurant_menu_item_locale CHECK (locale IN ('vi', 'en'))
);

-- Seed default categories for existing restaurants
INSERT INTO restaurant_menu_categories (id, restaurant_id, code, display_order, is_active, created_at, updated_at)
SELECT
    gen_random_uuid(),
    r.id,
    c.code,
    c.ord,
    TRUE,
    NOW(),
    NOW()
FROM restaurants r
CROSS JOIN (
    VALUES
        ('signature', 1),
        ('seafood', 2),
        ('meat', 3),
        ('veggie', 4),
        ('noodles-rice', 5),
        ('sides', 6)
) AS c(code, ord)
WHERE NOT EXISTS (
    SELECT 1 FROM restaurant_menu_categories existing
    WHERE existing.restaurant_id = r.id AND existing.code = c.code
);

INSERT INTO restaurant_menu_category_contents (id, category_id, locale, name)
SELECT gen_random_uuid(), cat.id, 'vi',
    CASE cat.code
        WHEN 'signature' THEN 'Đặc sản Mai Phương'
        WHEN 'seafood' THEN 'Hải sản'
        WHEN 'meat' THEN 'Gà - Bò - Heo'
        WHEN 'veggie' THEN 'Rau củ - Món chay'
        WHEN 'noodles-rice' THEN 'Súp - Phở - Mì - Cơm'
        WHEN 'sides' THEN 'Món ăn kèm'
        ELSE cat.code
    END
FROM restaurant_menu_categories cat
WHERE NOT EXISTS (
    SELECT 1 FROM restaurant_menu_category_contents cc
    WHERE cc.category_id = cat.id AND cc.locale = 'vi'
);

INSERT INTO restaurant_menu_category_contents (id, category_id, locale, name)
SELECT gen_random_uuid(), cat.id, 'en',
    CASE cat.code
        WHEN 'signature' THEN 'Mai Phuong specialties'
        WHEN 'seafood' THEN 'Seafood'
        WHEN 'meat' THEN 'Chicken - Beef - Pork'
        WHEN 'veggie' THEN 'Vegetables - Vegetarian'
        WHEN 'noodles-rice' THEN 'Soup - Pho - Noodles - Rice'
        WHEN 'sides' THEN 'Side dishes'
        ELSE cat.code
    END
FROM restaurant_menu_categories cat
WHERE NOT EXISTS (
    SELECT 1 FROM restaurant_menu_category_contents cc
    WHERE cc.category_id = cat.id AND cc.locale = 'en'
);

-- Backfill structured copy fields from existing titles where empty
UPDATE restaurant_contents
SET
    hero_subtitle = COALESCE(hero_subtitle, short_description),
    intro_eyebrow = COALESCE(intro_eyebrow, 'THE DINING EXPERIENCE'),
    intro_heading = COALESCE(intro_heading, title),
    intro_body = COALESCE(intro_body, short_description),
    menu_section_eyebrow = COALESCE(menu_section_eyebrow, 'OUR MENU'),
    menu_section_heading = COALESCE(menu_section_heading, CASE WHEN locale = 'en' THEN 'Explore the menu.' ELSE 'Khám phá thực đơn.' END),
    menu_section_lead = COALESCE(menu_section_lead, CASE WHEN locale = 'en'
        THEN 'Online menu by group — dishes and prices can be updated without replacing PDF images.'
        ELSE 'Menu trực tuyến chia nhóm, có thể cập nhật món và giá mà không cần thay ảnh PDF.' END)
WHERE TRUE;
