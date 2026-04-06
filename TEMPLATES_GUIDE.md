# 📝 Referencia: Trabajar con Templates

## 🎨 ¿Qué son los Templates?

Los **templates** son plantillas predefinidas de contenido que determinan:
- Dimensiones (1920x1080, 3840x2160, etc)
- Formato (16:9, 9:16, etc)
- Tipo de contenido (Banner, Video, Carousel, Static)
- Configuración específica (duración, max files, etc)

Los clientes **deben elegir un template** antes de subir contenido.

---

## 📊 Templates Disponibles

### 1. Banner Estándar HD
- **ID**: Se obtiene con query
- **Tipo**: `Banner`
- **Dimensiones**: 1920 x 1080 (16:9)
- **Tamaño**: 50 MB máximo
- **Uso**: Publicidad estándar horizontal

### 2. Banner Vertical HD
- **Tipo**: `Banner`
- **Dimensiones**: 1080 x 1920 (9:16)
- **Tamaño**: 50 MB máximo
- **Uso**: Publicidad en pantallas verticales

### 3. Video 4K
- **Tipo**: `Video`
- **Dimensiones**: 3840 x 2160 (16:9)
- **Duración**: 30 segundos
- **Tamaño**: 1 GB máximo
- **Uso**: Video promocional de alta resolución

### 4. Carrusel de Imágenes
- **Tipo**: `Carousel`
- **Dimensiones**: 1920 x 1080 (16:9)
- **Imágenes**: Máximo 10
- **Duración por image**: 5 segundos
- **Tamaño**: 50 MB por imagen
- **Uso**: Galería de productos/servicios

### 5. Texto + Imagen
- **Tipo**: `Static`
- **Dimensiones**: 1920 x 1080 (16:9)
- **Tamaños de fuente**: small, medium, large
- **Uso**: Información + publicidad bajo diseño

---

## 🔍 Obtener Templates

### Query SQL (en Supabase Dashboard)
```sql
-- Ver todos los templates activos
SELECT id, nombre, tipo, config 
FROM templates 
WHERE status = 'active'
ORDER BY nombre;
```

### Response esperado
```json
{
  "id": "uuid-1234-5678",
  "nombre": "Banner Estándar HD",
  "tipo": "Banner",
  "config": {
    "width": 1920,
    "height": 1080,
    "format": "16:9",
    "max_file_size": "50MB"
  }
}
```

---

## 📤 Crear Contenido con Template

### Flujo 1: Reservación + Contenido
```
1. Usuario hace reservación ✅
   POST /functions/v1/crear-reservacion
   Response: reservation_id

2. Usuario sube contenido
   POST /functions/v1/upload-contenido (por implementar)
   Body: {
     id_reservacion,
     id_template,
     archivo,
     metadata
   }
```

### Estructura de Contenido
```sql
INSERT INTO contenido (
  id_reservacion,  -- Obligatorio (validar owner)
  id_template,     -- Obligatorio (validar existe)
  url_archivo,     -- URL al archivo subido (S3/etc)
  status_moderacion -- 'pendiente', 'aprobado', 'rechazado'
) VALUES (
  'res-uuid-123',
  'tmpl-uuid-456',
  'https://storage.example.com/file.mp4',
  'pendiente'
);
```

---

## 🖨️ Validar Contenido vs Template

### Validaciones Necesarias

```javascript
// Frontend-side validation
const validateContent = (file, template) => {
  const config = template.config;
  
  // 1. Verificar tamaño
  if (file.size > config.max_file_size_bytes) {
    return { valid: false, error: "Archivo demasiado grande" };
  }
  
  // 2. Verificar tipo de archivo
  if (template.tipo === 'Video') {
    const allowed = ['video/mp4', 'video/webm'];
    if (!allowed.includes(file.type)) {
      return { valid: false, error: "Video debe ser MP4 o WebM" };
    }
  }
  
  if (template.tipo === 'Banner' || template.tipo === 'Carousel') {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      return { valid: false, error: "Imagen debe ser JPG, PNG o WebP" };
    }
  }
  
  // 3. Verificar dimensiones (si es imagen)
  if (template.tipo === 'Banner') {
    const img = new Image();
    img.onload = () => {
      if (img.naturalWidth !== config.width || img.naturalHeight !== config.height) {
        console.warn(`Imagen es ${img.naturalWidth}x${img.naturalHeight}, esperado ${config.width}x${config.height}`);
      }
    };
    img.src = URL.createObjectURL(file);
  }
  
  return { valid: true };
};
```

---

## 📋 Ejemplo Frontend: Selector de Template

```jsx
// React Component
import { useEffect, useState } from 'react';

export function TemplateSelector({ onSelectTemplate }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Obtener templates de Supabase
    supabase
      .from('templates')
      .select('id, nombre, tipo, config')
      .eq('status', 'active')
      .then(({ data }) => {
        setTemplates(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="template-selector">
      <h2>Selecciona el formato de tu contenido</h2>
      
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <div className="template-grid">
          {templates.map((template) => (
            <div 
              key={template.id}
              className="template-card"
              onClick={() => onSelectTemplate(template)}
            >
              <div className={`template-preview ${template.tipo.toLowerCase()}`}>
                {/* Mostrar preview basado en tipo */}
                <div className="dimensions">
                  {template.config.width} x {template.config.height}
                </div>
                <div className="format">
                  {template.config.format}
                </div>
              </div>
              <h3>{template.nombre}</h3>
              <p className="type">{template.tipo}</p>
              <p className="specs">
                Max: {template.config.max_file_size}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## 🔧 Edge Function: Upload Contenido (Por implementar)

```typescript
// supabase/functions/upload-contenido/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req: Request) => {
  if (req.method !== "POST") return new Response("Error", { status: 405 });

  const {
    id_reservacion,
    id_template,
    url_archivo,
    metadata
  } = await req.json();

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  // 1. Validar reservación existe y pertenece al usuario
  // 2. Validar template existe
  // 3. Validar URL (si es S3, verificar permisos)
  // 4. Insertar en contenido con status 'pendiente'
  // 5. Notificar a admin para moderación

  const { data, error } = await supabase
    .from('contenido')
    .insert({
      id_reservacion,
      id_template,
      url_archivo,
      status_moderacion: 'pendiente',
      created_at: new Date()
    })
    .select('id')
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  }

  return new Response(JSON.stringify({
    success: true,
    contenido_id: data.id,
    status: 'pending_moderation'
  }), { status: 201 });
});
```

---

## 🎯 Casos de Uso

### Caso 1: Banner Horizontal (Empresa)
```
Empresa elige: "Banner Estándar HD"
Sube: foto.jpg (1920x1080)
Se valida: Tamaño < 50MB ✅
Se crea: Contenido → Templates → Reservación
```

### Caso 2: Carrusel de Productos (Tienda)
```
Tienda elige: "Carrusel de Imágenes"
Sube: 8 imágenes JPG
Se valida: Cada una < 50MB, máximo 10 ✅
Duración: 5 segundos por imagen = 40 segundos total
```

### Caso 3: Video Promocional (Productor)
```
Productor elige: "Video 4K"
Sube: promocion.mp4 (3840x2160, 30s)
Se valida: < 1GB ✅
Se envía: A moderación
```

---

## 📞 Errores Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| "Template no encontrado" | ID inválido | Validar template.id |
| "Archivo demasiado grande" | Excede max_file_size | Comprimir archivo |
| "Dimensiones incorrectas" | No coincide config | Redimensionar imagen |
| "Formato no soportado" | Tipo de archivo inválido | Convertir a formato correcto |
| "Reservación expirada" | Pasó fecha_fin | Crear nueva reservación |

---

## 🚀 Próximo Paso

Implementar Edge Function: `upload-contenido`  
Status: ⏳ Pendiente
