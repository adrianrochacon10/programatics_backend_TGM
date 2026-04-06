# 📋 Guía Completa - The Good Mark Backend (04/04/2026)

## 🎯 Estado Actual del Proyecto

**✅ Lo que está LISTA:**
- Base de datos Supabase con 8 tablas normalizadas
- 5 pantallas publicitarias configuradas (Durango)
- 3 planes de publicidad (7, 15, 30 días)
- 5 templates de contenido (Banner, Video, Carousel, etc)
- 2 Edge Functions serverless (verificar-disponibilidad, crear-reservacion)
- Row Level Security (RLS) configurado por rol
- 4 usuarios de prueba + datos seed

**Estado Infrastructure:**
```
✅ Supabase Local → http://127.0.0.1:54321
✅ Dashboard → http://127.0.0.1:54323
✅ PostgreSQL DB → 127.0.0.1:54322
✅ Edge Functions (Background)
```

---

## 💼 ¿Qué PUEDO HACER Ahora? (Sin probar APIs)

### 1. **Ver la Base de Datos en Vivo**
```
Abre: http://127.0.0.1:54323
→ Tabla Browser (izquierda)
→ Ver usuarios, pantallas, planes, templates
→ Ver esquema de cada tabla
```

### 2. **Explorar SQL**
```
Dashboard → SQL Editor
→ Ejecutar queries para explorar datos:
  SELECT * FROM usuarios;
  SELECT * FROM pantallas;
  SELECT * FROM templates;
```

### 3. **Entender la Estructura**
```
Cada tabla tiene:
- Columnas tipadas (UUID, text, date, numeric, jsonb)
- Foreign Keys (relaciones entre tablas)
- Índices (para búsquedas rápidas)
- RLS Policies (control de acceso)
```

### 4. **Ver los Tipos TypeScript Generados**
```
Archivo: src/types/database.types.ts
→ Contiene tipos para todas las tablas
→ Usar en frontend/backend para type safety
```

### 5. **Leer la Documentación Creada**
```
Archivos generados:
✅ DATABASE_SCHEMA.md          → Esquema completo
✅ TEMPLATES_GUIDE.md           → Guía de templates
✅ MIGRATION_CHANGES.md         → Cambios realizados
✅ API_TESTING.md               → Cómo probar APIs
✅ RUN_MIGRATIONS.md            → Setup guide
✅ SETUP_GUIDE.md               → Instrucciones iniciales
```

---

## 📅 PLAN DE ACCIÓN PARA MAÑANA

### ⏰ Duración Total: ~1 hora

---

## **FASE 1: Verificación Inicial (10 min)**

### Paso 1.1: Iniciar Supabase
```bash
cd d:\ESTADIAS_THEGOODMARK\programatics_backend_TGM
supabase start
```

Esperar output:
```
✓ Started supabase local development setup
Project URL: http://127.0.0.1:54321
```

### Paso 1.2: Verificar que está corriendo
```bash
# En otra terminal, chequear status
curl http://127.0.0.1:54321/health
# Debería retornar código 200
```

### Paso 1.3: Abrir Dashboard
```
http://127.0.0.1:54323
→ Debería cargar sin errores
→ Ver todas las tablas en la izquierda
```

✅ **Checkpoint:** Si ves el dashboard con las 8 tablas, ¡TODO OK!

---

## **FASE 2: Verificación de Datos (15 min)**

### Paso 2.1: Contar registros en cada tabla
```
Dashboard → SQL Editor → Ejecutar:
```

```sql
-- Verificar que los datos seed se cargaron
SELECT 'usuarios' as tabla, COUNT(*) as count FROM usuarios
UNION ALL
SELECT 'pantallas', COUNT(*) FROM pantallas
UNION ALL
SELECT 'planes', COUNT(*) FROM planes
UNION ALL
SELECT 'templates', COUNT(*) FROM templates;
```

**Esperado:**
```
usuarios: 4
pantallas: 5
planes: 3
templates: 5
```

### Paso 2.2: Ver detalles de datos principales
```sql
-- Ver usuarios
SELECT id, nombre, email, rol FROM usuarios;

-- Ver pantallas
SELECT id, nombre, precio FROM pantallas;

-- Ver planes
SELECT id, dias, spots_dia, precio FROM planes;

-- Ver templates
SELECT id, nombre, tipo FROM templates;
```

### Paso 2.3: Copiar los UUIDs para testing
```sql
-- Esto te dará los IDs que necesitarás en Tests
SELECT id as plan_id FROM planes WHERE dias = 7 LIMIT 1;
SELECT id as pantalla_id FROM pantallas LIMIT 1;
```

✅ **Checkpoint:** Si ves todos los datos, ¡datos OK!

---

## **FASE 3: Iniciar Edge Functions (5 min)**

### Paso 3.1: En una nueva terminal
```bash
supabase functions serve
```

Esperar a que diga:
```
✓ Listening on http://localhost:54321/functions/v1
```

### Paso 3.2: Verificar que functions está sirviendo
```bash
# En otra terminal
curl http://127.0.0.1:54321/functions/v1/
# Debería responder algo (no error)
```

✅ **Checkpoint:** Si no hay errores, ¡functions OK!

---

## **FASE 4: Prueba de APIs (20 min)**

### Test 1: VERIFICAR DISPONIBILIDAD ⭐

```bash
# Copiar y ejecutar en PowerShell

$response = Invoke-RestMethod -Uri "http://127.0.0.1:54321/functions/v1/verificar-disponibilidad" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body (ConvertTo-Json @{
    id_pantalla = "pantalla-001"
    fecha_inicio = "2026-04-20"
    fecha_fin = "2026-04-27"
  })

Write-Host "✅ Respuesta:" -ForegroundColor Green
$response | ConvertTo-Json | Write-Host
```

**Esperado (200 OK):**
```json
{
  "id_pantalla": "pantalla-001",
  "nombre_pantalla": "Pantalla Centro Histórico",
  "disponibilidad": {
    "2026-04-20": 6,
    "2026-04-21": 6,
    ...
  }
}
```

✅ **Checkpoint:** Si ves disponibilidad de todos los días, ¡API 1 OK!

---

### Test 2: CREAR RESERVACIÓN ⭐⭐

**IMPORTANTE: Reemplaza estos UUIDs con los que copiaste en Paso 2.3**

```bash
# ANTES de ejecutar, reemplazar:
# $PLAN_ID = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

$response = Invoke-RestMethod -Uri "http://127.0.0.1:54321/functions/v1/crear-reservacion" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body (ConvertTo-Json @{
    id_pantalla = "pantalla-001"
    id_plan = "$PLAN_ID"
    fecha_inicio = "2026-04-20"
    fecha_fin = "2026-04-27"
    id_usuario = "user-001"
  })

Write-Host "✅ Respuesta:" -ForegroundColor Green
$response | ConvertTo-Json | Write-Host
```

**Esperado (201 Created):**
```json
{
  "success": true,
  "reservation_id": "uuid-aqui",
  "details": {
    "pantalla": "Pantalla Centro Histórico",
    "usuario": "contacto@empresapub.com",
    "fecha_inicio": "2026-04-20",
    "fecha_fin": "2026-04-27",
    "dias": 7,
    "precio_total": 1500.00,
    "status": "pendiente"
  }
}
```

✅ **Checkpoint:** Si ves `"success": true`, ¡API 2 OK!

---

### Test 3: VERIFICAR CAMBIOS EN DB ⭐⭐⭐

Después de crear la reservación, verifica que los datos se guardaron:

```sql
-- En SQL Editor ejecutar:

-- Ver reservación creada
SELECT id, id_pantalla, id_plan, fecha_inicio, fecha_fin, status 
FROM reservaciones 
ORDER BY created_at DESC 
LIMIT 1;

-- Ver disponibilidad actualizada
SELECT * FROM disponibilidad_dia 
ORDER BY created_at DESC 
LIMIT 7;
```

**Esperado:**
- `reservaciones`: 1 nuevo registro con status='pendiente'
- `disponibilidad_dia`: 7 registros (uno por cada día)

✅ **Checkpoint:** Si ves los registros creados, ¡DB está sincronizada!

---

## **FASE 5: Validación Final (10 min)**

### Checklist Final
```
□ Supabase corriendo en http://127.0.0.1:54321
□ Dashboard accesible en http://127.0.0.1:54323
□ 8 tablas creadas (usuarios, pantallas, planes, templates, reservaciones, disponibilidad_dia, contenido, ventas)
□ Datos seed cargados (4 usuarios, 5 pantallas, 3 planes, 5 templates)
□ Edge Functions sirviendo en http://127.0.0.1:54321/functions/v1
□ API verificar-disponibilidad responde correctamente
□ API crear-reservacion responde correctamente
□ Reservación aparece en tabla reservaciones
□ disponibilidad_dia se actualiza automáticamente
□ Tipos TypeScript generados en src/types/database.types.ts
```

Si TODOS los checkbox están ✅, **¡TODO ESTÁ BIEN!**

---

## 🆘 Si Algo Falla

### Error: "Pantalla no encontrada"
```
→ Significa que pantalla-001 no existe
→ Usa el ID real: SELECT id FROM pantallas LIMIT 1;
```

### Error: "Plan no encontrado"
```
→ Reemplaza $PLAN_ID con UUID real
→ Query: SELECT id FROM planes LIMIT 1;
```

### Error: "Connection refused"
```
→ Supabase no está corriendo
→ Ejecutar: supabase start
```

### Error: "Functions not found"
```
→ Functions no están sirviendo
→ Nueva terminal: supabase functions serve
```

### Error: "CORS error"
```
→ Usar curl o PowerShell en lugar de browser
→ O usar Postman
```

---

## 📚 Archivos Importantes

```
d:\ESTADIAS_THEGOODMARK\programatics_backend_TGM\
├── supabase/
│   ├── migrations/
│   │   ├── 20260406030426_schema_inicial.sql      ← Tablas + PKs + FKs
│   │   ├── 20260406030427_rls_policies.sql        ← Seguridad
│   │   └── 20260406030428_seed_initial_data.sql   ← Datos de prueba
│   ├── functions/
│   │   ├── verificar-disponibilidad/index.ts      ← API 1
│   │   └── crear-reservacion/index.ts             ← API 2
│   └── config.toml                                ← Configuración
├── src/
│   └── types/
│       └── database.types.ts                      ← Tipos TS (generados)
├── DATABASE_SCHEMA.md                             ← Esquema
├── API_TESTING.md                                 ← Testing guide
├── TEMPLATES_GUIDE.md                             ← Templates docs
└── ... (otros docs)
```

---

## 🎓 Próximos Pasos (Después de Validar)

1. **Crear más Edge Functions:**
   - upload-contenido (subir archivos)
   - get-reservaciones (obtener mis reservas)
   - cancelar-reservacion
   - aprobar-contenido (admin)

2. **Integrar con Frontend:**
   - React/Next.js
   - Conectar a Supabase desde cliente
   - Formularios de reservación

3. **Sistema de Pagos:**
   - Integrar Stripe o MercadoPago
   - Webhook para confirmar pagos
   - Cambiar status a "pagado"

4. **Moderación de Contenido:**
   - Validar contenido subido
   - Notificaciones a admin
   - Aprobar/rechazar contenido

---

## 💡 Tips para Mañana

✅ **Antes de empezar:**
- Asegurate que Docker está corriendo
- Cierra terminales antiguas de Supabase
- Lee esta guía completa

✅ **Durante testing:**
- Sigue los pasos en orden
- Copia-pega los comandos (no escribas manualmente)
- Verifica cada checkpoint antes de continuar

✅ **Si algo falla:**
- No eres el único, es normal en desarrollo
- Revisa la sección "Si Algo Falla"
- Reset con: `supabase db reset` y reintentar

---

## 📞 Resumen Rápido

| Componente | Status | URL | Verificación |
|-----------|--------|-----|--------------|
| Database | ✅ | 127.0.0.1:54322 | Ver en dashboard |
| Dashboard | ✅ | 127.0.0.1:54323 | Abierto en browser |
| APIs | ✅ | 127.0.0.1:54321/functions/v1 | curl + powershell |
| Tipos TS | ✅ | src/types/database.types.ts | Archivo existe |

**Tiempo estimado mañana: 1 hora para validar todo**

---

## 🚀 ¡Estás Listo!

Todo está en lugar para mañana. La arquitectura está lista:

```
┌─────────────────────────────────────────┐
│         Frontend (Por hacer)            │
│   React/Next.js + Supabase JS Client   │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│    Edge Functions (Creadas ✅)          │
│  verificar-disponibilidad               │
│  crear-reservacion                      │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│    PostgreSQL Database (Listo ✅)       │
│  8 tablas + RLS + Índices               │
│  Seed data cargado                      │
└─────────────────────────────────────────┘
```

¿Preguntas sobre algo específico? Estaré aquí mañana para ayudarte. 💪
