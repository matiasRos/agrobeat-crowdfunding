-- Migración 013: Agregar columna is_paid a la tabla investments
-- Esta columna indica si la inversión ha sido pagada o no

ALTER TABLE investments 
ADD COLUMN is_paid BOOLEAN DEFAULT FALSE;

-- Comentario para documentar el propósito de la columna
COMMENT ON COLUMN investments.is_paid IS 'Indica si la inversión ha sido pagada. FALSE por defecto (reserva), TRUE cuando se confirma el pago';
