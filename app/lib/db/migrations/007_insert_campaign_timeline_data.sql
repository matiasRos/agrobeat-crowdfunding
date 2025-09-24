-- Insertar cronograma para las campañas existentes
-- Asumiendo que ya existen campañas con IDs 1, 2, 3, etc.

INSERT INTO campaign_timeline (campaign_id, planting_date, harvest_date, payout_date) VALUES
(1, '2024-08-25', '2024-10-09', '2024-10-15'),
(2, '2024-08-25', '2024-10-09', '2024-10-15'),
(3, '2024-08-25', '2024-10-09', '2024-10-15')
ON CONFLICT (campaign_id) DO NOTHING;

-- Si hay más campañas, podemos agregar cronogramas con fechas similares
-- Para campañas futuras, usar fechas proyectadas
INSERT INTO campaign_timeline (campaign_id, planting_date, harvest_date, payout_date)
SELECT 
    id as campaign_id,
    '2024-08-25'::date as planting_date,
    '2024-10-09'::date as harvest_date,
    '2024-10-15'::date as payout_date
FROM campaigns 
WHERE id NOT IN (SELECT campaign_id FROM campaign_timeline)
ON CONFLICT (campaign_id) DO NOTHING;
