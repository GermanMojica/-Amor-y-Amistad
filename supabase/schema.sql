-- =================================================================
-- SCHEMA DE BASE DE DATOS PARA SORTEO DE AMIGO SECRETO (SUPABASE)
-- Copia y pega este contenido en el SQL Editor de tu proyecto Supabase
-- =================================================================

-- 1. Tabla de Configuración Global del Sorteo
CREATE TABLE IF NOT EXISTS event_config (
  id INT PRIMARY KEY DEFAULT 1,
  title TEXT NOT NULL DEFAULT 'Sorteo de Amigo Secreto',
  state TEXT NOT NULL DEFAULT 'REGISTRATION', -- 'REGISTRATION', 'READY', 'DRAWING', 'FINISHED'
  admin_pin_hash TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabla de Participantes (Identificados por Correo Electrónico o Usuario Único)
CREATE TABLE IF NOT EXISTS participants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL, -- Correo electrónico o usuario único
  gift_notes TEXT,
  normalized_name TEXT UNIQUE NOT NULL,
  pin_hash TEXT NOT NULL,
  draw_completed BOOLEAN DEFAULT FALSE NOT NULL,
  revealed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabla de Asignaciones del Sorteo (Derangement)
CREATE TABLE IF NOT EXISTS draw_assignments (
  id TEXT PRIMARY KEY,
  giver_id TEXT UNIQUE NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  receiver_id TEXT UNIQUE NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT check_not_self_assignment CHECK (giver_id <> receiver_id)
);

-- Índices para optimización de consultas
CREATE INDEX IF NOT EXISTS idx_participants_email ON participants(email);
CREATE INDEX IF NOT EXISTS idx_participants_normalized_name ON participants(normalized_name);
CREATE INDEX IF NOT EXISTS idx_draw_assignments_giver ON draw_assignments(giver_id);
CREATE INDEX IF NOT EXISTS idx_draw_assignments_receiver ON draw_assignments(receiver_id);

-- Insertar configuración inicial por defecto si no existe
INSERT INTO event_config (id, title, state, admin_pin_hash)
VALUES (1, 'Sorteo de Amigo Secreto', 'REGISTRATION', '')
ON CONFLICT (id) DO NOTHING;

-- Habilitar Row Level Security (RLS)
ALTER TABLE event_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE draw_assignments ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
CREATE POLICY "Public Read Event Config" ON event_config FOR SELECT USING (true);
CREATE POLICY "Public Read Participants Basic" ON participants FOR SELECT USING (true);
CREATE POLICY "Full Access Service Role" ON event_config FOR ALL TO service_role USING (true);
CREATE POLICY "Full Access Service Role Participants" ON participants FOR ALL TO service_role USING (true);
CREATE POLICY "Full Access Service Role Assignments" ON draw_assignments FOR ALL TO service_role USING (true);
