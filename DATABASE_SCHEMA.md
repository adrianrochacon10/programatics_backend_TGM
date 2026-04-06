# 📊 Esquema Final de Base de Datos - The Good Mark

## ✅ Tablas Actualizadas

### 1. **usuarios**
```
- id (text, PK)
- nombre (text, NOT NULL)
- email (text, NOT NULL, UNIQUE)
- rol (text, DEFAULT 'admin')
- created_at (timestamp)
- updated_at (timestamp)
```

### 2. **pantallas**
```
- id (text, PK, DEFAULT gen_random_uuid())
- nombre (text, NOT NULL)
- direccion (text)
- url_direccion (text)
- lat (numeric)
- lng (numeric)
- resolucion (text)
- medidas (text)
- precio (numeric)
- hora_inicio (time)
- hora_fin (time)
- foto (text)
- impactos (integer, DEFAULT 0)
- status (text, DEFAULT 'activo')
- created_at (timestamp)
- updated_at (timestamp)
```

### 3. **planes**
```
- id (uuid, PK)
- dias (integer, NOT NULL)
- spots_dia (integer, NOT NULL)
- precio (numeric, NOT NULL)
- activo (boolean, DEFAULT true)
- creado_en (timestamp)
```

### 4. **reservaciones**
```
- id (uuid, PK)
- id_pantalla (text, FK → pantallas)
- id_plan (uuid, FK → planes)
- fecha_inicio (date, NOT NULL)
- fecha_fin (date, NOT NULL)
- rango_dias (integer)
- status (text, DEFAULT 'pendiente')
- created_at (timestamp)
```

### 5. **disponibilidad_dia**
```
- id (uuid, PK)
- id_reservacion (uuid, FK → reservaciones)
- dia (date, NOT NULL)
- limite_maximo (integer, NOT NULL)
- status_dia (text, DEFAULT 'disponible')
```

### 6. **templates** ⭐ NEW
```
- id (uuid, PK, DEFAULT gen_random_uuid())
- nombre (text, NOT NULL)
- tipo (text, NOT NULL) // Banner, Video, Carousel, Static, etc
- config (jsonb, DEFAULT '{}')
- status (text, DEFAULT 'active')
- created_at (timestamp)
```

### 7. **contenido**
```
- id (uuid, PK)
- id_reservacion (uuid, FK → reservaciones)
- id_template (uuid, FK → templates)
- id_contenido (text)
- url_archivo (text)
- status_moderacion (text)
- created_at (timestamp)
```

### 8. **ventas**
```
- id (uuid, PK)
- id_pantalla (text, FK → pantallas)
- id_reservacion (uuid, FK → reservaciones)
- nombre_pantalla (text)
- url_contenido (text)
- email_contacto (text)
- nombre_contacto (text)
- telefono_contacto (text)
- dias (integer)
- fecha_inicio (date)
- fecha_fin (date)
- status_moderacion (text, DEFAULT 'en_revision')
- created_at (timestamp)
```

---

## 🔗 Relaciones

```
usuarios
  ↓ (no FK, pero se refencia en RLS)

pantallas (PK: id)
  ← reservaciones.id_pantalla (FK)
  ← ventas.id_pantalla (FK)

planes (PK: id)
  ← reservaciones.id_plan (FK)

templates (PK: id)
  ← contenido.id_template (FK)

reservaciones (PK: id)
  → disponibilidad_dia.id_reservacion (FK)
  → contenido.id_reservacion (FK)
  → ventas.id_reservacion (FK)
```

---

## 🔐 Índices Creados

- `idx_reservaciones_id_pantalla` → Búsquedas por pantalla
- `idx_reservaciones_id_plan` → Búsquedas por plan
- `idx_disponibilidad_dia_dia` → Búsquedas por fecha
- `idx_disponibilidad_dia_id_reservacion` → FK performante
- `idx_contenido_id_reservacion` → FK performante
- `idx_contenido_id_template` → FK performante
- `idx_ventas_id_pantalla` → FK performante
- `idx_ventas_id_reservacion` → FK performante
- `idx_templates_status` → Filtro por estado

---

## 🔒 RLS Policies (Row Level Security)

### Acceso Público
- **pantallas**: SELECT si status = 'activo'
- **planes**: SELECT si activo = true
- **templates**: SELECT si status = 'active'
- **disponibilidad_dia**: SELECT (público)

### Acceso Admin Solo
- **pantallas**: INSERT/UPDATE/DELETE (solo admins)
- **planes**: INSERT/UPDATE/DELETE (solo admins)
- **templates**: INSERT/UPDATE/DELETE (solo admins)
- **usuarios**: SELECT/UPDATE (solo datos propios)
- **ventas**: SELECT (solo admins)

### Acceso Autenticado
- **reservaciones**: INSERT (si autenticado)
- **contenido**: INSERT (si autenticado)

---

## 🌱 Seed Data Incluido

### Templates (5 templates de contenido)
- Banner Estándar HD (1920x1080)
- Banner Vertical HD (1080x1920)
- Video 4K (3840x2160)
- Carrusel de Imágenes
- Texto + Imagen

### Usuarios (4 usuarios)
- admin-001: Admin principal
- admin-002: Moderador
- user-001: Empresa Publicidad
- user-002: Tienda Local

### Planes (3 planes)
- 7 días → $1500
- 15 días → $2800
- 30 días → $5000

### Pantallas (5 pantallas activas)
- Pantalla Centro Histórico
- Pantalla Blvd. Domingo Arrieta
- Pantalla Plaza Fórum
- Pantalla Galerías Durango
- Pantalla Av. Universidad

---

## 🚀 Próximos Pasos

1. **Ejecutar migraciones**:
   ```bash
   supabase migration up
   ```

2. **Generar tipos actualizados**:
   ```bash
   supabase gen types typescript --local > src/types/database.types.ts
   ```

3. **Servir Edge Functions**:
   ```bash
   supabase functions serve
   ```

4. **Testing**:
   ```bash
   curl -X POST http://localhost:54321/functions/v1/verificar-disponibilidad ...
   ```

---

## 📝 Notas

✅ Todos los UUIDs usan `gen_random_uuid()`  
✅ Pantallas usan string ID (`gen_random_uuid()::text`)  
✅ Templates es nueva tabla para gestionar formatos  
✅ Contenido se relaciona con templates  
✅ RLS configuradas por rol (admin/normal)  
✅ Índices optimizadas para búsquedas frecuentes  
