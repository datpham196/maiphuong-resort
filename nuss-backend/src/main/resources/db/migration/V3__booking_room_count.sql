ALTER TABLE booking_requests
    ADD COLUMN IF NOT EXISTS room_count INTEGER NOT NULL DEFAULT 1;

ALTER TABLE booking_requests
    DROP CONSTRAINT IF EXISTS chk_booking_room_count;

ALTER TABLE booking_requests
    ADD CONSTRAINT chk_booking_room_count CHECK (room_count >= 1);
