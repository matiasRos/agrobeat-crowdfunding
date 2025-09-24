-- Migración: Agregar campos de simulador de inversión a campaigns
-- Fecha: 2025-09-24

-- Agregar campos para simulador de inversión
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS cost_per_plant DECIMAL(10,2) NOT NULL DEFAULT 2500.00;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS plants_per_m2 INTEGER NOT NULL DEFAULT 16;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS min_plants INTEGER NOT NULL DEFAULT 10;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS max_plants INTEGER NOT NULL DEFAULT 1000;

-- Actualizar datos existentes con valores por defecto según el tipo de cultivo
UPDATE campaigns 
SET 
  cost_per_plant = CASE 
    WHEN crop = 'Lechuga' THEN 2500.00
    WHEN crop = 'Pimiento' THEN 3500.00
    WHEN crop = 'Tomate' THEN 4000.00
    WHEN crop = 'Espinaca' THEN 1500.00
    WHEN crop = 'Brócoli' THEN 3000.00
    WHEN crop = 'Zanahoria' THEN 1000.00
    ELSE 2500.00
  END,
  plants_per_m2 = CASE 
    WHEN crop = 'Lechuga' THEN 16
    WHEN crop = 'Pimiento' THEN 4
    WHEN crop = 'Tomate' THEN 2
    WHEN crop = 'Espinaca' THEN 25
    WHEN crop = 'Brócoli' THEN 4
    WHEN crop = 'Zanahoria' THEN 36
    ELSE 16
  END,
  min_plants = CASE 
    WHEN crop = 'Lechuga' THEN 10
    WHEN crop = 'Pimiento' THEN 5
    WHEN crop = 'Tomate' THEN 5
    WHEN crop = 'Espinaca' THEN 20
    WHEN crop = 'Brócoli' THEN 5
    WHEN crop = 'Zanahoria' THEN 50
    ELSE 10
  END,
  max_plants = CASE 
    WHEN crop = 'Lechuga' THEN 1000
    WHEN crop = 'Pimiento' THEN 500
    WHEN crop = 'Tomate' THEN 400
    WHEN crop = 'Espinaca' THEN 1500
    WHEN crop = 'Brócoli' THEN 600
    WHEN crop = 'Zanahoria' THEN 2000
    ELSE 1000
  END
WHERE cost_per_plant = 2500.00; -- Solo actualizar registros con valores por defecto

-- Comentarios sobre la migración:
-- 1. Se agregaron campos para el simulador de inversión
-- 2. Se establecieron valores por defecto según el tipo de cultivo
-- 3. Los datos existentes se actualizan automáticamente
-- 4. Ahora cada campaña tiene su propia configuración de inversión
