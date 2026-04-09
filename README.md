# 🎬 The Good Mark - Backend

Backend de reservas y gestión de cines para The Good Mark. API REST construida con Express.js y potenciada por Supabase.

## 📋 Tabla de Contenidos

- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Ejecución del Servidor](#ejecución-del-servidor)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Endpoints de la API](#endpoints-de-la-api)
- [Troubleshooting](#troubleshooting)

---

## 📦 Requisitos Previos

Antes de comenzar, asegúrate de tener instalados los siguientes programas:

### Windows

1. **Node.js** (v16 o superior)
   - Descarga desde: https://nodejs.org/
   - Verifica la instalación: `node --version`

2. **Git**
   - Descarga desde: https://git-scm.com/
   - Verifica la instalación: `git --version`

3. **Docker Desktop** (para Supabase local)
   - Descarga desde: https://www.docker.com/products/docker-desktop
   - Instala y asegúrate de que esté ejecutándose

4. **Supabase CLI** (para gestionar la base de datos local)
   ```bash
   npm install -g supabase
   ```

---

## 🚀 Instalación

### Paso 1: Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd programatics_backend_TGM
```

### Paso 2: Instalar Dependencias

```bash
npm install
```

### Paso 3: Instalar Deno (para funciones de Supabase)

Las funciones edge de Supabase requieren Deno. Descárgalo desde:
- https://deno.land/

O usa Homebrew (si tienes instalado)/(macOS/Linux) o Scoop/Chocolatey (Windows):

```bash
# Windows con Scoop
scoop install deno

# Windows con Chocolatey
choco install deno
```

---

## ⚙️ Configuración

### Paso 1: Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```bash
cp .env.example .env
```

Si no existe `.env.example`, crea manualmente el archivo `.env` con el siguiente contenido:

# Supabase (se llenará automáticamente después de iniciar Supabase)
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=tu_anon_key_aqui
MP_ACCESS_TOKEN=TEST-verificar_mercadopago_credenciales_prueba

### Paso 2: Iniciar Supabase Localmente

Supabase proporciona una base de datos PostgreSQL local con autenticación, storage y otras funcionalidades.

```bash
supabase start
```

**Nota:** Este comando:
- Descargará e iniciará los contenedores Docker necesarios
- Creará la base de datos local
- Mostrará las credenciales de conexión

Después de ejecutarse, verás algo como:

```
API URL: http://localhost:54321
GraphQL URL: http://localhost:54321/graphql/v1
S3 Storage URL: http://localhost:54321/storage/v1/s3
DB URL: postgresql://postgres:postgres@localhost:54322/postgres
Studio URL: http://localhost:54323
Inbucket URL: http://localhost:54324
```

### Paso 3: Aplicar Migraciones de Base de Datos

Las migraciones crean la estructura de tablas y políticas de seguridad:

```bash
supabase db push
```

Esto ejecutará todos los archivos SQL en `supabase/migrations/` en orden.

### Paso 4: Actualizar `.env` con Credenciales de Supabase

Después de iniciar Supabase, actualiza tu archivo `.env`:

```bash
supabase status
```

Copia las credenciales mostradas al archivo `.env`:

```env
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=<copia-de-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<copia-de-service-role-key>
```

---

## 🎮 Ejecución del Servidor

### Desarrollo (con reinicio automático)

```bash
npm run dev
```

Esto ejecutará el servidor con `nodemon`, que reinicia automáticamente cuando hay cambios en el código.

### Producción

```bash
npm start
```

El servidor estará disponible en: **http://localhost:3000**

### Verificar que Funciona

Abre tu navegador o usa `curl`:

```bash
curl http://localhost:3000
```

Deberías recibir:

```json
{"message":"TheGoodMark API running 🚀"}
```

---

## 📁 Estructura del Proyecto

```
programatics_backend_TGM/
├── src/
│   ├── app.js                 # Configuración de Express
│   ├── server.js              # Punto de entrada del servidor
│   └── types/
│       ├── database.types.ts   # Tipos de TypeScript para DB
│       └── supabase.ts         # Cliente de Supabase
├── supabase/
│   ├── config.toml            # Configuración de Supabase 
│   ├── migrations/            # Scripts SQL de migración
│   ├── functions/             # Funciones edge (Deno + Supabase)
│   │   ├── crear-reservacion/
│   │   ├── crear-usuario/
│   │   ├── obtener-pantallas/
│   │   ├── procesar-pago/
│   │   ├── validar-cupon/
│   │   └── verificar-disponibilidad/
│   └── snippets/              # Queries SQL útiles
├── package.json               # Dependencias de Node.js
├── deno.json                  # Configuración de Deno
└── README.md                  # Este archivo
```

---

## 🔌 Endpoints de la API

### Principales

| Método | Endpoint | Descripción |
|--------|----------|-------------|


**Nota:** Consulta la colección de Postman para más detalles: `The_Good_Mark_APIs.postman_collection.json`

---

## 🛠️ Comandos Útiles

### Supabase

```bash
# Ver estado de Supabase
supabase status

# Detener Supabase
supabase stop

# Acceder a la consola PostgreSQL
supabase db shell

# Ver logs de funciones
supabase functions list

# Desplegar funciones a producción
supabase functions deploy
```

### Node.js

```bash
# Instalar nuevas dependencias
npm install <nombre-package>

# Ver dependencias instaladas
npm list

# Actualizar dependencias
npm update
```

## 🆘 Troubleshooting

### ❌ "Docker no está corriendo"

**Problema:** `Error looking for running Docker daemon`

**Solución:**
1. Abre Docker Desktop
2. Espera a que esté completamente iniciado
3. Intenta nuevamente: `supabase start`

---

### ❌ "Puerto 54321 ya está en uso"

**Problema:** `Error: listen EADDRINUSE: address already in use :::54321`

**Solución:**
```bash
# Detén Supabase
supabase stop

# O elimina contenedores de Docker
docker-compose down
```

---

### ❌ "npm: command not found"

**Problema:** Node.js no está instalado correctamente

**Solución:**
1. Desinstala Node.js completamente
2. Instala nuevamente desde https://nodejs.org/
3. Reinicia tu terminal

---

### ❌ "Las migraciones no se aplican"

**Problema:** `supabase db push` devuelve errores

**Solución:**
1. Asegúrate de que Supabase está corriendo: `supabase status`
2. Verifica que no hay cambios locales conflictivos
3. Intenta con: `supabase db push --force`

---

### ❌ Variables de entorno no se cargan

**Problema:** El servidor no puede conectar a Supabase

**Solución:**
1. Verifica que `.env` existe en la raíz del proyecto
2. Reinicia el servidor: `npm run dev`
3. Revisa la consola por mensajes de error

---

## 📚 Recursos Útiles

- [Documentación de Express.js](https://expressjs.com/)
- [Documentación de Supabase](https://supabase.com/docs)
- [Documentación de Supabase CLI](https://supabase.com/docs/guides/cli)
- [Documentación de Deno](https://deno.land/manual)
- [Documentación de Mercado Pago](https://developer.mercadopago.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

## 👥 Contribución

Para contribuir al proyecto:

1. Crea una rama: `git checkout -b feature/nombre-feature`
2. Realiza tus cambios
3. Commit: `git commit -m 'Descripción de los cambios'`
4. Push: `git push origin feature/nombre-feature`
5. Abre un Pull Request

**Última actualización:** Abril 2026  
**Versión:** 1.0.0

¡Gracias por usar The Good Mark! 🎬
