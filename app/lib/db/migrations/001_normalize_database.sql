-- Migración: Normalizar base de datos con tablas de productores, inversores e inversiones
-- Fecha: 2025-09-24

-- 1. Crear tabla de productores
CREATE TABLE IF NOT EXISTS producers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(50),
  location VARCHAR(255),
  experience INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- 2. Crear tabla de inversores
CREATE TABLE IF NOT EXISTS investors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- 3. Crear enum para risk_level si no existe
DO $$ BEGIN
    CREATE TYPE risk_level AS ENUM ('Bajo', 'Medio', 'Alto');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 4. Migrar datos existentes de campaigns a la tabla producers
INSERT INTO producers (name, experience, location, created_at, updated_at)
SELECT DISTINCT 
  producer_name,
  producer_experience,
  location,
  NOW(),
  NOW()
FROM campaigns
WHERE producer_name IS NOT NULL;

-- 5. Crear nueva tabla campaigns normalizada
CREATE TABLE IF NOT EXISTS campaigns_new (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  crop VARCHAR(100) NOT NULL,
  location VARCHAR(255) NOT NULL,
  target_amount DECIMAL(12,2) NOT NULL,
  days_left INTEGER NOT NULL,
  expected_return DECIMAL(5,2) NOT NULL,
  risk_level risk_level NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  producer_id INTEGER REFERENCES producers(id) NOT NULL
);

-- 6. Migrar datos de campaigns a campaigns_new con relación a productores
INSERT INTO campaigns_new (
  title, description, crop, location, target_amount, days_left, 
  expected_return, risk_level, image_url, is_active, created_at, updated_at, producer_id
)
SELECT 
  c.title,
  c.description,
  c.crop,
  c.location,
  c.target_amount,
  c.days_left,
  c.expected_return,
  c.risk_level::risk_level,
  c.image_url,
  CASE WHEN c.is_active = 1 THEN true ELSE false END,
  c.created_at,
  c.updated_at,
  p.id
FROM campaigns c
JOIN producers p ON p.name = c.producer_name AND p.experience = c.producer_experience;

-- 7. Crear tabla de inversiones
CREATE TABLE IF NOT EXISTS investments (
  id SERIAL PRIMARY KEY,
  amount DECIMAL(12,2) NOT NULL,
  invested_at TIMESTAMP DEFAULT NOW() NOT NULL,
  campaign_id INTEGER REFERENCES campaigns_new(id) NOT NULL,
  investor_id INTEGER REFERENCES investors(id) NOT NULL
);

-- 8. Renombrar tablas (hacer backup de la original)
ALTER TABLE IF EXISTS campaigns RENAME TO campaigns_old;
ALTER TABLE campaigns_new RENAME TO campaigns;

-- 9. Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_campaigns_producer_id ON campaigns(producer_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_is_active ON campaigns(is_active);
CREATE INDEX IF NOT EXISTS idx_investments_campaign_id ON investments(campaign_id);
CREATE INDEX IF NOT EXISTS idx_investments_investor_id ON investments(investor_id);
CREATE INDEX IF NOT EXISTS idx_producers_email ON producers(email);
CREATE INDEX IF NOT EXISTS idx_investors_email ON investors(email);

-- Comentarios sobre la migración:
-- 1. Se crearon las tablas normalizadas: producers, investors, investments
-- 2. Se migraron los datos existentes de campaigns
-- 3. Se eliminaron campos redundantes de campaigns (producer_name, producer_experience, raised_amount, investor_count)
-- 4. Estos campos ahora se calculan dinámicamente desde las relaciones
-- 5. La tabla campaigns_old contiene los datos originales como backup
