drop extension if exists "pg_net";

drop policy "contenido_insert_authenticated" on "public"."contenido";

drop policy "contenido_select_own" on "public"."contenido";

drop policy "disponibilidad_insert_authenticated" on "public"."disponibilidad_dia";

drop policy "disponibilidad_select_public" on "public"."disponibilidad_dia";

drop policy "pantallas_delete_admin" on "public"."pantallas";

drop policy "pantallas_insert_admin" on "public"."pantallas";

drop policy "pantallas_select_public" on "public"."pantallas";

drop policy "pantallas_update_admin" on "public"."pantallas";

drop policy "planes_insert_admin" on "public"."planes";

drop policy "planes_select_public" on "public"."planes";

drop policy "planes_update_admin" on "public"."planes";

drop policy "reservaciones_insert_authenticated" on "public"."reservaciones";

drop policy "reservaciones_select_own" on "public"."reservaciones";

drop policy "reservaciones_update_admin" on "public"."reservaciones";

drop policy "templates_delete_admin" on "public"."templates";

drop policy "templates_insert_admin" on "public"."templates";

drop policy "templates_select_public" on "public"."templates";

drop policy "templates_update_admin" on "public"."templates";

drop policy "usuarios_select_own" on "public"."usuarios";

drop policy "usuarios_update_own" on "public"."usuarios";

drop policy "ventas_insert_authenticated" on "public"."ventas";

drop policy "ventas_select_admin" on "public"."ventas";

alter table "public"."contenido" drop constraint "contenido_id_template_fkey";

alter table "public"."ventas" drop constraint "ventas_id_pantalla_fkey";

alter table "public"."ventas" drop constraint "ventas_id_reservacion_fkey";

alter table "public"."contenido" drop constraint "contenido_id_reservacion_fkey";

alter table "public"."disponibilidad_dia" drop constraint "disponibilidad_dia_id_reservacion_fkey";

alter table "public"."reservaciones" drop constraint "reservaciones_id_pantalla_fkey";

alter table "public"."ventas" drop constraint "ventas_pkey";

drop index if exists "public"."idx_contenido_id_reservacion";

drop index if exists "public"."idx_contenido_id_template";

drop index if exists "public"."idx_disponibilidad_dia_dia";

drop index if exists "public"."idx_disponibilidad_dia_id_reservacion";

drop index if exists "public"."idx_reservaciones_id_pantalla";

drop index if exists "public"."idx_reservaciones_id_plan";

drop index if exists "public"."idx_templates_status";

drop index if exists "public"."idx_ventas_id_pantalla";

drop index if exists "public"."idx_ventas_id_reservacion";

drop index if exists "public"."ventas_pkey";

alter table "public"."contenido" alter column "id" drop default;

alter table "public"."contenido" alter column "id_template" set data type text using "id_template"::text;

alter table "public"."disponibilidad_dia" alter column "id" drop default;

alter table "public"."pantallas" alter column "id" set default gen_random_uuid();

alter table "public"."pantallas" alter column "lat" set data type numeric(10,7) using "lat"::numeric(10,7);

alter table "public"."pantallas" alter column "lng" set data type numeric(10,7) using "lng"::numeric(10,7);

alter table "public"."pantallas" alter column "precio" set data type numeric(10,2) using "precio"::numeric(10,2);

alter table "public"."planes" alter column "id" drop default;

alter table "public"."planes" alter column "precio" set data type numeric(10,2) using "precio"::numeric(10,2);

alter table "public"."reservaciones" drop column "rango_dias";

alter table "public"."reservaciones" add column "rango_dias" integer generated always as (((fecha_fin - fecha_inicio) + 1)) stored;

alter table "public"."reservaciones" alter column "id" drop default;

alter table "public"."ventas" alter column "id" drop default;

CREATE UNIQUE INDEX campanas_pkey ON public.ventas USING btree (id);

CREATE UNIQUE INDEX disponibilidad_dia_id_reservacion_dia_key ON public.disponibilidad_dia USING btree (id_reservacion, dia);

CREATE INDEX idx_campanas_status ON public.ventas USING btree (status_moderacion);

CREATE INDEX idx_disponibilidad_dia ON public.disponibilidad_dia USING btree (dia);

CREATE INDEX idx_reservaciones_fechas ON public.reservaciones USING btree (fecha_inicio, fecha_fin);

CREATE INDEX idx_reservaciones_pantalla ON public.reservaciones USING btree (id_pantalla);

alter table "public"."ventas" add constraint "campanas_pkey" PRIMARY KEY using index "campanas_pkey";

alter table "public"."disponibilidad_dia" add constraint "disponibilidad_dia_id_reservacion_dia_key" UNIQUE using index "disponibilidad_dia_id_reservacion_dia_key";

alter table "public"."templates" add constraint "templates_tipo_check" CHECK ((tipo = ANY (ARRAY['mop'::text, 'video_render'::text]))) not valid;

alter table "public"."templates" 
  drop constraint if exists "templates_tipo_check";

alter table "public"."templates" 
  add constraint "templates_tipo_check" 
  check (tipo = ANY (ARRAY['mop'::text, 'video_render'::text]));

alter table "public"."ventas" add constraint "campanas_id_pantalla_fkey" FOREIGN KEY (id_pantalla) REFERENCES public.pantallas(id) not valid;

alter table "public"."ventas" validate constraint "campanas_id_pantalla_fkey";

alter table "public"."ventas" add constraint "campanas_id_reservacion_fkey" FOREIGN KEY (id_reservacion) REFERENCES public.reservaciones(id) not valid;

alter table "public"."ventas" validate constraint "campanas_id_reservacion_fkey";

alter table "public"."contenido" add constraint "contenido_id_reservacion_fkey" FOREIGN KEY (id_reservacion) REFERENCES public.reservaciones(id) ON DELETE CASCADE not valid;

alter table "public"."contenido" validate constraint "contenido_id_reservacion_fkey";

alter table "public"."disponibilidad_dia" add constraint "disponibilidad_dia_id_reservacion_fkey" FOREIGN KEY (id_reservacion) REFERENCES public.reservaciones(id) ON DELETE CASCADE not valid;

alter table "public"."disponibilidad_dia" validate constraint "disponibilidad_dia_id_reservacion_fkey";

alter table "public"."reservaciones" add constraint "reservaciones_id_pantalla_fkey" FOREIGN KEY (id_pantalla) REFERENCES public.pantallas(id) ON DELETE CASCADE not valid;

alter table "public"."reservaciones" validate constraint "reservaciones_id_pantalla_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.rls_auto_enable()
 RETURNS event_trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$function$
;


  create policy "Permitir lectura pública de plantillas"
  on "public"."templates"
  as permissive
  for select
  to public
using (true);



