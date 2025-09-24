-- Crear tabla para cronograma de campañas
CREATE TABLE IF NOT EXISTS campaign_timeline (
    id SERIAL PRIMARY KEY,
    campaign_id INTEGER NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    planting_date DATE NOT NULL,
    harvest_date DATE NOT NULL,
    payout_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índice para búsquedas por campaign_id
CREATE INDEX IF NOT EXISTS idx_campaign_timeline_campaign_id ON campaign_timeline(campaign_id);

-- Agregar constraint para asegurar que las fechas tengan sentido cronológicamente
ALTER TABLE campaign_timeline 
ADD CONSTRAINT check_timeline_order 
CHECK (planting_date <= harvest_date AND harvest_date <= payout_date);

-- Agregar constraint para que cada campaña tenga solo un cronograma
ALTER TABLE campaign_timeline 
ADD CONSTRAINT unique_campaign_timeline 
UNIQUE (campaign_id);
