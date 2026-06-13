-- Migration 002: Add 'paid' status to event plans and items

ALTER TABLE event_plans DROP CONSTRAINT IF EXISTS event_plans_status_check;
ALTER TABLE event_plans ADD CONSTRAINT event_plans_status_check 
CHECK (status IN ('draft', 'submitted', 'confirmed', 'paid', 'completed', 'cancelled'));

ALTER TABLE event_plan_items DROP CONSTRAINT IF EXISTS event_plan_items_vendor_item_status_check;
ALTER TABLE event_plan_items ADD CONSTRAINT event_plan_items_vendor_item_status_check 
CHECK (vendor_item_status IN ('pending', 'accepted', 'rejected', 'paid', 'completed', 'cancelled'));
