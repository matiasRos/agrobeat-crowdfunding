-- Migración: Cambiar campo days_left por closing_date en campaigns
-- Fecha: 2025-09-24

-- Agregar el nuevo campo closing_date
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS closing_date TIMESTAMP;

-- Actualizar los datos existentes: convertir days_left a una fecha futura
UPDATE campaigns 
SET closing_date = (created_at + INTERVAL '1 day' * days_left)
WHERE closing_date IS NULL;

-- Hacer el campo NOT NULL después de poblar los datos
ALTER TABLE campaigns ALTER COLUMN closing_date SET NOT NULL;

-- Eliminar el campo days_left (opcional - comentado por seguridad)
-- ALTER TABLE campaigns DROP COLUMN IF EXISTS days_left;

-- Comentarios sobre la migración:
-- 1. Se agregó closing_date como timestamp
-- 2. Se calculó la fecha basándose en created_at + days_left
-- 3. El campo days_left se mantiene por ahora para compatibilidad
-- 4. En el código se calculará daysLeft dinámicamente desde closingDate
