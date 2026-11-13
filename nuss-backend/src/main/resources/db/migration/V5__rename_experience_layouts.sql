-- Rename layout codes: story/itinerary/ticket → layout1/layout2/layout3
ALTER TABLE experiences DROP CONSTRAINT IF EXISTS chk_experiences_layout;

UPDATE experiences SET layout = 'layout1' WHERE layout = 'story';
UPDATE experiences SET layout = 'layout2' WHERE layout = 'itinerary';
UPDATE experiences SET layout = 'layout3' WHERE layout = 'ticket';

ALTER TABLE experiences
    ADD CONSTRAINT chk_experiences_layout
        CHECK (layout IN ('layout1', 'layout2', 'layout3'));
