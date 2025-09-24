-- Hacer la tabla campaign_timeline más flexible
-- Primero eliminamos los datos existentes para poder reestructurar
TRUNCATE TABLE campaign_timeline;

-- Eliminar las columnas específicas y constraints
ALTER TABLE campaign_timeline DROP CONSTRAINT IF EXISTS check_timeline_order;
ALTER TABLE campaign_timeline DROP COLUMN IF EXISTS planting_date;
ALTER TABLE campaign_timeline DROP COLUMN IF EXISTS harvest_date;
ALTER TABLE campaign_timeline DROP COLUMN IF EXISTS payout_date;

-- Agregar nuevas columnas flexibles
ALTER TABLE campaign_timeline ADD COLUMN title VARCHAR(255) NOT NULL DEFAULT 'Cronograma de la Campaña';
ALTER TABLE campaign_timeline ADD COLUMN events JSONB NOT NULL DEFAULT '[]';

-- Insertar cronograma para las campañas existentes con el nuevo formato
INSERT INTO campaign_timeline (campaign_id, title, events) 
SELECT 
    id as campaign_id,
    'Cronograma de la Campaña' as title,
    '[
        {"title": "Siembra", "date": "2024-08-25", "description": "Inicio del cultivo"},
        {"title": "Cosecha", "date": "2024-10-09", "description": "Recolección de la producción"},
        {"title": "Pago a inversores", "date": "2024-10-15", "description": "Distribución de retornos"}
    ]'::jsonb as events
FROM campaigns 
WHERE id NOT IN (SELECT campaign_id FROM campaign_timeline)
ON CONFLICT (campaign_id) DO NOTHING;
