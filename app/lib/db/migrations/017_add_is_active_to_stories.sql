-- Migración: Agregar campo is_active a campaign_stories
-- Fecha: 2025-10-03

-- Agregar columna is_active (por defecto true para stories existentes)
ALTER TABLE campaign_stories 
ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;

-- Crear índice para filtrar eficientemente por stories activos
CREATE INDEX IF NOT EXISTS idx_campaign_stories_active ON campaign_stories(campaign_id, is_active);

-- Comentario:
-- Este campo permite activar/desactivar stories sin eliminarlos
-- Útil para:
-- - Ocultar temporalmente contenido
-- - Programar contenido (activar/desactivar según fechas)
-- - Testing (desactivar stories problemáticos)

