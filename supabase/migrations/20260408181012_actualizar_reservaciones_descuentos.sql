-- supabase/migrations/20260408_actualizar_reservaciones_descuentos.sql
-- Agregar campos de descuento a tabla reservaciones

-- ================================================================
-- AGREGAR COLUMNAS A reservaciones PARA SOPORTAR CUPONES
-- ================================================================
ALTER TABLE public.reservaciones 
ADD COLUMN codigo_descuento TEXT DEFAULT NULL,
ADD COLUMN monto_con_descuento NUMERIC DEFAULT NULL,
ADD COLUMN porcentaje_descuento_aplicado INTEGER DEFAULT NULL;

-- Crear índice para búsquedas rápidas por código de descuento
CREATE INDEX idx_reservaciones_codigo_descuento 
ON public.reservaciones(codigo_descuento);

-- ================================================================
-- TRIGGER - Actualizar updated_at automáticamente
-- ================================================================
CREATE OR REPLACE FUNCTION public.update_reservaciones_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS reservaciones_updated_at ON public.reservaciones;

CREATE TRIGGER reservaciones_updated_at
BEFORE UPDATE ON public.reservaciones
FOR EACH ROW
EXECUTE FUNCTION public.update_reservaciones_updated_at();
