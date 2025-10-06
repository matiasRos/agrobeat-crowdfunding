-- Migración: Crear tablas para stories de campañas y tracking de visualizaciones
-- Fecha: 2025-10-03

-- 1. Crear tabla de stories de campañas
CREATE TABLE IF NOT EXISTS campaign_stories (
  id SERIAL PRIMARY KEY,
  campaign_id INTEGER REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
  media_url VARCHAR(500) NOT NULL,
  media_type VARCHAR(20) NOT NULL DEFAULT 'image', -- 'image' o 'video'
  caption TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- 2. Crear tabla de visualizaciones de stories
CREATE TABLE IF NOT EXISTS story_views (
  id SERIAL PRIMARY KEY,
  story_id INTEGER REFERENCES campaign_stories(id) ON DELETE CASCADE NOT NULL,
  user_id INTEGER REFERENCES "User"(id) ON DELETE CASCADE NOT NULL,
  viewed_at TIMESTAMP DEFAULT NOW() NOT NULL,
  -- Evitar duplicados: un usuario solo puede marcar un story como visto una vez
  UNIQUE(story_id, user_id)
);

-- 3. Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_campaign_stories_campaign_id ON campaign_stories(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_stories_display_order ON campaign_stories(campaign_id, display_order);
CREATE INDEX IF NOT EXISTS idx_story_views_story_id ON story_views(story_id);
CREATE INDEX IF NOT EXISTS idx_story_views_user_id ON story_views(user_id);
CREATE INDEX IF NOT EXISTS idx_story_views_user_story ON story_views(user_id, story_id);

-- Comentarios sobre la estructura:
-- 1. campaign_stories: almacena todas las imágenes/videos de una campaña
-- 2. display_order: determina el orden de visualización de los stories
-- 3. story_views: registra qué usuarios vieron qué stories
-- 4. La constraint UNIQUE evita que un usuario marque el mismo story como visto múltiples veces

