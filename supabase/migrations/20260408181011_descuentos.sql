CREATE TABLE codigos_descuento (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo TEXT UNIQUE NOT NULL,        -- "codigo1", "codigo2", etc.
  porcentaje INTEGER NOT NULL,        -- 10, 20, 30
  descripcion TEXT,
  activo BOOLEAN DEFAULT true,
  usos_maximos INTEGER DEFAULT NULL,  -- null = ilimitado
  usos_actuales INTEGER DEFAULT 0
);

-- Inserta tus códigos
INSERT INTO codigos_descuento (codigo, porcentaje, descripcion) VALUES
  ('codigo1', 10, '10% de Descuento en la compra'),
  ('codigo2', 20, '20% de Descuento en la compra'),
  ('codigo3', 30, '30% de Descuento en la compra');