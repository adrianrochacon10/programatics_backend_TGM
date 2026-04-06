-- ============================================================================
-- HABILITAR RLS EN TODAS LAS TABLAS
-- ============================================================================
ALTER TABLE pantallas ENABLE ROW LEVEL SECURITY;
ALTER TABLE planes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE disponibilidad_dia ENABLE ROW LEVEL SECURITY;
ALTER TABLE contenido ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PANTALLAS
-- ============================================================================
CREATE POLICY "pantallas_select_public"
ON pantallas FOR SELECT
USING (status = 'activo');

CREATE POLICY "pantallas_insert_admin"
ON pantallas FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM usuarios
    WHERE usuarios.id = auth.uid()::text
    AND usuarios.rol = 'admin'
  )
);

CREATE POLICY "pantallas_update_admin"
ON pantallas FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM usuarios
    WHERE usuarios.id = auth.uid()::text
    AND usuarios.rol = 'admin'
  )
);

CREATE POLICY "pantallas_delete_admin"
ON pantallas FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM usuarios
    WHERE usuarios.id = auth.uid()::text
    AND usuarios.rol = 'admin'
  )
);

-- ============================================================================
-- PLANES
-- ============================================================================
CREATE POLICY "planes_select_public"
ON planes FOR SELECT
USING (activo = true);

CREATE POLICY "planes_insert_admin"
ON planes FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM usuarios
    WHERE usuarios.id = auth.uid()::text
    AND usuarios.rol = 'admin'
  )
);

CREATE POLICY "planes_update_admin"
ON planes FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM usuarios
    WHERE usuarios.id = auth.uid()::text
    AND usuarios.rol = 'admin'
  )
);

-- ============================================================================
-- RESERVACIONES
-- ============================================================================
CREATE POLICY "reservaciones_select_own"
ON reservaciones FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM usuarios
    WHERE usuarios.id = auth.uid()::text
    AND (
      usuarios.rol = 'admin'
      OR reservaciones.id IN (
        SELECT id FROM reservaciones r2
        WHERE r2.id = reservaciones.id
      )
    )
  )
);

CREATE POLICY "reservaciones_insert_authenticated"
ON reservaciones FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "reservaciones_update_admin"
ON reservaciones FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM usuarios
    WHERE usuarios.id = auth.uid()::text
    AND usuarios.rol = 'admin'
  )
);

-- ============================================================================
-- TEMPLATES
-- ============================================================================
CREATE POLICY "templates_select_public"
ON templates FOR SELECT
USING (status = 'active');

CREATE POLICY "templates_insert_admin"
ON templates FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM usuarios
    WHERE usuarios.id = auth.uid()::text
    AND usuarios.rol = 'admin'
  )
);

CREATE POLICY "templates_update_admin"
ON templates FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM usuarios
    WHERE usuarios.id = auth.uid()::text
    AND usuarios.rol = 'admin'
  )
);

CREATE POLICY "templates_delete_admin"
ON templates FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM usuarios
    WHERE usuarios.id = auth.uid()::text
    AND usuarios.rol = 'admin'
  )
);

-- ============================================================================
-- DISPONIBILIDAD_DIA
-- ============================================================================
CREATE POLICY "disponibilidad_select_public"
ON disponibilidad_dia FOR SELECT
USING (true);

CREATE POLICY "disponibilidad_insert_authenticated"
ON disponibilidad_dia FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================================
-- CONTENIDO
-- ============================================================================
CREATE POLICY "contenido_select_own"
ON contenido FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "contenido_insert_authenticated"
ON contenido FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================================
-- USUARIOS
-- ============================================================================
CREATE POLICY "usuarios_select_own"
ON usuarios FOR SELECT
USING (usuarios.id = auth.uid()::text);

CREATE POLICY "usuarios_update_own"
ON usuarios FOR UPDATE
USING (usuarios.id = auth.uid()::text);

-- ============================================================================
-- VENTAS
-- ============================================================================
CREATE POLICY "ventas_select_admin"
ON ventas FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM usuarios
    WHERE usuarios.id = auth.uid()::text
    AND usuarios.rol = 'admin'
  )
);

CREATE POLICY "ventas_insert_authenticated"
ON ventas FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);