# 🔧 Instrucciones - Ejecutar Migraciones Actualizadas

## ⚠️ Importante: Reset de Base de Datos

Dado que has hecho cambios a las migraciones, necesitas hacer un reset completo:

```bash
# 1. Detener Supabase
supabase stop

# 2. Limpiar volúmenes de Docker (para reset total)
# Esto borrará todos los datos locales
supabase db reset
```

---

## 📋 Secuencia Correcta de Setup

### Paso 1: Iniciar Supabase
```bash
cd d:\ESTADIAS_THEGOODMARK\programatics_backend_TGM
supabase start
```

Espera hasta que veas:
```
API URL: http://localhost:54321
GraphQL URL: http://localhost:54321/graphql/v1
DB URL: postgresql://postgres:postgres@localhost:5432/postgres
```

---

### Paso 2: Ejecutar Migraciones
```bash
supabase migration up
```

Esto ejecutará (en orden):
1. `20260406030426_schema_inicial.sql` → Crea todas las tablas + constraints
2. `20260406030427_rls_policies.sql` → Agrega políticas RLS
3. `20260406030428_seed_initial_data.sql` → Carga datos de prueba

---

### Paso 3: Generar Tipos TypeScript
```bash
supabase gen types typescript --local > src/types/database.types.ts
```

Esto generará los tipos **actualizados** incluyendo:
- Tabla `templates`
- Todas las columnas correctas
- Foreign keys
- Tipos de datos

---

### Paso 4: Servir Edge Functions
En **otra terminal**:
```bash
supabase functions serve
```

---

## ✅ Verificación Post-Setup

### Verificar Schema desde Dashboard
```
http://localhost:54321
```

En Supabase Dashboard:
- Ve a **SQL Editor**
- Ejecuta:
```sql
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

Deberías ver:
- contenido
- disponibilidad_dia
- pantallas
- planes
- reservaciones
- templates ⭐ NEW
- usuarios
- ventas

---

### Verificar Datos de Seed
```bash
# Ver usuarios
SELECT * FROM usuarios;

# Ver pantallas
SELECT id, nombre, precio FROM pantallas;

# Ver templates
SELECT id, nombre, tipo FROM templates;

# Ver planes
SELECT * FROM planes;
```

---

## 🚨 Si Algo Falla

### Error: "Relation does not exist"
```bash
# Resetear todo
supabase db reset

# Reintentar from scratch
supabase migration up
```

### Error: "Function not found"
Asegúrate que:
- `supabase functions serve` está corriendo en otra terminal
- El puerto 54321 está disponible

### Error: "Column not found" en Types Generation
- Verifica que las migraciones pasaron sin error
- Intenta regenerar: `supabase gen types typescript --local`

---

## 📊 Cambios en Esta Versión

| Cambio | Antes | Ahora |
|--------|-------|-------|
| Tabla templates | ❌ No existía | ✅ Agregada |
| Columnas disponibilidad_dia | Error de orden | ✅ Fijas |
| FK contenido → templates | N/A | ✅ Agregada |
| Índice templates_status | N/A | ✅ Agregado |
| RLS para templates | N/A | ✅ Agregada |
| Seed templates | N/A | ✅ 5 templates |

---

## 🧪 Testing Rápido

Una vez todo esté ready:

```bash
# Test 1: Verificar disponibilidad
curl -X POST http://localhost:54321/functions/v1/verificar-disponibilidad \
  -H "Content-Type: application/json" \
  -d '{
    "id_pantalla": "pantalla-001", 
    "fecha_inicio": "2026-04-20",
    "fecha_fin": "2026-04-27"
  }'

# Test 2: Crear reservación
curl -X POST http://localhost:54321/functions/v1/crear-reservacion \
  -H "Content-Type: application/json" \
  -d '{
    "id_pantalla": "pantalla-001",
    "id_plan": "UUID_DEL_PLAN",
    "fecha_inicio": "2026-04-20",
    "fecha_fin": "2026-04-27",
    "id_usuario": "user-001"
  }'
```

---

## 📝 Notas

- Las pantallas se crean con IDs automáticos (será visible en dashboard)
- Los planes también tendrán UUIDs automáticos
- Los templates se pueden crear/editar desde dashboard
- RLS está habilitada en todas las tablas
