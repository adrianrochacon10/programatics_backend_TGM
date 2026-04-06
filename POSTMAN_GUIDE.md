# 🔧 Guía Postman - Testing APIs The Good Mark

## 📥 Descargar Postman

1. Descarga desde: https://www.postman.com/downloads/
2. Instala y abre
3. Haz login (opcional, puedes saltar)

---

## 🎯 URLs Base

```
Project URL: http://127.0.0.1:54321
Functions: http://127.0.0.1:54321/functions/v1
Dashboard: http://127.0.0.1:54323
```

---

## 📋 OBTENER IDs REALES (IMPORTANTE)

Antes de probar, necesitas los UUIDs reales. Sigue estos pasos:

### Paso 1: Abre Dashboard
```
http://127.0.0.1:54323
```

### Paso 2: Ve a SQL Editor
```
Dashboard → SQL Editor (parte inferior)
```

### Paso 3: Ejecuta esta query
```sql
SELECT id, nombre FROM pantallas LIMIT 1;
SELECT id, dias FROM planes LIMIT 1;
```

### Paso 4: Copia los IDs
Deberías ver algo como:

**Pantallas:**
```
id: "pantalla-001"
nombre: "Pantalla Centro Histórico"
```

**Planes:**
```
id: "d4e5c6f7-8h9i-0j1k-2l3m-4n5o6p7q8r9s"
dias: 7
```

Copia estos IDs para Postman.

---

## ✅ TEST 1: VERIFICAR DISPONIBILIDAD

### En Postman:

1. **Click en "+"** para nueva request
2. **Selecciona método:** POST
3. **Pega la URL:**
```
http://127.0.0.1:54321/functions/v1/verificar-disponibilidad
```

4. **Ve a la pestaña "Body"**
5. **Selecciona: raw → JSON**
6. **Pega esto:**
```json
{
  "id_pantalla": "pantalla-001",
  "fecha_inicio": "2026-04-20",
  "fecha_fin": "2026-04-27"
}
```

7. **Click "Send"**

### Respuesta Esperada (200 OK)
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

Si ves esto, ¡Test 1 OK! ✅

---

## ✅ TEST 2: CREAR RESERVACIÓN

### En Postman:

1. **Click en "+"** para nueva request
2. **Selecciona método:** POST
3. **Pega la URL:**
```
http://127.0.0.1:54321/functions/v1/crear-reservacion
```

4. **Ve a "Body" → raw → JSON**

5. **IMPORTANTE: Reemplaza estos UUIDs con los reales que copiaste:**
```json
{
  "id_pantalla": "pantalla-001",
  "id_plan": "REEMPLAZA_CON_UUID_REAL_DEL_PLAN",
  "fecha_inicio": "2026-04-20",
  "fecha_fin": "2026-04-27",
  "id_usuario": "user-001"
}
```

**Ejemplo con UUID real (como debe quedar):**
```json
{
  "id_pantalla": "pantalla-001",
  "id_plan": "d4e5c6f7-8h9i-0j1k-2l3m-4n5o6p7q8r9s",
  "fecha_inicio": "2026-04-20",
  "fecha_fin": "2026-04-27",
  "id_usuario": "user-001"
}
```

6. **Click "Send"**

### Respuesta Esperada (201 Created)
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

Si ves `"success": true`, ¡Test 2 OK! ✅

---

## 📌 Errores Comunes en Postman

### Error: "Pantalla no encontrada" (404)
```
❌ Significa: ID de pantalla inválido
✅ Solución: Usa "pantalla-001" que es el ID por defecto
```

### Error: "Plan no encontrado" (404)
```
❌ Significa: UUID del plan inválido
✅ Solución: Copia el UUID exacto de la query SQL
```

### Error: "Connection refused"
```
❌ Significa: Supabase no está corriendo
✅ Solución: 
   Terminal → supabase start
```

### Error: "No hay disponibilidad el 2026-04-XX"
```
❌ Significa: Ya hay 6 reservas ese día
✅ Solución: Intenta con fechas diferentes
```

---

## 💾 Guardar Requests en Postman

Para no tener que copiar-pegar cada vez:

1. **Crea una Collection:**
   - Click "Collections" (izquierda)
   - Click "+ New Collection"
   - Nombre: "The Good Mark APIs"
   - Click "Create"

2. **Agregar Request 1:**
   - Click "Add requests"
   - Selecciona la request de disponibilidad
   - Click "Save"

3. **Agregar Request 2:**
   - Idem para crear-reservacion

4. **Próxima vez:**
   - Abre Collection
   - Click request guardada
   - Modifica si necesitas
   - Click "Send"

---

## 🔑 Opciones Avanzadas (Opcional)

### Usar Variables en Postman

1. **En la request, antes de Send:**
   - Click en "Body"
   - Reemplaza con: `{{plan_id}}`

Ejemplo:
```json
{
  "id_pantalla": "pantalla-001",
  "id_plan": "{{plan_id}}",
  "fecha_inicio": "2026-04-20",
  "fecha_fin": "2026-04-27",
  "id_usuario": "user-001"
}
```

2. **Configurar Variables:**
   - Click Settings (engranaje arriba-derecha)
   - Pestaña "Variables"
   - Name: `plan_id`
   - Value: `d4e5c6f7-8h9i-0j1k-2l3m-4n5o6p7q8r9s`
   - Click "Save"

3. **Listo!** Ahora puedes usar `{{plan_id}}` en cualquier request

---

## 📊 Ver Resultados en Dashboard

Después de crear reservaciones, verifica en dashboard:

1. Abre http://127.0.0.1:54323
2. Ve a Table Browser (izquierda)
3. Selecciona tabla: `reservaciones`
4. Deberías ver las reservas creadas

O desde SQL Editor (para más detalle):
```sql
SELECT id, id_pantalla, fecha_inicio, fecha_fin, status 
FROM reservaciones 
ORDER BY created_at DESC;
```

---

## 🎓 Guía Rápida de Postman

| Acción | Cómo Hacerlo |
|--------|-------------|
| Nueva Request | Click "+" arriba |
| Cambiar Método | Dropdown al lado de la URL (GET, POST, etc) |
| Agregar Body | Pestaña "Body" → raw → JSON |
| Ver Response | Aparece automáticamente abajo |
| Guardar Request | Click "Save" (o Ctrl+S) |
| Historial | Click "History" (izquierda) |
| Copiar Request |3 puntos → Duplicate |
| Probar otro params | Modifica Body y click Send de nuevo |

---

## ✅ Checklist para Probar

```
□ Supabase corriendo (supabase status)
□ Postman instalado y abierto
□ Panel del Dashboard visto (http://127.0.0.1:54323)
□ IDs copiados (pantalla-001, UUID del plan)
□ Request 1 (verificar-disponibilidad)
   □ URL correcta
   □ Body en JSON
   □ Click Send
   □ Respuesta 200 OK
□ Request 2 (crear-reservacion)
   □ URL correcta
   □ UUID del plan reemplazado
   □ Body en JSON
   □ Click Send
   □ Respuesta 201 Created
□ Ver resultados en Dashboard
   □ Tabla reservaciones
   □ Tabla disponibilidad_dia
```

Si todos los checkboxes están ✅, ¡TODO FUNCIONA!

---

## 🚀 Próximos Tests (Opcional)

Si quieres ir más allá:

1. **Crear múltiples reservaciones:**
   - Cambia fecha_inicio y fecha_fin
   - Click Send de nuevo
   - Ver cómo baja disponibilidad

2. **Verificar límite de 6 spots:**
   - Crea 6 reservaciones en las mismas fechas
   - La 7ª debería fallar con "No hay disponibilidad"

3. **Probar con diferentes pantallas:**
   - Cambia `id_pantalla` a otra disponible
   - Verifica disponibilidad

---

## 💡 Tips

- **Guarda responses:** Click "Save Response" cuando veas una respuesta interesante
- **Tests automáticos:** En pestaña "Tests" puedes automatizar validaciones
- **Mock Servers:** Crea un mock server para compartir con frontend
- **Export:** Exporta Collection para compartir con el equipo

---

## 📞 Ayuda Rápida

Si Postman da error:
1. Verifica que URL esté correcta
2. Verifica que Body esté en JSON
3. Verifica que method sea POST
4. Verifica que Supabase esté corriendo
5. Revisa la sección "Errores Comunes"

---

¡Listo para probar! 🚀
