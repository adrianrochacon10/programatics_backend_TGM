# Edge Functions - The Good Mark

## Descripción General

Las Edge Functions son funciones serverless alojadas en Supabase que manejan la lógica crítica de negocio de The Good Mark.

## Funciones Disponibles

### 1. `verificar-disponibilidad`

**Propósito:** Consultar disponibilidad de spots en una pantalla para un rango de fechas.

**Endpoint:** `POST /functions/v1/verificar-disponibilidad`

**Request:**
```json
{
  "id_pantalla": "pantalla-001",
  "fecha_inicio": "2026-04-15",
  "fecha_fin": "2026-04-30"
}
```

**Response (Éxito - 200):**
```json
{
  "id_pantalla": "pantalla-001",
  "nombre_pantalla": "Centro Comercial Durango - Entrada Principal",
  "disponibilidad": {
    "2026-04-15": 6,
    "2026-04-16": 6,
    "2026-04-17": 5,
    "2026-04-18": 6,
    ...
  }
}
```

**Response (Error - 404):**
```json
{
  "error": "Pantalla no encontrada o inactiva"
}
```

---

### 2. `crear-reservacion`

**Propósito:** Crear una nueva reservación validando disponibilidad, planes y usuarios.

**Endpoint:** `POST /functions/v1/crear-reservacion`

**Request:**
```json
{
  "id_pantalla": "pantalla-001",
  "id_plan": "plan-002",
  "fecha_inicio": "2026-04-20",
  "fecha_fin": "2026-04-27",
  "id_usuario": "user-001"
}
```

**Response (Éxito - 201):**
```json
{
  "success": true,
  "reservation_id": "550e8400-e29b-41d4-a716-446655440000",
  "details": {
    "pantalla": "Centro Comercial Durango - Entrada Principal",
    "usuario": "contacto@empresapub.com",
    "fecha_inicio": "2026-04-20",
    "fecha_fin": "2026-04-27",
    "dias": 7,
    "precio_total": 3000.00,
    "status": "pendiente"
  }
}
```

**Response (Error - No disponible):**
```json
{
  "success": false,
  "error": "No hay disponibilidad el 2026-04-18. Máximo 6 spots por día."
}
```

---

## Validaciones

### `crear-reservacion` valida:
- ✅ Parámetros requeridos
- ✅ Validez de fechas (inicio < fin)
- ✅ Existencia y estado activo de la pantalla
- ✅ Existencia y estado activo del plan
- ✅ Existencia del usuario
- ✅ Disponibilidad de spots (máx 6 por día)
- ✅ Creación de registros en `disponibilidad_dia`

---

## Testing Local

```bash
# 1. Iniciar servidor de funciones
supabase functions serve

# 2. Verificar disponibilidad
curl -X POST http://localhost:54321/functions/v1/verificar-disponibilidad \
  -H "Content-Type: application/json" \
  -d '{
    "id_pantalla": "pantalla-001",
    "fecha_inicio": "2026-04-15",
    "fecha_fin": "2026-04-30"
  }'

# 3. Crear reservación
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

## Notas Importantes

- Las funciones usan el **Service Role Key** de Supabase para bypass RLS
- Las respuestas incluyen headers CORS habilitados para cliente web
- Los errores son descriptivos para facilitar debugging en frontend
- Se implementó validación de cupo máximo (6 spots/día) en la lógica
- Las reservaciones se crean con status "pendiente" inicialmente

---

## Mejoras Futuras

- [ ] Integración con pasarela de pagos (Stripe/MercadoPago)
- [ ] Envío de emails de confirmación
- [ ] Validación de contenido (moderación automática)
- [ ] Webhook para notificaciones
- [ ] Rate limiting y throttling
- [ ] Logging detallado
