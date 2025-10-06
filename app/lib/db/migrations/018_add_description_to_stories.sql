-- Migración: Agregar columna description a campaign_stories
-- Fecha: 2025-10-06

-- Agregar columna description para texto largo sobre cada story
ALTER TABLE campaign_stories 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Comentario: description es para texto descriptivo largo que se muestra en la parte inferior del viewer
-- caption se mantiene para texto corto/título si fuera necesario

