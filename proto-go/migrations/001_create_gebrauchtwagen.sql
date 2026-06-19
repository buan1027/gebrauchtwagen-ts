-- Create table gebrauchtwagen
CREATE TABLE IF NOT EXISTS gebrauchtwagen (
  id BIGSERIAL PRIMARY KEY,
  fahrzeugnummer TEXT NOT NULL UNIQUE,
  marke TEXT,
  modell TEXT,
  baujahr INT
);
