# 📋 TEMPLATE ESTÁNDAR: Estructura de Edge Functions Supabase

Esta es la estructura que **TODA** Edge Function debe seguir en este proyecto.

---

## 🏗️ ESTRUCTURA GENERAL

```typescript
// ================================================================
// 1. IMPORTS
// ================================================================
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ================================================================
// 2. INICIALIZAR SUPABASE CLIENT
// ================================================================
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

// ================================================================
// 3. VARIABLES DE CONFIGURACIÓN (si aplica)
// ================================================================
const MP_ACCESS_TOKEN = Deno.env.get("MP_ACCESS_TOKEN")!; // Ejemplo: solo si necesita APIs externas

// ================================================================
// 4. HEADERS ESTÁNDAR
// ================================================================
const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
};

// ================================================================
// 5. INTERFACES/TYPES
// ================================================================
interface TuFuncionRequest {
  parametro1: string;
  parametro2?: number;
  parametro3: boolean;
  // ... resto de parámetros
}

interface RespuestaExitosa {
  success: true;
  // ... campos de respuesta exitosa
}

interface RespuestaError {
  success: false;
  error: string;
  details?: string;
}

// ================================================================
// 6. MAIN HANDLER
// ================================================================
serve(async (req: Request) => {
  // ── 6.1: MANEJAR CORS (SIEMPRE PRIMERO) ──
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        ...headers,
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  // ── 6.2: VALIDAR MÉTODO HTTP ──
  const METODO_PERMITIDO = "POST"; // Cambia según tu función
  if (req.method !== METODO_PERMITIDO) {
    return new Response(
      JSON.stringify({ success: false, error: "Método no permitido" }),
      { status: 405, headers },
    );
  }

  // ── 6.3: PARSEAR BODY ──
  let body;
  try {
    body = await req.json();
  } catch (_) {
    return new Response(
      JSON.stringify({ success: false, error: "Body JSON inválido" }),
      { status: 400, headers },
    );
  }

  // ── 6.4: DESESTRUCTURAR Y VALIDAR PARÁMETROS ──
  const { parametro1, parametro2, parametro3 } = body as TuFuncionRequest;

  // Validar parámetros requeridos
  if (!parametro1 || !parametro3) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Parámetros requeridos: parametro1, parametro3",
      }),
      { status: 400, headers },
    );
  }

  // ── 6.5: TRY-CATCH PARA LÓGICA PRINCIPAL ──
  try {
    // ── PASO 1: Validaciones de datos ──
    // Ejemplo: validar que exista registro en BD
    const { data: registro, error: queryError } = await supabase
      .from("tabla")
      .select("id, campo1, campo2")
      .eq("id", parametro1)
      .single();

    if (queryError || !registro) {
      return new Response(
        JSON.stringify({ success: false, error: "Registro no encontrado" }),
        { status: 404, headers },
      );
    }

    // ── PASO 2: Validaciones de lógica de negocio ──
    // Ejemplo: validar estado previo
    if (registro.campo1 === "estado_invalido") {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "El registro tiene un estado inválido para esta operación" 
        }),
        { status: 409, headers },
      );
    }

    // ── PASO 3: Operación principal ──
    // Ejemplo: actualizar registro
    const { data: updateResult, error: updateError } = await supabase
      .from("tabla")
      .update({ campo1: parametro2 })
      .eq("id", parametro1)
      .select()
      .single();

    if (updateError || !updateResult) {
      throw updateError || new Error("Error al actualizar");
    }

    // ── PASO 4: Operaciones adicionales (si aplica) ──
    // Ejemplo: registrar en log/auditoría
    // await supabase.from("logs").insert({ evento: "...", timestamp: new Date() });

    // ── PASO 5: RESPUESTA EXITOSA ──
    return new Response(
      JSON.stringify({
        success: true,
        data: updateResult,
        // ... resto de campos de respuesta
      }),
      { status: 201, headers },
    );
  } catch (error) {
    // ── 6.6: ERROR HANDLING ──
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";

    console.error("Error en función:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: "Error interno del servidor",
        details: errorMessage,
      }),
      { status: 500, headers },
    );
  }
});
```

---

## 📌 SECCIONES OBLIGATORIAS (EN ESTE ORDEN)

| Sección | Descripción | Requerido |
|---------|-------------|-----------|
| 1️⃣ **IMPORTS** | `serve`, `createClient` | ✅ Siempre |
| 2️⃣ **INICIALIZAR CLIENTE** | `createClient(URL, KEY)` | ✅ Siempre |
| 3️⃣ **VARIABLES CONFIG** | Tokens, enlaces, constantes | ⚠️ Si necesita APIs externas |
| 4️⃣ **HEADERS ESTÁNDAR** | CORS + Content-Type | ✅ Siempre |
| 5️⃣ **INTERFACES/TYPES** | Tipos de request/response | ✅ Siempre (TypeScript) |
| 6️⃣ **SERVE HANDLER** | `serve(async (req) => {...})` | ✅ Siempre |
| 6.1️⃣ **CORS (OPTIONS)** | Manejo de preflight | ✅ Siempre |
| 6.2️⃣ **MÉTODO HTTP** | GET, POST, DELETE, etc | ✅ Siempre |
| 6.3️⃣ **PARSEAR BODY** | `try-catch` en `req.json()` | ✅ Si recibe body |
| 6.4️⃣ **VALIDAR PARAMS** | Requeridos, tipos, rango | ✅ Siempre |
| 6.5️⃣ **TRY-CATCH PRINCIPAL** | Envuelve toda la lógica | ✅ Siempre |
| 6.6️⃣ **ERROR HANDLING** | Respuesta 500 consistente | ✅ Siempre |

---

## 🔴 HTTP STATUS CODES ESTÁNDAR

```typescript
// Éxito
201 // Created - POST exitoso, recurso creado
200 // OK - GET o respuesta exitosa genérica

// Errores de cliente
400 // Bad Request - parámetros inválidos
401 // Unauthorized - falta autenticación
403 // Forbidden - autenticado pero sin permisos
404 // Not Found - recurso no existe
409 // Conflict - violación de lógica de negocio (ej: ya pagado)

// Errores de servidor
500 // Internal Server Error - error no controlado
502 // Bad Gateway - error en API externa (ej: Mercado Pago)
```

---

## ✅ VALIDACIÓN DE PARÁMETROS

### Nivel 1: Requeridos
```typescript
const { param1, param2 } = body;

if (!param1 || !param2) {
  return new Response(
    JSON.stringify({
      success: false,
      error: "Parámetros requeridos: param1, param2"
    }),
    { status: 400, headers }
  );
}
```

### Nivel 2: Tipo de dato
```typescript
if (typeof monto !== "number" || monto <= 0) {
  return new Response(
    JSON.stringify({
      success: false,
      error: "El monto debe ser un número positivo"
    }),
    { status: 400, headers }
  );
}
```

### Nivel 3: Formato específico
```typescript
if (!fecha_inicio.match(/^\d{4}-\d{2}-\d{2}$/)) {
  return new Response(
    JSON.stringify({
      success: false,
      error: "fecha_inicio debe tener formato YYYY-MM-DD"
    }),
    { status: 400, headers }
  );
}
```

### Nivel 4: Que exista en BD
```typescript
const { data: registro, error } = await supabase
  .from("tabla")
  .select("id")
  .eq("id", id_parametro)
  .single();

if (error || !registro) {
  return new Response(
    JSON.stringify({ success: false, error: "Registro no encontrado" }),
    { status: 404, headers }
  );
}
```

### Nivel 5: Lógica de negocio
```typescript
if (reservacion.estado !== "pendiente") {
  return new Response(
    JSON.stringify({
      success: false,
      error: "Solo se pueden procesar reservaciones en estado 'pendiente'"
    }),
    { status: 409, headers }
  );
}
```

---

## 📤 ESTRUCTURA DE RESPUESTAS

### ✅ Respuesta Exitosa (201)
```typescript
{
  "success": true,
  "payment_id": "123456",
  "status": "approved",
  "status_detail": "accredited"
}
```

### ✅ Respuesta con Warning (201 pero con advertencia)
```typescript
{
  "success": true,
  "payment_id": "123456",
  "status": "approved",
  "warning": "Pago aprobado pero error al actualizar BD: timeout"
}
```

### ❌ Respuesta de Error (4xx/5xx)
```typescript
{
  "success": false,
  "error": "Parámetros requeridos",
  "details": "Faltan: payment_method_id, payer_email"  // opcional
}
```

---

## 🔍 CHECKLIST PRE-DEPLOYMENT

- [ ] Imports correctos (`serve`, `createClient`)
- [ ] `deno.json` existe y está actualizado
- [ ] Método HTTP validado (GET/POST/DELETE/etc)
- [ ] CORS manejado (OPTIONS response)
- [ ] Body parseado con try-catch
- [ ] Todos los parámetros requeridos validados
- [ ] Tipos TypeScript definidos (interfaces)
- [ ] Respuestas 404 si no existe recurso
- [ ] Respuestas 409 si viola lógica de negocio
- [ ] Respuestas 500 en catch block
- [ ] Status code correcto en cada respuesta
- [ ] Headers "Content-Type" y "Access-Control-Allow-Origin"
- [ ] Console.error() en catch para debugging
- [ ] Variables de entorno cargadas con `Deno.env.get()`
- [ ] Nombres de funciones en kebab-case (ej: `validar-cupon`)
- [ ] README.md en carpeta de función con descripción

---

## 📂 ESTRUCTURA DE CARPETA

```
supabase/functions/nombre-funcion/
├── index.ts                  # Archivo principal
├── deno.json                 # Config Deno (imports)
├── README.md                 # Descripción y ejemplos
└── types.ts                  # (Opcional) tipos reutilizables
```

**README.md debe contener:**
```markdown
# nombre-funcion

**Descripción:** Qué hace esta función

## Request
```json
{
  "param1": "valor",
  "param2": 123
}
```

## Response (201)
```json
{
  "success": true,
  "result": "..."
}
```

## Errores posibles
- 400: Parámetros inválidos
- 404: Recurso no encontrado
- 409: Estado inválido
```

---

## 🎯 EJEMPLO SIMPLIFICADO: validar-cupon

Basándote en el archivo que viste, la estructura sería:

```
supabase/functions/validar-cupon/
├── index.ts              # La función
├── README.md             # Documentación
└── deno.json             # Imports

// index.ts estructura:
1. Imports (serve, createClient)
2. Inicializar Supabase
3. Headers estándar
4. Interface ValidarCuponRequest { codigo, id_reservacion }
5. serve(async (req) => {
   - CORS OPTIONS
   - Validar POST
   - Parsear body
   - Validar parámetros requeridos
   - try {
       - Validar que cupón exista en BD
       - Validar que cupón no esté expirado
       - Validar que reservación exista
       - Calcular descuento
       - Actualizar reservación
       - return 201 { success, descuento, monto_final }
     } catch
   - return 500 en catch
```

---

## 🚀 USA ESTE TEMPLATE PARA:

✅ Crear `validar-cupon`  
✅ Crear nuevas Edge Functions  
✅ Refactorizar funciones existentes  
✅ Entrenar a otros developers  

---

**Última actualización:** 8 de abril, 2026
