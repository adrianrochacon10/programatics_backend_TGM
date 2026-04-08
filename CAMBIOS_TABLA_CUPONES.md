# 📋 CAMBIOS EN TABLA DE CUPONES/DESCUENTOS

## ✅ Cambios Realizados

Tu SQL original **necesitaba 3 cambios** para funcionar con la Edge Function `validar-cupon`:

### 1. ❌ ➜ ✅ Cambiar nombre de columna

**Original:**
```sql
porcentaje INTEGER NOT NULL
```

**Corregido:**
```sql
porcentaje_descuento INTEGER NOT NULL
```

**Por qué:** La función busca el campo `porcentaje_descuento`:
```typescript
.select("id, codigo, porcentaje_descuento, activo, fecha_expiracion, usos_maximos, usos_actuales")
```

---

### 2. ❌ ➜ ✅ Agregar campo fecha_expiracion

**Faltaba:**
```sql
fecha_expiracion DATE DEFAULT NULL
```

**Por qué:** La función valida si el cupón expiró:
```typescript
if (cupon.fecha_expiracion) {
  const fechaExpiracion = new Date(cupon.fecha_expiracion);
  const hoy = new Date();
  if (hoy > fechaExpiracion) {
    return error: "Este cupón ha expirado"
  }
}
```

---

### 3. ✅ Cambiar nombre de tabla (Recomendado)

**Original:**
```sql
CREATE TABLE codigos_descuento
```

**Recomendado:**
```sql
CREATE TABLE cupones  ← Usado en la función
```

**O:** Cambiar la función para usar tu nombre de tabla.

---

## 📊 Tabla Final Correcta

```sql
CREATE TABLE public.cupones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Campos requeridos por validar-cupon
  codigo TEXT UNIQUE NOT NULL,                    -- "CODIGO20", "VERANO30"
  porcentaje_descuento INTEGER NOT NULL,          -- 10, 20, 30
  activo BOOLEAN DEFAULT true,                    -- true/false
  fecha_expiracion DATE DEFAULT NULL,             -- null = nunca expira
  usos_maximos INTEGER DEFAULT NULL,              -- null = ilimitado
  usos_actuales INTEGER DEFAULT 0,                -- contador
  
  -- Campos adicionales útiles
  descripcion TEXT,                               -- descripción para admin
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

---

## 🔄 Comparativa: Original vs Corregido

| Campo | Original | Corregido | Requerido |
|-------|----------|-----------|-----------|
| `id` | ✅ UUID | ✅ UUID | ✅ Sí |
| `codigo` | ✅ TEXT UNIQUE | ✅ TEXT UNIQUE | ✅ Sí |
| `porcentaje` | ❌ | `porcentaje_descuento` | ✅ Sí |
| `descripcion` | ✅ TEXT | ✅ TEXT | ⚠️ Opcional |
| `activo` | ✅ BOOLEAN | ✅ BOOLEAN | ✅ Sí |
| `fecha_expiracion` | ❌ | ✅ DATE | ✅ Sí |
| `usos_maximos` | ✅ INTEGER | ✅ INTEGER | ✅ Sí |
| `usos_actuales` | ✅ INTEGER | ✅ INTEGER | ✅ Sí |

---

## 🚀 Pasos para Aplicar los Cambios

### Opción A: Migración limpia (RECOMENDADO)

```bash
# 1. Crear la migración
supabase migration new crear_tabla_cupones

# 2. Pegar el contenido de: 20260408_crear_tabla_cupones.sql

# 3. Crear segunda migración para reservaciones
supabase migration new actualizar_reservaciones_descuentos

# 4. Pegar el contenido de: 20260408_actualizar_reservaciones_descuentos.sql

# 5. Ejecutar migraciones
supabase migration up
supabase db reset
```

### Opción B: SQL manual en Dashboard

1. Abre Supabase Dashboard: http://127.0.0.1:54323
2. **SQL Editor** → ejecuta el archivo `20260408_crear_tabla_cupones.sql`
3. Luego ejecuta `20260408_actualizar_reservaciones_descuentos.sql`

---

## 📥 Datos de Prueba

```sql
INSERT INTO public.cupones (codigo, porcentaje_descuento, descripcion, activo, fecha_expiracion, usos_maximos)
VALUES
  ('CODIGO10', 10, '10% de Descuento', true, NULL, 100),
  ('CODIGO20', 20, '20% de Descuento', true, NULL, 50),
  ('CODIGO30', 30, '30% de Descuento en julio', true, '2026-07-31', NULL),
  ('VERANO2026', 15, 'Descuento especial de verano', true, '2026-06-30', 1000);
```

---

## 🔐 RLS Policies

El archivo de migración incluye:

- ✅ **SELECT**: Cualquiera puede ver cupones activos (para validación en frontend)
- ✅ **INSERT/UPDATE**: Solo admin puede crear/modificar cupones
- ✅ **RPC incrementar_usos_cupon**: Llamada desde Edge Function

---

## 🔧 Funciones RPC Creadas

### 1. `incrementar_usos_cupon(p_id_cupon UUID)`
La Edge Function la llama para registrar que un cupón fue usado.

```typescript
// En validar-cupon/index.ts
const { error: usosError } = await supabase.rpc("incrementar_usos_cupon", {
  p_id_cupon: cupon.id,
});
```

### 2. `obtener_cupones()` (Opcional)
Devuelve lista de cupones con campo `disponible` calculado.

---

## 🧪 Probar en Postman

### Request:
```json
POST http://127.0.0.1:54321/functions/v1/validar-cupon

{
  "codigo": "CODIGO20",
  "id_reservacion": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Response (200 OK):
```json
{
  "success": true,
  "valido": true,
  "cupon_codigo": "CODIGO20",
  "porcentaje_descuento": 20,
  "monto_original": 5000,
  "descuento_aplicado": 1000,
  "monto_final": 4000,
  "ahorro": "$1000"
}
```

---

## ⚠️ Si tu tabla YA EXISTE

Si ya creaste la tabla `codigos_descuento`, tienes dos opciones:

### Opción 1: Renombrar tabla
```sql
ALTER TABLE codigos_descuento RENAME TO cupones;
ALTER TABLE cupones RENAME COLUMN porcentaje TO porcentaje_descuento;
ALTER TABLE cupones ADD COLUMN fecha_expiracion DATE DEFAULT NULL;
```

### Opción 2: Cambiar la función
Edita `validar-cupon/index.ts` línea 121:
```typescript
// Cambiar:
.from("cupones")

// A:
.from("codigos_descuento")

// Y cambiar la búsqueda de:
.select("id, codigo, porcentaje_descuento, activo, fecha_expiracion, usos_maximos, usos_actuales")

// A:
.select("id, codigo, porcentaje as porcentaje_descuento, activo, null::date as fecha_expiracion, usos_maximos, usos_actuales")
```

**Recomendación:** Opción 1 es más limpia.

---

## ✅ Checklist

- [ ] Crear archivo `20260408_crear_tabla_cupones.sql`
- [ ] Crear archivo `20260408_actualizar_reservaciones_descuentos.sql`
- [ ] Ejecutar `supabase migration up`
- [ ] Ejecutar `supabase db reset`
- [ ] Insertar datos de prueba
- [ ] Verificar tabla en Dashboard
- [ ] Probar endpoint `validar-cupon` en Postman

---

**Conclusión:** Sí, necesitaba cambios. Los 3 principales:
1. ✅ `porcentaje` → `porcentaje_descuento`
2. ✅ Agregar `fecha_expiracion`
3. ✅ Renombrar tabla a `cupones`

Los archivos de migración ya están listos. 🚀
