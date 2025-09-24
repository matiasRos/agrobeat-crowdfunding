-- Migración: Corregir tabla de inversores para usar users existente
-- Fecha: 2025-09-24

-- 1. Eliminar tabla investors (estaba vacía de todos modos)
DROP TABLE IF EXISTS investors CASCADE;

-- 2. Extender tabla users con campos adicionales para inversores
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS name VARCHAR(255);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- 3. Actualizar tabla investments para referenciar users en lugar de investors
ALTER TABLE investments DROP CONSTRAINT IF EXISTS investments_investor_id_fkey;
ALTER TABLE investments RENAME COLUMN investor_id TO user_id;
ALTER TABLE investments ADD CONSTRAINT investments_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES "User"(id);

-- 4. Actualizar índices
DROP INDEX IF EXISTS idx_investments_investor_id;
CREATE INDEX IF NOT EXISTS idx_investments_user_id ON investments(user_id);

-- Comentarios sobre la migración:
-- 1. Se eliminó la tabla redundante investors
-- 2. Se extendió users con campos necesarios para inversores
-- 3. Se actualizó investments para referenciar directamente a users
-- 4. Ahora users sirve tanto para autenticación como para inversiones
