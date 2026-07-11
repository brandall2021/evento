# Evento — Plataforma SaaS de Gestión de Eventos

Plataforma completa para la administración integral de eventos presenciales, virtuales e híbridos. Permite crear eventos, vender entradas, administrar asistentes, generar acreditaciones, controlar accesos, networking, streaming, certificados y más.

En **migración activa** de Express/Sequelize a NestJS/TypeORM para evolucionar hacia un SaaS multi-tenant.

---

## Arquitectura

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │────▶│  Express API  │────▶│  PostgreSQL   │
│  React+Vite  │     │  :3001        │     │  :5432        │
│  :5173       │     │  (legacy)     │     └──────────────┘
└─────────────┘     │               │     ┌──────────────┐
                    │  /api/v2/*    │────▶│    Redis      │
                    │  proxy ───────┤     │  :6379        │
                    └──────┬───────┘     └──────────────┘
                           │             ┌──────────────┐
                           ▼             │    MinIO      │
                    ┌──────────────┐     │  :9000/:9001  │
                    │  NestJS API   │────▶│  (S3 compat)  │
                    │  :3002        │     └──────────────┘
                    │  (nuevo)      │
                    └──────────────┘
```

**Dos backends coexisten:**
- **Express** (`:3001`) — Backend original, sirve frontend compilado + API legacy
- **NestJS** (`:3002`) — Backend nuevo, migración incremental módulo por módulo

El proxy en Express redirige `/api/v2/*` a NestJS, permitiendo migración sin downtime.

---

## Stack

### Frontend

| Capa | Tecnología |
|------|-----------|
| Framework | React 19 |
| Bundler | Vite 8 |
| Routing | React Router 7 |
| Editor enriquecido | Tiptap (React 19 compatible) |
| Estilos | CSS variables + dark/light mode |
| Despliegue | Docker multi-stage (~40MB) |

### Backend Express (legacy) — `:3001`

| Capa | Tecnología |
|------|-----------|
| Runtime | Node.js 20+ |
| Framework | Express 4 |
| ORM | Sequelize 6 |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| PDF | PDFKit + QRCode |
| Upload | Multer |
| Validación | express-validator |
| Seguridad | express-rate-limit, CORS |

### Backend NestJS (nuevo) — `:3002`

| Capa | Tecnología |
|------|-----------|
| Runtime | Node.js 20+ |
| Framework | NestJS 11 |
| ORM | TypeORM 0.3 |
| Auth | JWT + Passport |
| Cache | ioredis (Redis) |
| Storage | MinIO (S3-compatible) |
| Validación | class-validator + class-transformer |
| Language | TypeScript 5.8 |

### Infraestructura

| Servicio | Tecnología | Puerto |
|----------|-----------|--------|
| Base de datos | PostgreSQL 16 | 5432 |
| Cache | Redis 7 | 6379 |
| Archivos | MinIO | 9000 (API) / 9001 (console) |

---

## Estructura del proyecto

```
evento-web/
├── docker-compose.yml              # PostgreSQL + Redis + MinIO
├── Dockerfile                      # Multi-stage build (Express + frontend)
│
├── backend/                        # Express legacy ( :3001 )
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js         # Conexión PostgreSQL (Sequelize)
│   │   ├── models/
│   │   │   ├── index.js            # Asociaciones entre modelos
│   │   │   ├── User.js             # Usuarios (admin/docente/estudiante)
│   │   │   ├── Curso.js            # Cursos con soft delete
│   │   │   ├── Inscripcion.js      # Solicitudes, estados, cupos
│   │   │   ├── Pago.js             # Pagos por cuota
│   │   │   ├── Asistencia.js       # Control de asistencia
│   │   │   ├── Certificado.js      # PDF + QR + validación
│   │   │   └── PlantillaCertificado.js # Plantilla certificado (JSONB)
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── cursoController.js
│   │   │   ├── inscripcionController.js
│   │   │   ├── pagoController.js
│   │   │   ├── certificadoController.js
│   │   │   ├── plantillaController.js
│   │   │   └── usuarioController.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── cursos.js
│   │   │   ├── inscripciones.js
│   │   │   ├── pagos.js
│   │   │   ├── certificados.js
│   │   │   ├── plantillas.js
│   │   │   └── usuarios.js
│   │   ├── middleware/
│   │   │   ├── auth.js             # JWT + roles + query token fallback
│   │   │   ├── validate.js         # express-validator schemas
│   │   │   └── errorHandler.js
│   │   ├── seeders/
│   │   │   └── seed.js             # Datos de prueba
│   │   └── index.js                # Entry point + proxy a NestJS
│   ├── uploads/                    # QR, firmas, logos
│   └── .env
│
├── backend-next/                   # NestJS nuevo ( :3002 )
│   ├── src/
│   │   ├── main.ts                 # Entry point
│   │   ├── app.module.ts           # Root module
│   │   ├── auth/
│   │   │   ├── auth.module.ts      # JWT + Passport config
│   │   │   ├── auth.controller.ts  # register, login, me, profile
│   │   │   ├── auth.service.ts     # Lógica de auth
│   │   │   └── jwt.strategy.ts     # JWT strategy
│   │   ├── users/
│   │   │   ├── user.entity.ts      # TypeORM entity (12 roles)
│   │   │   ├── users.module.ts
│   │   │   ├── users.service.ts    # CRUD + stats + toggle
│   │   │   └── users.controller.ts # Endpoints admin
│   │   ├── common/
│   │   │   ├── guards/
│   │   │   │   ├── jwt-auth.guard.ts
│   │   │   │   └── roles.guard.ts
│   │   │   └── decorators/
│   │   │       └── roles.decorator.ts
│   │   └── config/
│   │       └── config.module.ts
│   ├── .env.example
│   ├── tsconfig.json
│   └── nest-cli.json
│
├── src/                            # Frontend React
│   ├── components/
│   │   ├── Layout.jsx              # Header + nav responsive
│   │   ├── ProtectedRoute.jsx      # Guard auth + roles
│   │   ├── ErrorBoundary.jsx
│   │   └── RichTextEditor.jsx      # Tiptap (React 19)
│   ├── context/
│   │   ├── AuthContext.jsx         # Auth global
│   │   ├── ThemeContext.jsx        # Dark/light mode
│   │   └── NotificationContext.jsx # Toasts
│   ├── pages/
│   │   ├── Landing.jsx             # Landing page
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── CursosList.jsx          # Grid + búsqueda + filtros
│   │   ├── CursoDetail.jsx         # Detalle + inscripción
│   │   ├── MisInscripciones.jsx
│   │   ├── Dashboard.jsx           # Admin stats
│   │   ├── AdminCursos.jsx         # CRUD cursos + imágenes
│   │   ├── AdminInscripciones.jsx
│   │   ├── AdminCertificados.jsx
│   │   ├── AdminPlantillas.jsx     # Editor visual plantillas
│   │   └── AdminUsuarios.jsx       # CRUD usuarios
│   ├── services/
│   │   └── api.js                  # Cliente HTTP con JWT
│   ├── App.jsx                     # Router lazy loading
│   ├── App.css
│   ├── index.css                   # CSS variables + dark mode
│   └── main.jsx
│
├── index.html
├── vite.config.js
└── package.json
```

---

## Modelo de datos

```
User ──1:N──> Inscripcion <──N:1── Curso
  │                │
  │                ├──1:N──> Pago
  │                ├──1:N──> Asistencia
  │                └──1:1──> Certificado
  │
  └──1:N──> Curso (como docente)

PlantillaCertificado ──1:N──> Certificado
  (JSONB config: colores, fuentes, posiciones, tamaños)
  (firma_url, logo_url, is_default)
```

### Express (3 roles)

| Rol | Permisos |
|-----|----------|
| **Admin** | CRUD completo, inscripciones, certificados, pagos, plantillas, usuarios |
| **Docente** | Crear/editar cursos propios, ver inscripciones |
| **Estudiante** | Ver cursos, inscribirse, descargar certificados |

### NestJS (12 roles — SaaS)

| Rol | Descripción |
|-----|------------|
| `admin` | Administrador global |
| `organizador` | Crea y gestiona eventos |
| `coordinador` | Coordina actividades del evento |
| `ponente` | Speaker, dicta sesiones |
| `expositor` | Exhibidor con stand propio |
| `patrocinador` | Sponsor con beneficios |
| `asistente` | Participante general |
| `invitado` | Guest list |
| `checkin` | Personal de acreditación |
| `moderador` | Modera sesiones y chat |
| `docente` | Compatibilidad con express |
| `estudiante` | Compatibilidad con express |

---

## API Endpoints

### Express — `/api/*` (legacy, activo)

#### Auth
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/auth/register` | No | Registro |
| POST | `/api/auth/login` | No | Login → JWT |
| GET | `/api/auth/me` | Sí | Perfil |
| PUT | `/api/auth/profile` | Sí | Actualizar nombre/teléfono |

#### Cursos
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/cursos` | Sí | Listar (paginación `?page=&pageSize=`) |
| GET | `/api/cursos/:id` | Sí | Detalle |
| POST | `/api/cursos` | Admin/Docente | Crear |
| PUT | `/api/cursos/:id` | Admin/Docente | Actualizar |
| DELETE | `/api/cursos/:id` | Admin | Soft delete |
| PUT | `/api/cursos/:id/estado` | Admin | Cambiar estado rápido |

#### Inscripciones
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/inscripciones` | Estudiante | Solicitar |
| GET | `/api/inscripciones/mis` | Estudiante | Mis inscripciones |
| GET | `/api/inscripciones` | Admin/Docente | Listar todas |
| PUT | `/api/inscripciones/:id/aprobar` | Admin | Aprobar |
| PUT | `/api/inscripciones/:id/rechazar` | Admin | Rechazar con motivo |

#### Pagos
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/pagos` | Sí | Crear |
| GET | `/api/pagos` | Sí | Listar |
| PUT | `/api/pagos/:id/confirmar` | Admin | Confirmar |

#### Certificados
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/certificados` | Sí | Listar |
| POST | `/api/certificados/emitir` | Admin | Emitir (verifica 80% asistencia) |
| GET | `/api/certificados/validar/:codigo` | No | Validación pública |
| GET | `/api/certificados/:id/descargar` | Sí | PDF con plantilla activa |

#### Plantillas de certificado
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/plantillas` | Admin | Listar todas |
| GET | `/api/plantillas/default` | Admin | Plantilla por defecto |
| GET | `/api/plantillas/:id` | Admin | Detalle |
| POST | `/api/plantillas` | Admin | Crear (config JSON + firma + logo) |
| PUT | `/api/plantillas/:id` | Admin | Actualizar |
| DELETE | `/api/plantillas/:id` | Admin | Eliminar |

#### Usuarios (admin)
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/usuarios` | Admin | Listar (filtros: `?rol=&activo=&page=`) |
| GET | `/api/usuarios/estadisticas` | Admin | Conteos por rol/estado |
| GET | `/api/usuarios/:id` | Admin | Detalle |
| POST | `/api/usuarios` | Admin | Crear |
| PUT | `/api/usuarios/:id` | Admin | Actualizar |
| DELETE | `/api/usuarios/:id` | Admin | Hard delete |
| PUT | `/api/usuarios/:id/toggle` | Admin | Activar/desactivar |

#### Health
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/health` | No | `{ "ok": true }` |

### NestJS — `/api/v2/*` (nuevo)

Accesible via proxy desde Express. Mismos endpoints que Express, migrados a NestJS + TypeScript.

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/v2/auth/register` | No | Registro |
| POST | `/api/v2/auth/login` | No | Login → JWT |
| GET | `/api/v2/auth/me` | JWT | Perfil |
| PUT | `/api/v2/auth/profile` | JWT | Actualizar perfil |
| GET | `/api/v2/usuarios` | Admin | Listar |
| GET | `/api/v2/usuarios/estadisticas` | Admin | Stats |
| GET | `/api/v2/usuarios/:id` | Admin | Detalle |
| POST | `/api/v2/usuarios` | Admin | Crear |
| PUT | `/api/v2/usuarios/:id` | Admin | Actualizar |
| DELETE | `/api/v2/usuarios/:id` | Admin | Eliminar |
| PUT | `/api/v2/usuarios/:id/toggle` | Admin | Toggle activo |

---

## Funcionalidades

### Core
- **Roles:** 12 roles jerárquicos (NestJS) / 3 roles (Express)
- **Auth:** JWT con Bearer token, bcrypt hashing, protección de contraseña
- **Soft delete:** Todos los modelos preservan registros eliminados
- **Paginación:** `?page=1&pageSize=20` en todos los endpoints de listado
- **Rate limiting:** 200 req/15min global, 20 req/15min en auth
- **Validación:** express-validator (Express) + class-validator (NestJS)
- **CORS:** Configurable por orígenes

### Eventos / Cursos
- CRUD completo con modalidades (virtual/presencial/híbrido)
- Estados: borrador → publicado → finalizado
- Finalización rápida desde admin
- Subida de imágenes (jpg/png/webp, 5MB máx)
- Editor enriquecido Tiptap para descripción y requisitos
- Búsqueda y filtros por categoría

### Inscripciones
- Flujo pendiente → aceptado/rechazado
- Verificación de cupos y aceptación automática
- Motivo de rechazo

### Pagos
- Pagos por cuota
- Confirmación manual con desbloqueo automático

### Certificados
- PDF generado con código único + QR de validación
- Validación pública sin autenticación
- Plantillas personalizables:
  - Colores (fondo, borde, título, código, nombre, texto)
  - Fuentes (Helvetica, Times, Courier)
  - Posiciones configurables (logo, título, código, nombre, curso, firma, QR)
  - Tamaños (logo, firma, QR)
  - Firma electrónica upload
  - Logo institucional upload
  - QR en 4 esquinas configurables
  - Plantilla por defecto

### Plantillas
- Editor visual con preview en tiempo real
- Posiciones de todos los elementos configurables
- Upload de firma y logo
- Gestión de plantilla predeterminada

### Usuarios
- CRUD completo con activar/desactivar
- Estadísticas por rol y estado
- Filtros por rol y estado
- Protección: no se puede desactivar el último admin

### UI/UX
- Modo oscuro/claro con persistencia en localStorage
- Lazy loading de rutas
- Skeleton loaders
- Notificaciones toast
- Error boundary
- Responsive (mobile/tablet/desktop)
- Landing page con hero, features, cursos destacados, CTA

---

## Infraestructura Docker

### docker-compose.yml

```yaml
services:
  postgres:   # PostgreSQL 16, puerto 5432
  redis:      # Redis 7, puerto 6379
  minio:      # MinIO S3, puerto 9000 (API) / 9001 (console)
```

### Dockerfile (Express + Frontend)

Multi-stage build:
1. **Builder:** Instala deps, compila frontend con Vite
2. **Production:** Solo backend + dist/, ~40MB

---

## Instalación y desarrollo local

### Requisitos

- Node.js 20+
- npm
- Docker + Docker Compose (opcional pero recomendado)

### Paso 1 — Infraestructura

```bash
# Levantar PostgreSQL, Redis y MinIO
docker compose up -d

# Verificar
docker compose ps
```

### Paso 2 — Backend Express

```bash
cd backend

# Instalar dependencias
npm install

# Configurar .env (ver sección variables)

# Sembrar datos de prueba
npm run seed

# Iniciar
npm run dev    # → http://localhost:3001
```

### Paso 3 — Backend NestJS

```bash
cd backend-next

# Instalar dependencias
npm install

# Configurar .env
cp .env.example .env

# Iniciar en desarrollo
npm run start:dev    # → http://localhost:3002
```

### Paso 4 — Frontend

```bash
# En la raíz del proyecto
npm install
npm run dev    # → http://localhost:5173
```

### Variables de entorno

#### Backend Express (`backend/.env`)

```env
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=evento_web
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=evento-web-secret-key-2026
JWT_EXPIRES_IN=7d
API_URL=http://localhost:3001
CORS_ORIGIN=http://localhost:5173,http://localhost:3001
NESTJS_URL=http://localhost:3002
```

#### Backend NestJS (`backend-next/.env`)

```env
PORT=3002
DB_HOST=localhost
DB_PORT=5432
DB_NAME=evento_web
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=evento-web-secret-key-2026
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173,http://localhost:3001
REDIS_HOST=localhost
REDIS_PORT=6379
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
```

#### Frontend (solo desarrollo)

```env
VITE_API_URL=http://localhost:3001/api
```

> En producción el frontend se sirve desde Express, usa `/api` por defecto.

### Usuarios de prueba (seed)

| Rol | Email | Contraseña |
|-----|-------|-----------|
| Admin | admin@evento.com | admin123 |
| Docente | carlos@evento.com | docente123 |
| Docente | maria@evento.com | docente123 |
| Estudiante | juan@test.com | 123456 |
| Estudiante | ana@test.com | 123456 |

---

## Despliegue con Docker

```bash
# Build
docker build -t evento-web:latest .

# Run
docker run -d \
  --name evento-web \
  -p 3001:3001 \
  -e DB_HOST=postgres \
  -e DB_PORT=5432 \
  -e DB_NAME=evento_web \
  -e DB_USER=postgres \
  -e DB_PASSWORD=secreto \
  -e JWT_SECRET=clave-segura-cambiame \
  -e JWT_EXPIRES_IN=7d \
  -e API_URL=https://tudominio.com \
  -e CORS_ORIGIN=https://tudominio.com \
  evento-web:latest

# Seed dentro del contenedor
docker exec evento-web npm run seed
```

---

## Despliegue con Dokploy

### Requisitos previos

- Servidor VPS con Ubuntu 22.04+ y Docker instalado
- Dominio apuntando al servidor (ej: `evento.tudominio.com`)
- Dokploy instalado ([docs](https://dokploy.com/docs/install))
- Repo en GitHub: `https://github.com/brandall2021/evento`

### Paso 1 — Instalar Dokploy en el servidor

```bash
# SSH al servidor
ssh root@tu-servidor

# Instalar Dokploy
curl -fsSL https://dokploy.com/install.sh | sh
```

Acceder al panel en `https://tu-servidor:3000` (o dominio configurado).

### Paso 2 — Crear proyecto

1. En el panel de Dokploy, ir a **Proyectos** → **Nuevo Proyecto**
2. Seleccionar tipo: **Docker Deployment**
3. Nombre: `evento-web`
4. Hacer clic en **Crear**

### Paso 3 — Conectar repositorio de GitHub

1. Dentro del proyecto, ir a la pestaña **Configuración**
2. En **Repositorio**, colocar:
   - **Repository URL:** `https://github.com/brandall2021/evento`
   - **Branch:** `master`
   - **Build Method:** `Dockerfile`
3. Si el repo es privado, conectar con **GitHub App** o usar un **Personal Access Token**
4. Hacer clic en **Guardar**

### Paso 4 — Configurar el dominio

1. Ir a la pestaña **Dominios** dentro del proyecto
2. Agregar el dominio personalizado:
   - **Service Name:** `evento-web` (seleccionar el servicio)
   - **Host:** `evento.tudominio.com`
   - **HTTPS:** Activar (Let's Encrypt automático)
3. Copiar el **CNAME** o **A record** que Dokploy muestra
4. En tu proveedor DNS, configurar:
   ```
   Tipo: CNAME (o A)
   Nombre: evento
   Valor: tu-servidor.tudominio.com (o IP del servidor)
   TTL: 300
   ```

### Paso 5 — Agregar servicio PostgreSQL

1. En el panel principal de Dokploy, ir a **Servicios** → **Nuevo servicio**
2. Seleccionar **PostgreSQL**
3. Configurar:
   - **Service Name:** `evento-db`
   - **Database Name:** `evento_web`
   - **Database User:** `postgres`
   - **Password:** *(generar una segura con `openssl rand -hex 16`)*
4. Hacer clic en **Crear**
5. **Importante:** Anotar los datos de conexión generados:
   - Host interno: `evento-db` (nombre del servicio en Dokploy)
   - Puerto: `5432`
   - Usuario: `postgres`
   - Contraseña: la que generaste
   - Base de datos: `evento_web`
6. Vincular el servicio de BD al proyecto:
   - Dentro del proyecto → **Servicios Vinculados** → **Vincular PostgreSQL**
   - Seleccionar `evento-db`

### Paso 6 — Configurar variables de entorno

1. Dentro del proyecto, ir a la pestaña **Variables**
2. Agregar cada variable una por una:

| # | Variable | Valor | Descripción |
|---|----------|-------|-------------|
| 1 | `PORT` | `3001` | Puerto del contenedor |
| 2 | `DB_HOST` | `evento-db` | Nombre del servicio PostgreSQL en Dokploy |
| 3 | `DB_PORT` | `5432` | Puerto de PostgreSQL |
| 4 | `DB_NAME` | `evento_web` | Nombre de la base de datos |
| 5 | `DB_USER` | `postgres` | Usuario de PostgreSQL |
| 6 | `DB_PASSWORD` | *(tu contraseña segura)* | Contraseña de PostgreSQL |
| 7 | `JWT_SECRET` | *(generar con `openssl rand -hex 32`)* | Clave para firmar tokens JWT |
| 8 | `JWT_EXPIRES_IN` | `7d` | Duración de los tokens |
| 9 | `API_URL` | `https://evento.tudominio.com` | URL pública del deploy |
| 10 | `CORS_ORIGIN` | `https://evento.tudominio.com` | Orígenes permitidos (CORS) |
| 11 | `NESTJS_URL` | `http://evento-nestjs:3002` | URL interna de NestJS (si está desplegado) |

> **Tip para generar JWT_SECRET:**
> ```bash
> openssl rand -hex 32
> # Resultado: 9d6bdf4d88d5d0e6e81e4a0d2c31e3d3f7b2fd95b9b31f6d0a17e5b4e0c83a6ef...
> ```

### Paso 7 — Configurar puerto y health check

1. En la pestaña **Configuración** del proyecto:
   - **Container Port:** `3001`
2. En **Health Check** (si está disponible):
   - **Path:** `/api/health`
   - **Expected Response:** `{ "ok": true }`
   - **Interval:** 30 segundos

### Paso 8 — Configurar volumen para uploads

Los archivos (QR, firmas, logos) se guardan en `backend/uploads/`. Si el contenedor se reinicia, estos archivos se pierden.

1. En la pestaña **Volumes** del proyecto
2. Agregar volumen:
   - **Mount Path:** `/app/backend/uploads`
   - **Type:** `Volume` (o `Bind` si querés una ruta específica en el servidor)

### Paso 9 — Desplegar

1. Ir a la pestaña **Deployments**
2. Hacer clic en **Deploy** (o **Deploy Latest**)
3. Esperar el build (~2-5 minutos)
4. Verificar los logs en **Logs** → Buscar `Server running on http://localhost:3001`

### Paso 10 — Seed de datos iniciales

```bash
# Desde Dokploy: ir a Terminal (dentro del contenedor)
cd /app/backend && npm run seed

# O desde SSH en el servidor
docker exec -it $(docker ps --filter "name=evento-web" -q) sh
cd /app/backend && npm run seed
```

### Paso 11 — Verificar el deploy

```bash
# Health check
curl https://evento.tudominio.com/api/health
# Respuesta: {"ok":true}

# Login
curl -X POST https://evento.tudominio.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@evento.com","password":"admin123"}'
# Respuesta: {"token":"...","user":{...}}
```

### Troubleshooting Dokploy

| Problema | Solución |
|----------|----------|
| Build falla con `npm ci` | Verificar que el Dockerfile usa `--legacy-peer-deps` |
| `ECONNREFUSED` a PostgreSQL | Verificar que `DB_HOST` es el nombre del servicio en Dokploy, no `localhost` |
| `ECONNREFUSED` a Redis/MinIO | Estos servicios aún no están integrados en producción |
| Frontend muestra 404 | Verificar que el build de Vite completó sin errores |
| CORS error | Agregar el dominio exacto a `CORS_ORIGIN` (con `https://`) |
| Token inválido | Verificar que `JWT_SECRET` es el mismo en todos los reinicios |
| Archivos se pierden | Configurar volumen persistente para `/app/backend/uploads` |
| Build muy lento | Verificar que el server tiene suficiente RAM (2GB mínimo recomendado) |

### Auto-deploy en Dokploy

Para que cada push a `master` despliegue automáticamente:

1. Ir a **Configuración** del proyecto
2. Activar **Auto Deploy**
3. Configurar el **Webhook** en GitHub:
   - En GitHub → Settings → Webhooks → Add webhook
   - Payload URL: `https://tu-servidor-dokploy.com/api/deploy-webhook`
   - Content type: `application/json`
   - Secret: *(el token de Dokploy)*
   - Events: `Just the push event`

### Notas de producción

- Dockerfile multi-stage: ~40MB en producción
- Frontend se sirve desde Express con headers `no-cache` en `index.html`, `maxAge: 1y` en assets
- SSL automático via Let's Encrypt en Dokploy
- React 19 requiere `--legacy-peer-deps` para Tiptap
- **NestJS:** Por ahora corre en desarrollo local. Para producción, crear un segundo servicio Docker en Dokploy y configurar `NESTJS_URL`

---

## Roadmap de migración

### Fase 0 — Infraestructura ✅
- [x] Docker Compose (PostgreSQL + Redis + MinIO)
- [x] NestJS scaffold con TypeScript
- [x] Módulo Auth migrado (register/login/me/profile)
- [x] Módulo Users migrado (CRUD + 12 roles + stats)
- [x] Proxy Express → NestJS

### Fase 1 — Migrar módulos core
- [ ] Eventos (CRUD + modalidad + configuración)
- [ ] Inscripciones (registro + estados + cupos)
- [ ] Pagos (Stripe/MercadoPago + cupones)
- [ ] Certificados (PDF + QR + plantillas)

### Fase 2 — Asistentes & Agenda
- [ ] Perfil de asistente (empresa, cargo, foto, intereses, redes)
- [ ] Agenda jerárquica (día/bloque/sala/sesión)
- [ ] Check-in QR (escaneo, control de salas, offline)
- [ ] Credenciales PDF/Wallet

### Fase 3 — Ponentes, Expositores, Patrocinadores
- [ ] Perfiles de ponente con CV, sesiones, calificación
- [ ] Stands de expositor con productos, catálogos, chat
- [ ] Patrocinadores con categorías (Platino/Oro/Plata/Bronce)

### Fase 4 — Networking & Streaming
- [ ] Chat privado/grupal (Socket.IO)
- [ ] Match por intereses
- [ ] Videollamadas
- [ ] Streaming integrado (Zoom/Teams/YouTube/RTMP)

### Fase 5 — Interacción & Gamificación
- [ ] Encuestas y votaciones
- [ ] Preguntas al ponente
- [ ] Trivia, ranking, puntos, badges

### Fase 6 — CMS & Noticias
- [ ] Editor visual
- [ ] Blog, galerías, videos, FAQ
- [ ] Push/Email/SMS/WhatsApp

### Fase 7 — Móvil & API
- [ ] PWA (service worker, offline)
- [ ] App Android/iOS
- [ ] API REST pública con OAuth2 + OpenAPI
- [ ] Webhooks

### Fase 8 — Analytics & Admin
- [ ] Estadísticas avanzadas (embudo, exportación)
- [ ] Logs de auditoría
- [ ] Multi-tenant (dominio por evento)

---

## Repo

```
https://github.com/brandall2021/evento.git
```

## Licencia

MIT
