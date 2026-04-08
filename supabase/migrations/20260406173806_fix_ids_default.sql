ALTER TABLE reservaciones 
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

ALTER TABLE planes 
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

ALTER TABLE disponibilidad_dia 
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

ALTER TABLE reservaciones 
ADD COLUMN monto_total NUMERIC NOT NULL DEFAULT 0,
ADD COLUMN estado_pago TEXT NOT NULL DEFAULT 'pendiente',
ADD COLUMN mp_payment_id TEXT;