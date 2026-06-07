-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 002: Add service_event_types junction table
-- Links services to event_types (Many-to-Many relationship)
--
-- Verified PKs from 001_initial_schema.sql:
--   services.service_id    SERIAL PRIMARY KEY
--   event_types.event_type_id SERIAL PRIMARY KEY
-- ─────────────────────────────────────────────────────────────────────────────

-- Junction table — one row per (service ↔ event_type) link
CREATE TABLE IF NOT EXISTS service_event_types (
  service_id    INTEGER NOT NULL
    REFERENCES services(service_id) ON DELETE CASCADE,
  event_type_id INTEGER NOT NULL
    REFERENCES event_types(event_type_id) ON DELETE CASCADE,
  PRIMARY KEY (service_id, event_type_id)
);

-- Index for fast lookup of all services under a given event type
CREATE INDEX IF NOT EXISTS idx_service_event_types_event_type_id
  ON service_event_types(event_type_id);

-- Index for fast lookup of all event types for a given service
CREATE INDEX IF NOT EXISTS idx_service_event_types_service_id
  ON service_event_types(service_id);
