-- ESQUEMA COMPLETO EXACTO de tu DB actual
-- Basado exactamente en los create_statement que compartiste

CREATE TABLE contenido (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  id_reservacion uuid NOT NULL,
  id_template uuid,
  id_contenido text,
  url_archivo text,
  status_moderacion text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE disponibilidad_dia (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  id_reservacion uuid NOT NULL,
  dia date NOT NULL,
  limite_maximo integer NOT NULL,
  status_dia text DEFAULT 'disponible'::text
);

CREATE TABLE pantallas (
  id text DEFAULT gen_random_uuid()::text NOT NULL,
  nombre text NOT NULL,
  direccion text,
  url_direccion text,
  lat numeric,
  lng numeric,
  resolucion text,
  medidas text,
  precio numeric,
  hora_inicio time without time zone,
  hora_fin time without time zone,
  foto text,
  impactos integer DEFAULT 0,
  status text DEFAULT 'activo'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE planes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  dias integer NOT NULL,
  spots_dia integer NOT NULL,
  precio numeric NOT NULL,
  activo boolean DEFAULT true,
  creado_en timestamp with time zone DEFAULT now()
);

CREATE TABLE reservaciones (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  id_pantalla text NOT NULL,
  id_plan uuid,
  fecha_inicio date NOT NULL,
  fecha_fin date NOT NULL,
  rango_dias integer,
  status text DEFAULT 'pendiente'::text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE templates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  tipo text NOT NULL,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text DEFAULT 'active'::text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE usuarios (
  id text NOT NULL,
  nombre text NOT NULL,
  email text NOT NULL,
  rol text NOT NULL DEFAULT 'admin'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE ventas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  id_pantalla text,
  id_reservacion uuid,
  nombre_pantalla text,
  url_contenido text,
  email_contacto text,
  nombre_contacto text,
  telefono_contacto text,
  dias integer,
  fecha_inicio date,
  fecha_fin date,
  status_moderacion text DEFAULT 'en_revision'::text,
  created_at timestamp with time zone DEFAULT now()
);

-- PRIMARY KEYS
ALTER TABLE contenido ADD CONSTRAINT contenido_pkey PRIMARY KEY (id);
ALTER TABLE disponibilidad_dia ADD CONSTRAINT disponibilidad_dia_pkey PRIMARY KEY (id);
ALTER TABLE pantallas ADD CONSTRAINT pantallas_pkey PRIMARY KEY (id);
ALTER TABLE planes ADD CONSTRAINT planes_pkey PRIMARY KEY (id);
ALTER TABLE reservaciones ADD CONSTRAINT reservaciones_pkey PRIMARY KEY (id);
ALTER TABLE templates ADD CONSTRAINT templates_pkey PRIMARY KEY (id);
ALTER TABLE usuarios ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);
ALTER TABLE ventas ADD CONSTRAINT ventas_pkey PRIMARY KEY (id);

-- FOREIGN KEYS
ALTER TABLE reservaciones
  ADD CONSTRAINT reservaciones_id_pantalla_fkey
  FOREIGN KEY (id_pantalla) REFERENCES pantallas(id);

ALTER TABLE reservaciones
  ADD CONSTRAINT reservaciones_id_plan_fkey
  FOREIGN KEY (id_plan) REFERENCES planes(id);

ALTER TABLE contenido
  ADD CONSTRAINT contenido_id_reservacion_fkey
  FOREIGN KEY (id_reservacion) REFERENCES reservaciones(id);

ALTER TABLE contenido
  ADD CONSTRAINT contenido_id_template_fkey
  FOREIGN KEY (id_template) REFERENCES templates(id);

ALTER TABLE disponibilidad_dia
  ADD CONSTRAINT disponibilidad_dia_id_reservacion_fkey
  FOREIGN KEY (id_reservacion) REFERENCES reservaciones(id);

ALTER TABLE ventas
  ADD CONSTRAINT ventas_id_pantalla_fkey
  FOREIGN KEY (id_pantalla) REFERENCES pantallas(id);

ALTER TABLE ventas
  ADD CONSTRAINT ventas_id_reservacion_fkey
  FOREIGN KEY (id_reservacion) REFERENCES reservaciones(id);

-- UNIQUE CONSTRAINTS
ALTER TABLE usuarios ADD CONSTRAINT usuarios_email_key UNIQUE (email);

-- ÍNDICES
CREATE INDEX idx_reservaciones_id_pantalla ON reservaciones(id_pantalla);
CREATE INDEX idx_reservaciones_id_plan ON reservaciones(id_plan);
CREATE INDEX idx_disponibilidad_dia_dia ON disponibilidad_dia(dia);
CREATE INDEX idx_disponibilidad_dia_id_reservacion ON disponibilidad_dia(id_reservacion);
CREATE INDEX idx_contenido_id_reservacion ON contenido(id_reservacion);
CREATE INDEX idx_contenido_id_template ON contenido(id_template);
CREATE INDEX idx_ventas_id_pantalla ON ventas(id_pantalla);
CREATE INDEX idx_ventas_id_reservacion ON ventas(id_reservacion);
CREATE INDEX idx_templates_status ON templates(status);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE pantallas ENABLE ROW LEVEL SECURITY;
ALTER TABLE planes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE disponibilidad_dia ENABLE ROW LEVEL SECURITY;
ALTER TABLE contenido ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;