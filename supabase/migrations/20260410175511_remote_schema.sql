
  create table "public"."codigos_descuento" (
    "id" uuid not null default gen_random_uuid(),
    "codigo" text not null,
    "porcentaje" integer not null,
    "descripcion" text,
    "activo" boolean default true,
    "usos_maximos" integer,
    "usos_actuales" integer default 0,
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."codigos_descuento" enable row level security;

CREATE UNIQUE INDEX codigos_descuento_codigo_key ON public.codigos_descuento USING btree (codigo);

CREATE UNIQUE INDEX codigos_descuento_pkey ON public.codigos_descuento USING btree (id);

alter table "public"."codigos_descuento" add constraint "codigos_descuento_pkey" PRIMARY KEY using index "codigos_descuento_pkey";

alter table "public"."codigos_descuento" add constraint "codigos_descuento_codigo_key" UNIQUE using index "codigos_descuento_codigo_key";

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

grant delete on table "public"."codigos_descuento" to "anon";

grant insert on table "public"."codigos_descuento" to "anon";

grant references on table "public"."codigos_descuento" to "anon";

grant select on table "public"."codigos_descuento" to "anon";

grant trigger on table "public"."codigos_descuento" to "anon";

grant truncate on table "public"."codigos_descuento" to "anon";

grant update on table "public"."codigos_descuento" to "anon";

grant delete on table "public"."codigos_descuento" to "authenticated";

grant insert on table "public"."codigos_descuento" to "authenticated";

grant references on table "public"."codigos_descuento" to "authenticated";

grant select on table "public"."codigos_descuento" to "authenticated";

grant trigger on table "public"."codigos_descuento" to "authenticated";

grant truncate on table "public"."codigos_descuento" to "authenticated";

grant update on table "public"."codigos_descuento" to "authenticated";

grant delete on table "public"."codigos_descuento" to "service_role";

grant insert on table "public"."codigos_descuento" to "service_role";

grant references on table "public"."codigos_descuento" to "service_role";

grant select on table "public"."codigos_descuento" to "service_role";

grant trigger on table "public"."codigos_descuento" to "service_role";

grant truncate on table "public"."codigos_descuento" to "service_role";

grant update on table "public"."codigos_descuento" to "service_role";


