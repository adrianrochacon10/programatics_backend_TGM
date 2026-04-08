-- supabase/migrations/YYYYMMDDHHMMSS_crear_tabla_cupones.sql
-- Crear tabla de cupones/códigos de descuento

-- ================================================================
-- CREAR TABLA cupones
-- ================================================================
CREATE TABLE public.cupones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo TEXT UNIQUE NOT NULL,              -- "DESCUENTO10", "VERANO20", etc.
  porcentaje_descuento INTEGER NOT NULL,    -- 10, 20, 30 (sin símbolo %)
  descripcion TEXT,                         -- "Descuento especial de verano"
  activo BOOLEAN DEFAULT true,              -- true/false para activar/desactivar
  fecha_expiracion DATE DEFAULT NULL,       -- null = nunca expira
  usos_maximos INTEGER DEFAULT NULL,        -- null = ilimitado
  usos_actuales INTEGER DEFAULT 0,          -- contador de usos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ================================================================
-- ÍNDICES
-- ================================================================
CREATE UNIQUE INDEX cupones_codigo_activo 
ON public.cupones(codigo) WHERE activo = true;

-- ================================================================
-- PRIMERO - Datos de prueba
-- ================================================================
INSERT INTO public.cupones (codigo, porcentaje_descuento, descripcion, activo, fecha_expiracion, usos_maximos)
VALUES
  ('CODIGO10', 10, '10% de Descuento en la compra', true, NULL, 100),
  ('CODIGO20', 20, '20% de Descuento en la compra', true, NULL, 50),
  ('CODIGO30', 30, '30% de Descuento en la compra', true, '2026-05-31', NULL),
  ('VERANO2026', 15, 'Descuento especial verano', true, '2026-06-30', 1000);

-- ================================================================
-- HABILITAR RLS
-- ================================================================
ALTER TABLE public.cupones ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- RLS POLICIES
-- ================================================================
-- Cualquiera puede ver cupones activos (para validación)
CREATE POLICY "cupones_select_active"
ON public.cupones FOR SELECT
USING (activo = true);

-- Solo admin puede insertar cupones
CREATE POLICY "cupones_insert_admin"
ON public.cupones FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE usuarios.id = auth.uid()::text
    AND usuarios.rol = 'admin'
  )
);

-- Solo admin puede actualizar cupones
CREATE POLICY "cupones_update_admin"
ON public.cupones FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE usuarios.id = auth.uid()::text
    AND usuarios.rol = 'admin'
  )
);

-- ================================================================
-- CREAR RPC FUNCTION - Incrementar usos del cupón
-- ================================================================
CREATE OR REPLACE FUNCTION public.incrementar_usos_cupon(p_id_cupon UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.cupones
  SET 
    usos_actuales = usos_actuales + 1,
    updated_at = now()
  WHERE id = p_id_cupon;
END;
$$;

-- ================================================================
-- CREAR RPC FUNCTION - Obtener detalles del cupón
-- ================================================================
CREATE OR REPLACE FUNCTION public.obtener_cupons()
RETURNS TABLE (
  id UUID,
  codigo TEXT,
  porcentaje_descuento INTEGER,
  descripcion TEXT,
  activo BOOLEAN,
  fecha_expiracion DATE,
  usos_maximos INTEGER,
  usos_actuales INTEGER,
  disponible BOOLEAN
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT
    c.id,
    c.codigo,
    c.porcentaje_descuento,
    c.descripcion,
    c.activo,
    c.fecha_expiracion,
    c.usos_maximos,
    c.usos_actuales,
    (
      c.activo
      AND (c.fecha_expiracion IS NULL OR c.fecha_expiracion >= CURRENT_DATE)
      AND (c.usos_maximos IS NULL OR c.usos_actuales < c.usos_maximos)
    ) as disponible
  FROM public.cupones c
  ORDER BY c.created_at DESC;
$$;
