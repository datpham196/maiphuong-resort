-- Distinguish restaurant vs bar pages under the shared venues table.
ALTER TABLE restaurants
    ADD COLUMN kind VARCHAR(20) NOT NULL DEFAULT 'restaurant';

ALTER TABLE restaurants
    ADD CONSTRAINT chk_restaurants_kind CHECK (kind IN ('restaurant', 'bar'));

UPDATE restaurants
SET kind = 'restaurant'
WHERE kind IS NULL OR btrim(kind) = '';

CREATE INDEX idx_restaurants_kind_order ON restaurants (kind, display_order);
