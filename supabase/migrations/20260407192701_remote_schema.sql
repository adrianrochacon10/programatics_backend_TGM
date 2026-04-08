alter table "public"."contenido" alter column "id" set default gen_random_uuid();

alter table "public"."usuarios" alter column "id" set default gen_random_uuid();


