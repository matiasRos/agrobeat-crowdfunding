-- Agregar columna market_price a la tabla campaigns
-- Esta columna almacenará el precio promedio del producto en el mercado
-- para calcular la utilidad neta esperada y el retorno real de inversión

ALTER TABLE campaigns 
ADD COLUMN market_price DECIMAL(10,2) NOT NULL DEFAULT 0;

-- Comentario para documentar el propósito de la columna
COMMENT ON COLUMN campaigns.market_price IS 'Precio promedio del producto en el mercado (por unidad/kg) para calcular utilidad neta esperada';
