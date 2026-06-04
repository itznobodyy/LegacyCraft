-- Tabla de ratings de servidores para LegacyCraft
-- Ejecutar en el SQL Editor de Supabase

CREATE TABLE IF NOT EXISTS server_ratings (
    id         uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
    server_key text         NOT NULL,
    rating     int          NOT NULL CHECK (rating >= 1 AND rating <= 5),
    visitor_id uuid         NOT NULL,
    created_at timestamptz  DEFAULT now(),
    UNIQUE(server_key, visitor_id)
);

ALTER TABLE server_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "insert_rating" ON server_ratings
    FOR INSERT WITH CHECK (rating >= 1 AND rating <= 5);

CREATE POLICY "update_rating" ON server_ratings
    FOR UPDATE USING (true) WITH CHECK (rating >= 1 AND rating <= 5);

CREATE POLICY "select_rating" ON server_ratings
    FOR SELECT USING (true);
