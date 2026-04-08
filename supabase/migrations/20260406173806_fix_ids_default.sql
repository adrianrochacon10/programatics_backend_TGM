ALTER TABLE reservaciones 
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

ALTER TABLE planes 
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

ALTER TABLE disponibilidad_dia 
  ALTER COLUMN id SET DEFAULT gen_random_uuid();