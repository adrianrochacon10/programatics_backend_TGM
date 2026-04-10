ALTER TABLE public.planes
ADD CONSTRAINT planes_nombre_plan_unique UNIQUE (nombre_plan);

INSERT INTO public.planes (nombre_plan, spots_totales, dias, spots_dia, precio)
VALUES
  ('Arranque', 150,  1, 6, 199.00),
  ('Colosal',  340,  3, 6, 499.00),
  ('Titan',    650,  7, 6, 999.00)
ON CONFLICT (nombre_plan) DO NOTHING;