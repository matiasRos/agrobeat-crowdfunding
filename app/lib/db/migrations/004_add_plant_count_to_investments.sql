-- Migración: Agregar campo plant_count a la tabla investments
-- Fecha: 2025-09-24

-- Agregar campo plant_count a investments
ALTER TABLE investments ADD COLUMN IF NOT EXISTS plant_count INTEGER NOT NULL DEFAULT 0;

-- Comentarios sobre la migración:
-- 1. Se agregó el campo plant_count para guardar la cantidad de plantas por inversión
-- 2. Esto permite tener información más detallada de cada reserva
-- 3. Facilitará reportes y análisis de inversiones por cantidad de plantas
