-- Migración: Insertar stories de ejemplo para las campañas existentes
-- Fecha: 2025-10-03
-- Nota: Esta migración es opcional y solo inserta datos de ejemplo

-- Insertar stories de ejemplo solo si existen campañas
-- Aquí puedes personalizar con tus propias URLs de imágenes

-- Ejemplo: Si tienes una campaña con id=1, puedes agregar stories así:
-- INSERT INTO campaign_stories (campaign_id, media_url, media_type, caption, display_order)
-- VALUES 
--   (1, '/path/to/image1.jpg', 'image', 'Primera imagen de la plantación', 0),
--   (1, '/path/to/image2.jpg', 'image', 'Proceso de siembra', 1),
--   (1, '/path/to/image3.jpg', 'image', 'Cultivo en crecimiento', 2);

-- Por ahora, esta migración no inserta nada, solo crea la estructura
-- El usuario puede agregar stories manualmente desde el admin o a través de la API

-- Para agregar stories de prueba, descomenta y edita las siguientes líneas:
-- INSERT INTO campaign_stories (campaign_id, media_url, media_type, caption, display_order)
-- SELECT 
--   id as campaign_id,
--   image_url as media_url,
--   'image' as media_type,
--   'Imagen principal de la campaña' as caption,
--   0 as display_order
-- FROM campaigns
-- WHERE id = 1; -- Cambia el ID según tu campaña

-- Nota: Puedes agregar múltiples stories para una campaña cambiando el display_order

