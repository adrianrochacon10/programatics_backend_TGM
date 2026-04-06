# 🧪 Testing APIs - The Good Mark

## ✅ Verificar Status

```bash
# Verificar que Supabase está corriendo
curl -s http://127.0.0.1:54321/functions/v1/ | head -c 100
```

---

## 📡 Test 1: Verificar Disponibilidad

Prueba para ver qué pantallas tienen disponibilidad en un rango de fechas.

### Request
```bash
curl -X POST http://127.0.0.1:54321/functions/v1/verificar-disponibilidad \
  -H "Content-Type: application/json" \
  -d '{
    "id_pantalla": "pantalla-001",
    "fecha_inicio": "2026-04-20",
    "fecha_fin": "2026-04-27"
  }'
```

### Response Esperado (200 OK)
```json
{
  "id_pantalla": "pantalla-001",
  "nombre_pantalla": "Pantalla Centro Histórico",
  "disponibilidad": {
    "2026-04-20": 6,
    "2026-04-21": 6,
    "2026-04-22": 6,
    "2026-04-23": 6,
    "2026-04-24": 6,
    "2026-04-25": 6,
    "2026-04-26": 6,
    "2026-04-27": 6
  }
}
```

---

## 📡 Test 2: Ver IDs de Pantallas Disponibles

Para saber qué pantallas existen:

```bash
# Desde Supabase Dashboard SQL Editor
curl -X POST http://127.0.0.1:54321/rest/v1/rpc/get_pantallas \
  -H "Content-Type: application/json" \
  -H "apikey: sb_anon_YOUR_KEY"

# O directamente desde dashboard
http://127.0.0.1:54323/project/default/editor
# Ir a SQL Editor y ejecutar:
# SELECT id, nombre, precio FROM pantallas;
```

---

## 📡 Test 3: Ver IDs de Planes

```bash
# Desde dashboard SQL Editor:
# SELECT id, dias, precio FROM planes;
```

**Plans que existen:**
- Plan 1: 7 días → $1500
- Plan 2: 15 días → $2800
- Plan 3: 30 días → $5000

---

## 📡 Test 4: Crear Reservación

Crea una reservación de 7 días en una pantalla.

### IMPORTANTE: Obtén los IDs primero

1. Abre Supabase Dashboard: http://127.0.0.1:54323
2. Ve a **SQL Editor**
3. Ejecuta:
```sql
SELECT id FROM pantallas LIMIT 1;
SELECT id FROM planes WHERE dias = 7 LIMIT 1;
```

Copia los UUIDs que aparecen.

### Request (reemplaza los UUIDs)
```bash
curl -X POST http://127.0.0.1:54321/functions/v1/crear-reservacion \
  -H "Content-Type: application/json" \
  -d '{
    "id_pantalla": "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
    "id_plan": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "fecha_inicio": "2026-04-20",
    "fecha_fin": "2026-04-27",
    "id_usuario": "user-001"
  }'
```

### Response Esperado (201 Created)
```json
{
  "success": true,
  "reservation_id": "uuid-de-la-reservacion",
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

---

## 🏗️ Versión PowerShell de los Tests

Puedes crear un archivo `test-apis.ps1`:

```powershell
# test-apis.ps1

$BASE_URL = "http://127.0.0.1:54321/functions/v1"

Write-Host "🧪 Testing The Good Mark APIs" -ForegroundColor Cyan

# Test 1: Disponibilidad
Write-Host "`n📡 Test 1: Verificar Disponibilidad" -ForegroundColor Yellow

$response1 = Invoke-RestMethod -Uri "$BASE_URL/verificar-disponibilidad" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body (ConvertTo-Json @{
    id_pantalla = "pantalla-001"
    fecha_inicio = "2026-04-20"
    fecha_fin = "2026-04-27"
  })

Write-Host ($response1 | ConvertTo-Json -Depth 10) -ForegroundColor Green

# Test 2: Crear Reservación
Write-Host "`n📡 Test 2: Crear Reservación" -ForegroundColor Yellow

# NOTA: Reemplaza los UUIDs con valores reales de tu DB
$response2 = Invoke-RestMethod -Uri "$BASE_URL/crear-reservacion" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body (ConvertTo-Json @{
    id_pantalla = "pantalla-001"
    id_plan = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"  # ← Reemplazar
    fecha_inicio = "2026-04-20"
    fecha_fin = "2026-04-27"
    id_usuario = "user-001"
  })

Write-Host ($response2 | ConvertTo-Json -Depth 10) -ForegroundColor Green

Write-Host "`n✅ Tests completados" -ForegroundColor Cyan
```

Ejecutar:
```bash
powershell -ExecutionPolicy Bypass -File test-apis.ps1
```

---

## 🔍 Debug: Ver Logs de Functions

```bash
# En otra terminal, ver logs en tiempo real
supabase functions serve --debug
```

---

## 📊 Testing desde Supabase Dashboard

### Opción 1: SQL Editor (Verificar datos)
1. Abre: http://127.0.0.1:54323
2. Ve a **SQL Editor**
3. Ejecuta queries:

```sql
-- Ver todos los usuarios
SELECT id, nombre, email, rol FROM usuarios;

-- Ver todas las pantallas
SELECT id, nombre, precio FROM pantallas;

-- Ver planes
SELECT id, dias, precio FROM planes;

-- Ver templates
SELECT id, nombre, tipo FROM templates;

-- Ver reservaciones creadas
SELECT id, id_pantalla, status, fecha_inicio, fecha_fin FROM reservaciones;
```

### Opción 2: GraphQL (Alternativo)

Endpoint: http://127.0.0.1:54321/graphql/v1

Query:
```graphql
{
  usuarios {
    id
    nombre
    email
    rol
  }
}
```

---

## ⚠️ Errores Comunes y Soluciones

| Error | Causa | Solución |
|-------|-------|----------|
| `No such function` | Functions no están sirviendo | Ejecutar `supabase functions serve` |
| `Pantalla no encontrada` | ID pantalla inválido | Ver IDs en SQL Editor |
| `Plan no encontrado` | ID plan inválido | Ver IDs en SQL Editor |
| `CORS error` | Navegador bloqueando | Usar curl o Postman |
| `Connection refused` | Supabase no corriendo | Ejecutar `supabase start` |

---

## 🎯 Flujo Completo de Testing

### Paso 1: Verificar Infraestructura
```bash
# Terminal 1
supabase start

# Terminal 2
supabase functions serve

# Esperar a que ambos estén corriendo
```

### Paso 2: Obtener IDs desde Dashboard
```
http://127.0.0.1:54323
→ SQL Editor
→ Ejecutar queries para obtener UUIDs
```

### Paso 3: Probar APIs

```bash
# Test disponibilidad (funciona sin IDs específicos si existe pantalla-001)
curl -X POST http://127.0.0.1:54321/functions/v1/verificar-disponibilidad \
  -H "Content-Type: application/json" \
  -d '{"id_pantalla":"pantalla-001","fecha_inicio":"2026-04-20","fecha_fin":"2026-04-27"}'

# Test crear reservación (con UUIDs reales)
curl -X POST http://127.0.0.1:54321/functions/v1/crear-reservacion \
  -H "Content-Type: application/json" \
  -d '{"id_pantalla":"pantalla-001","id_plan":"UUID_REAL","fecha_inicio":"2026-04-20","fecha_fin":"2026-04-27","id_usuario":"user-001"}'
```

### Paso 4: Verificar Resultados
- En dashboard, ver tabla `reservaciones` 
- Verificar tabla `disponibilidad_dia` actualizada
- Ver nuevos registros creados

---

## 💡 Tips de Debugging

### Ver logs en tiempo real
```bash
supabase functions serve --debug
```

### Testear directamente con psql
```bash
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres
```

### Resetear si algo falla
```bash
supabase db reset
supabase migration up
```

---

## 🚀 Recomendación: Usar Postman

Es más fácil que curl. Descárgalo desde https://www.postman.com/downloads/

1. Crear nueva Request POST
2. URL: `http://127.0.0.1:54321/functions/v1/verificar-disponibilidad`
3. Body (JSON):
```json
{
  "id_pantalla": "pantalla-001",
  "fecha_inicio": "2026-04-20",
  "fecha_fin": "2026-04-27"
}
```
4. Click Send

---

¿Necesitas ayuda para probar algo específico?
