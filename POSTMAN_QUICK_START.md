# 🚀 POSTMAN - Guía Rápida de Inicio (5 minutos)

## ✅ Lo que tienes funcionando

```
✅ Supabase corriendo en http://127.0.0.1:54321
✅ Base de datos con datos de prueba
✅ 2 Edge Functions (APIs)
✅ Colección Postman lista para importar
```

---

## 📥 PASO 1: Descargar Postman (si no lo tienes)

1. Ve a: https://www.postman.com/downloads/
2. Descarga tu versión (Windows/Mac/Linux)
3. Instala y abre

---

## 📂 PASO 2: Importar Colección

### Opción A: Importar archivo (Recomendado)

1. **Abre Postman** (si no está abierto)
2. **Click en "Import"** (arriba-izquierda)
3. **Selecciona: "Upload Files"**
4. **Navega a:** `d:\ESTADIAS_THEGOODMARK\programatics_backend_TGM\`
5. **Selecciona:** `The_Good_Mark_APIs.postman_collection.json`
6. **Click "Import"**

¡Listo! Ya tienes las 2 requests guardadas.

### Opción B: Crear manual (si prefieres)

1. Click "+" para nueva request
2. Método: **POST**
3. URL: `http://127.0.0.1:54321/functions/v1/verificar-disponibilidad`
4. Body → raw → JSON
5. Pega:
```json
{
  "id_pantalla": "pantalla-001",
  "fecha_inicio": "2026-04-20",
  "fecha_fin": "2026-04-27"
}
```

---

## 🔑 PASO 3: Obtener UUID del Plan (IMPORTANTE)

**Este es el único paso manual necesario.**

1. Abre dashboard: http://127.0.0.1:54323
2. Click en **"SQL Editor"** (abajo)
3. Ejecuta esta query:
```sql
SELECT id, dias, precio FROM planes LIMIT 1;
```

4. Copiar el `id` (es un UUID como `d4e5c6f7-8901-2345-6789-abcdef123456`)

---

## 🧪 PASO 4: Test 1 - Verificar Disponibilidad

### En Postman:

1. **Collections** → "The Good Mark APIs"
2. **Click:** "1. Verificar Disponibilidad"
3. **Click "Send"**

### Deberías ver (200 OK):
```json
{
  "id_pantalla": "pantalla-001",
  "nombre_pantalla": "Pantalla Centro Histórico",
  "disponibilidad": {
    "2026-04-20": 6,
    "2026-04-21": 6,
    ... más días ...
  }
}
```

**Si ves esto → ✅ Test 1 OK**

Si no ves nada o error → Verifica que Supabase esté corriendo: `supabase status`

---

## 🧪 PASO 5: Test 2 - Crear Reservación

### En Postman:

1. **Collections** → "The Good Mark APIs"
2. **Click:** "2. Crear Reservación"
3. **En el Body**, reemplaza `{{plan_uuid}}` con el UUID que copiaste en PASO 3

**Ejemplo (después de reemplazar):**
```json
{
  "id_pantalla": "pantalla-001",
  "id_plan": "d4e5c6f7-8901-2345-6789-abcdef123456",
  "fecha_inicio": "2026-04-20",
  "fecha_fin": "2026-04-27",
  "id_usuario": "user-001"
}
```

4. **Click "Send"**

### Deberías ver (201 Created):
```json
{
  "success": true,
  "reservation_id": "550e8400-e29b-41d4-a716-446655440000",
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

**Si ves esto → ✅ Test 2 OK**

---

## 📊 PASO 6: Verificar datos en Dashboard

Para confirmar que la reservación se guardó:

1. Abre dashboard: http://127.0.0.1:54323
2. **Table Browser** → Tabla: `reservaciones`
3. Deberías ver una nueva fila con tu reservación

O en SQL Editor:
```sql
SELECT * FROM reservaciones ORDER BY created_at DESC LIMIT 1;
```

**Si ves los datos → ✅ TODO FUNCIONA**

---

## ⚡ Resumen Visual

```
┌─────────────────────────────────────┐
│  Abre Postman                       │
│  Click "Import"                     │
│  Selecciona .json                   │
│  ↓                                  │
├─────────────────────────────────────┤
│  Obtén UUID del plan from dashboard │
│  ↓                                  │
├─────────────────────────────────────┤
│  Test 1: Verificar Disponibilidad   │
│  Click Send → 200 OK ✅            │
│  ↓                                  │
├─────────────────────────────────────┤
│  Test 2: Crear Reservación          │
│  Reemplaza {{plan_uuid}}            │
│  Click Send → 201 OK ✅            │
│  ↓                                  │
├─────────────────────────────────────┤
│  Ver en dashboard                   │
│  Tabla: reservaciones ✅            │
│  Tabla: disponibilidad_dia ✅       │
└─────────────────────────────────────┘
```

---

## 🐛 Si algo falla

### Error: "Connection refused"
```
→ Supabase no está corriendo
→ Terminal: supabase start
```

### Error: "Pantalla no encontrada"
```
→ Cambia id_pantalla a: "pantalla-001"
```

### Error: "Plan no encontrado" (404)
```
→ El UUID está incorrecto
→ Verifica que lo copiaste bien desde dashboard
```

### Error: "No hay disponibilidad"
```
→ Ya hay 6 reservas en esas fechas
→ Intenta con otras fechas (ej: 2026-05-01 a 2026-05-08)
```

---

## 💡 Tips Útiles

### Probar múltiples veces
1. Cambia `fecha_inicio` y `fecha_fin`
2. Click Send de nuevo
3. Ver cómo baja disponibilidad cada vez

### Usar Variables Postman
En lugar de reemplazar UUID cada vez:
1. Click Settings (engranaje)
2. Variables → Crear variable
3. Click "Save"
4. Ya puedes reutilizar en todas las requests

### Guardar Responses
Después de Send:
1. Click "Save Response"
2. Dale un nombre
3. Puedes revisarla luego

---

## ✅ Checklist Final

```
□ Postman instalado
□ Colección importada
□ UUID del plan copiado
□ Test 1 enviado → 200 OK
□ Test 2 enviado → 201 OK
□ Datos visibles en dashboard
```

Si todos los ✅, ¡TODO FUNCIONA PERFECTO! 🚀

---

## 📞 Próximos Pasos

Cuando tengas todo funcionando:
1. **Crea más reservaciones** con diferentes fechas
2. **Prueba el límite** de 6 spots por día
3. **Conecta un frontend** (React/Next.js) a estas APIs
4. **Integra pagos** (Stripe/MercadoPago)

---

**¿Necesitas ayuda? Mira POSTMAN_GUIDE.md para más detalles.**
