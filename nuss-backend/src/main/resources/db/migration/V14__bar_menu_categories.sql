-- Replace food-style categories on bar venues with drink categories.

-- Remove existing bar menu items first (cascade would also clear contents).
DELETE FROM restaurant_menu_items item
USING restaurants r
WHERE item.restaurant_id = r.id
  AND r.kind = 'bar';

DELETE FROM restaurant_menu_categories cat
USING restaurants r
WHERE cat.restaurant_id = r.id
  AND r.kind = 'bar';

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
        ('cocktails', 1),
        ('mocktails', 2),
        ('fresh-juices', 3),
        ('coffee-tea', 4)
) AS c(code, ord)
WHERE r.kind = 'bar'
  AND NOT EXISTS (
      SELECT 1 FROM restaurant_menu_categories existing
      WHERE existing.restaurant_id = r.id AND existing.code = c.code
  );

INSERT INTO restaurant_menu_category_contents (id, category_id, locale, name)
SELECT gen_random_uuid(), cat.id, 'vi',
    CASE cat.code
        WHEN 'cocktails' THEN 'Cocktails'
        WHEN 'mocktails' THEN 'Mocktails'
        WHEN 'fresh-juices' THEN 'Fresh Juices'
        WHEN 'coffee-tea' THEN 'Coffee & Tea'
        ELSE cat.code
    END
FROM restaurant_menu_categories cat
INNER JOIN restaurants r ON r.id = cat.restaurant_id
WHERE r.kind = 'bar'
  AND cat.code IN ('cocktails', 'mocktails', 'fresh-juices', 'coffee-tea')
  AND NOT EXISTS (
      SELECT 1 FROM restaurant_menu_category_contents cc
      WHERE cc.category_id = cat.id AND cc.locale = 'vi'
  );

INSERT INTO restaurant_menu_category_contents (id, category_id, locale, name)
SELECT gen_random_uuid(), cat.id, 'en',
    CASE cat.code
        WHEN 'cocktails' THEN 'Cocktails'
        WHEN 'mocktails' THEN 'Mocktails'
        WHEN 'fresh-juices' THEN 'Fresh Juices'
        WHEN 'coffee-tea' THEN 'Coffee & Tea'
        ELSE cat.code
    END
FROM restaurant_menu_categories cat
INNER JOIN restaurants r ON r.id = cat.restaurant_id
WHERE r.kind = 'bar'
  AND cat.code IN ('cocktails', 'mocktails', 'fresh-juices', 'coffee-tea')
  AND NOT EXISTS (
      SELECT 1 FROM restaurant_menu_category_contents cc
      WHERE cc.category_id = cat.id AND cc.locale = 'en'
  );
