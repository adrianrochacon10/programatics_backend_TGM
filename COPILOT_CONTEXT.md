# The Good Mark — Contexto del proyecto

## ¿Qué es?

Plataforma de reservación de pantallas publicitarias digitales en Durango, México.
Los clientes eligen una pantalla, seleccionan fechas disponibles, pagan y suben su contenido.

## Stack

- Backend: Supabase (DB + Auth + Edge Functions en Deno/TypeScript)
- Frontend: (por definir, probablemente React o Next.js)
- Pagos: (por integrar, posiblemente Stripe o MercadoPago)

## Base de datos (Supabase local)

Tablas principales:

- `pantallas` — Pantallas publicitarias disponibles
- `planes` — Planes de días/spots disponibles
- `reservaciones` — Reservaciones de clientes (status: pendiente, pagado, activo, expirado)
- `disponibilidad_dia` — Control de cupo por día por pantalla (máx 6 spots/día)
- `contenido` — Archivos de contenido subidos por clientes
- `usuarios` — Usuarios del sistema (rol: admin / normal)
- `ventas` — Registro de ventas completadas

## Reglas de negocio clave

1. Cada pantalla puede tener máx 6 reservaciones activas por día
2. Una reservación bloquea N días consecutivos según el plan
3. El contenido debe pasar moderación antes de mostrarse
4. Solo admins pueden crear/editar pantallas y planes

## Estructura de carpetas

thegoodmark-backend/
├── supabase/
│ ├── migrations/ ← SQL de la DB
│ └── functions/ ← Edge Functions (Deno)
│ └── crear-reservacion/
└── src/
└── types/
└── database.types.ts ← Generado con supabase gen types

## Próximas tareas

1. Edge Function: crear-reservacion (validar cupo + crear reservación + disponibilidad)
2. Edge Function: verificar-disponibilidad (consulta pública de días libres)
3. Políticas RLS básicas
4. Seed con datos de prueba (pantallas y planes)
