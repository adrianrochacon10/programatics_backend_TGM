-- Limpiar tabla actual
TRUNCATE TABLE disponibilidad_dia;

-- Eliminar columna id_reservacion
ALTER TABLE disponibilidad_dia 
  DROP COLUMN IF EXISTS id_reservacion;

-- Eliminar columna limite_maximo
ALTER TABLE disponibilidad_dia 
  DROP COLUMN IF EXISTS limite_maximo;

-- ✅ Usar text en lugar de uuid para coincidir con pantallas.id
ALTER TABLE disponibilidad_dia 
  ADD COLUMN IF NOT EXISTS id_pantalla text NOT NULL REFERENCES pantallas(id) ON DELETE CASCADE;

ALTER TABLE disponibilidad_dia 
  ADD COLUMN IF NOT EXISTS spots_disponibles int NOT NULL DEFAULT 6;

-- Índice único: 1 registro por pantalla+día
ALTER TABLE disponibilidad_dia
  ADD CONSTRAINT uq_pantalla_dia UNIQUE (id_pantalla, dia);

-- Función SQL atómica para decrementar spots
CREATE OR REPLACE FUNCTION decrementar_spot(p_pantalla text, p_dia date)
RETURNS void AS $$
BEGIN
  INSERT INTO disponibilidad_dia (id_pantalla, dia, spots_disponibles, status_dia)
  VALUES (p_pantalla, p_dia, 5, 'disponible')
  ON CONFLICT (id_pantalla, dia)
  DO UPDATE SET
    spots_disponibles = disponibilidad_dia.spots_disponibles - 1,
    status_dia = CASE 
      WHEN disponibilidad_dia.spots_disponibles - 1 <= 0 THEN 'lleno'
      ELSE 'disponible'
    END;
END;
$$ LANGUAGE plpgsql;