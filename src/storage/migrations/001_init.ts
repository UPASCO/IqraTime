/** Initial schema. See docs/ARCHITECTURE.md "Local storage" for the full data model. */
export const MIGRATION_001_INIT = `
CREATE TABLE IF NOT EXISTS history (
  id TEXT PRIMARY KEY NOT NULL,
  ayah_id TEXT NOT NULL,
  locale TEXT NOT NULL,
  received_at_utc TEXT NOT NULL,
  source TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_history_received_at ON history(received_at_utc DESC);
CREATE INDEX IF NOT EXISTS idx_history_ayah_id ON history(ayah_id);

CREATE TABLE IF NOT EXISTS favorites (
  ayah_id TEXT PRIMARY KEY NOT NULL,
  locale TEXT NOT NULL,
  added_at_utc TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_favorites_added_at ON favorites(added_at_utc DESC);

CREATE TABLE IF NOT EXISTS hidden_ayahs (
  ayah_id TEXT PRIMARY KEY NOT NULL,
  hidden_at_utc TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS notification_slots (
  id TEXT PRIMARY KEY NOT NULL,
  fire_at_utc TEXT NOT NULL,
  ayah_id TEXT NOT NULL,
  locale TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at_utc TEXT NOT NULL,
  time_zone TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_slots_fire_at ON notification_slots(fire_at_utc ASC);
CREATE INDEX IF NOT EXISTS idx_slots_status ON notification_slots(status);

CREATE TABLE IF NOT EXISTS local_logs (
  id TEXT PRIMARY KEY NOT NULL,
  level TEXT NOT NULL,
  scope TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at_utc TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON local_logs(created_at_utc DESC);
`;
