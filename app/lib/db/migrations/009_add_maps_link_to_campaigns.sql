-- Agregar campo maps_link a la tabla campaigns
ALTER TABLE campaigns ADD COLUMN maps_link VARCHAR(500);

-- Agregar algunos links de ejemplo para las campañas existentes
UPDATE campaigns SET maps_link = 'https://maps.google.com/maps?q=-25.2637,-57.5759' WHERE id = 1;
UPDATE campaigns SET maps_link = 'https://maps.google.com/maps?q=-25.3442,-57.4026' WHERE id = 2;
UPDATE campaigns SET maps_link = 'https://maps.google.com/maps?q=-25.2048,-57.5759' WHERE id = 3;
