# 🚀 Setup del Proyecto - The Good Mark Backend

## Requisitos previos

- Node.js (v18+)
- Supabase CLI (`npm install -g supabase`)
- Docker (para Supabase local)

---

## 1️⃣ Iniciar Supabase Local

```bash
# Navegar a la carpeta del proyecto
cd d:\ESTADIAS_THEGOODMARK\programatics_backend_TGM

# Iniciar Supabase en local
supabase start

# Verás output como:
# API URL: http://localhost:54321
# GraphQL URL: http://localhost:54321/graphql/v1
# DB URL: postgresql://postgres:postgres@localhost:5432/postgres
```

---

## 2️⃣ Ejecutar Migraciones

Una vez que Supabase esté corriendo:

```bash
# Aplicar todas las migraciones (_schema_inicial, _rls_policies, _seed)
supabase migration up

# Verificar estado de migraciones
supabase migration list
```

---

## 3️⃣ Generar Tipos TypeScript

```bash
# Generar tipos basados en el schema actual
supabase gen types typescript --local > src/types/database.types.ts
```

---

## 4️⃣ Iniciar Edge Functions en Local

```bash
# En otra terminal
supabase functions serve

# Verás:
# Listening on http://localhost:54321/functions/v1
```

---

## 5️⃣ Testing de Edge Functions

Con Supabase corriendo y las funciones servidas, puedes probar:

### Verificar Disponibilidad
```bash
curl -X POST http://localhost:54321/functions/v1/verificar-disponibilidad \
  -H "Content-Type: application/json" \
  -d '{
    "id_pantalla": "pantalla-001",
    "fecha_inicio": "2026-04-15",
    "fecha_fin": "2026-04-30"
  }'
```

### Crear Reservación
```bash
curl -X POST http://localhost:54321/functions/v1/crear-reservacion \
  -H "Content-Type: application/json" \
  -d '{
    "id_pantalla": "pantalla-001",
    "id_plan": "plan-002",
    "fecha_inicio": "2026-04-20",
    "fecha_fin": "2026-04-27",
    "id_usuario": "user-001"
  }'
```

---

## 6️⃣ Acceder a Dashboard Supabase

Abre en el navegador:
- **http://localhost:54321** (para ver DB, RLS policies, etc)

Desde el dashboard puedes:
- Ver todas las tablas y datos
- Verificar RLS policies está aplicadas
- Probar queries directamente

---

## 🔧 Troubleshooting

### Error: "Migration failed"
- Verifica que Docker esté corriendo: `docker ps`
- Verifica que `supabase start` completó exitosamente
- Revisa logs: `supabase stop` y `supabase start --debug`

### Error: "Edge Function not found"
- Asegúrate que `supabase functions serve` está corriendo
- Verifica que los archivos están en `supabase/functions/*/index.ts`

### Error: Módulos de Deno no encontrados en VS Code
- Es normal, desaparece al ejecutarse en Supabase
- No afecta funcionamiento

---

## 📋 Estructura de Migraciones

```
migrations/
├── 20260406030426_schema_inicial.sql
│   └── Crea tablas, PK, FK, índices, RLS enable
├── 20260406030427_rls_policies.sql
│   └── Define políticas de acceso por rol
└── 20260406030428_seed_initial_data.sql
    └── Inserta usuarios, pantallas, planes de prueba
```

---

## 📌 Datos de Prueba Cargados

### Usuarios
- admin@thegoodmark.com (admin)
- moderador@thegoodmark.com (admin)
- contacto@empresapub.com (normal)
- ventas@tiendalocal.mx (normal)

### Pantallas
- pantalla-001: Centro Comercial - $500/día
- pantalla-002: Avenida 20 de Noviembre - $450/día
- pantalla-003: Plaza Principal - $800/día
- pantalla-004: Centro Nivel 2 - $350/día

### Planes
- plan-001: 1 día, $500
- plan-002: 7 días, $3000
- plan-003: 14 días, $5500
- plan-004: 30 días, $12000
- plan-005: 3 días (2 spots), $1800

---

## 🚫 Detener Todo

```bash
supabase stop
```

Esto detiene Docker, pero los datos persisten en `.supabase/docker`.

---

## 📚 Referencias

- [Supabase Docs](https://supabase.com/docs)
- [Edge Functions](https://supabase.com/docs/guides/functions)
- [RLS Policy Documentation](https://supabase.com/docs/guides/auth/row-level-security)
