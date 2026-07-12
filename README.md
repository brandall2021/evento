# Evento — Plataforma SaaS de Gestión de Eventos

Plataforma completa para la administración integral de eventos presenciales, virtuales e híbridos. Permite crear eventos, vender entradas, administrar asistentes, generar acreditaciones, controlar accesos, networking, streaming, certificados y más.

En **migración activa** de Express/Sequelize a NestJS/TypeORM para evolucionar hacia un SaaS multi-tenant.

**Repo:** `https://github.com/brandall2021/evento.git`

---

## Tabla de contenidos

- [Arquitectura](#arquitectura)
- [Stack tecnológico](#stack-tecnológico)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Modelo de datos](#modelo-de-datos)
- [Roles](#roles)
- [API Endpoints](#api-endpoints)
- [Funcionalidades](#funcionalidades)
- [Instalación local](#instalación-local)
- [Variables de entorno](#variables-de-entorno)
- [Despliegue con Docker](#despliegue-con-docker)
- [Despliegue con Dokploy (paso a paso)](#despliegue-con-dokploy)
- [Troubleshooting](#troubleshooting)
- [Roadmap de migración](#roadmap-de-migración)

---

## Arquitectura

```
                                    INTERNET
                                       │
                                       ▼
                              ┌─────────────────┐
                              │   Nginx / SSL    │
                              │  (Dokploy proxy) │
                              └────────┬────────┘
                                       │
                              ┌────────▼────────┐
                              │  Express :3001   │◀──── Frontend React (dist/)
                              │  API legacy      │      servido estáticamente
                              │                  │
                              │  /api/*  ────────┼──── Módulos legacy
                              │  /api/v2/* ──────┼──┐  Proxy a NestJS
                              │                  │  │
                              └──────────────────┘  │
                                       │            │
                    ┌──────────────────┐│   ┌───────▼────────┐
                    │   PostgreSQL     ││   │  NestJS :3002   │
                    │   :5432          │◀┘   │  API nueva      │
                    │                  │     │  TypeScript      │
                    └──────────────────┘     │  TypeORM         │
                                             └───────┬────────┘
                                             ┌───────┼────────┐
                                        ┌────▼───┐ ┌─▼──────┐ │
                                        │ Redis  │ │ MinIO  │ │
                                        │ :6379  │ │ :9000  │ │
                                        │ Cache  │ │ S3     │ │
                                        └────────┘ └────────┘ │
```

### ¿Por qué dos backends?

| Backend | Rol | Puerto | Estado |
|---------|-----|--------|--------|
| **Express** | Backend original, sirve frontend + API legacy | `:3001` | Producción activa |
| **NestJS** | Backend nuevo, migración incremental | `:3002` | Desarrollo |

El proxy en Express (`/api/v2/*`) redirige peticiones a NestJS. Esto permite:
- Migrar módulo por módulo sin downtime
- Mantener la app funcionando durante la migración
- Testing comparativo entre ambos backends

---

## Stack tecnológico

### Frontend

| Capa | Tecnología | Versión | Descripción |
|------|-----------|---------|-------------|
| Framework | React | 19 | UI library con hooks |
| Bundler | Vite | 8 | Build tool ultrarrápido |
| Routing | React Router | 7 | Client-side routing con lazy loading |
| Editor WYSIWYG | Tiptap | 3.27 | Editor rich-text compatible con React 19 |
| Estilos | CSS custom properties | — | Variables CSS + dark/light mode |
| HTTP Client | Fetch API | nativo | Con interceptor JWT manual |
| Despliegue | Docker | multi-stage | ~40MB en producción |

### Backend Express (legacy) — Puerto `:3001`

| Capa | Tecnología | Versión | Descripción |
|------|-----------|---------|-------------|
| Runtime | Node.js | 20+ | JavaScript runtime |
| Framework | Express | 4 | HTTP framework minimalista |
| ORM | Sequelize | 6 | ORM para PostgreSQL |
| Auth | JWT | jsonwebtoken | Tokens Bearer + bcryptjs |
| PDF | PDFKit | — | Generación de certificados |
| QR | qrcode | — | Códigos de validación de certificados |
| Upload | Multer | — | Subida de imágenes (5MB máx) |
| Validación | express-validator | — | Schemas de validación |
| Rate Limit | express-rate-limit | — | 200 req/15min global, 20 en auth |
| CORS | cors | — | Configurable por orígenes |

### Backend NestJS (nuevo) — Puerto `:3002`

| Capa | Tecnología | Versión | Descripción |
|------|-----------|---------|-------------|
| Runtime | Node.js | 20+ | JavaScript runtime |
| Framework | NestJS | 11 | Framework modular con DI |
| ORM | TypeORM | 0.3 | ORM con decoradores TypeScript |
| Auth | Passport + JWT | — | Strategy pattern para auth |
| Cache | ioredis | 5.6 | Cliente Redis para caching |
| Storage | MinIO | 8.0 | S3-compatible object storage |
| Validación | class-validator | 0.15 | Decoradores de validación |
| Transform | class-transformer | 0.5 | Transformación de DTOs |
| Language | TypeScript | 5.8 | Tipado estático |

### Infraestructura (Docker Compose)

| Servicio | Imagen | Puerto | Descripción |
|----------|--------|--------|-------------|
| PostgreSQL | `postgres:16-alpine` | `5432` | Base de datos principal |
| Redis | `redis:7-alpine` | `6379` | Cache + sesiones + colas |
| MinIO | `minio/minio` | `9000` (API) / `9001` (console) | Almacenamiento de archivos S3 |

---

## Estructura del proyecto

```
evento-web/
├── docker-compose.yml                  # Infra: PostgreSQL + Redis + MinIO
├── Dockerfile                          # Multi-stage build (Express + frontend)
├── .dockerignore
├── .gitignore
├── .oxlintrc.json
├── index.html                          # Entry HTML (Vite)
├── vite.config.js                      # Configuración de Vite
├── package.json                        # Dependencias frontend
│
├── backend/                            # ═══ EXPRESS LEGACY ( :3001 ) ═══
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js             # Conexión PostgreSQL (Sequelize)
│   │   ├── models/
│   │   │   ├── index.js                # Asociaciones entre modelos
│   │   │   ├── User.js                 # Usuarios (3 roles)
│   │   │   ├── Curso.js                # Cursos con soft delete
│   │   │   ├── Inscripcion.js          # Solicitudes, estados, cupos
│   │   │   ├── Pago.js                 # Pagos por cuota
│   │   │   ├── Asistencia.js           # Control de asistencia
│   │   │   ├── Certificado.js          # PDF + QR + validación
│   │   │   └── PlantillaCertificado.js # Plantilla certificado (JSONB)
│   │   ├── controllers/
│   │   │   ├── authController.js       # Registro, login, perfil
│   │   │   ├── cursoController.js      # CRUD con paginación
│   │   │   ├── inscripcionController.js# Solicitud, aprobar/rechazar
│   │   │   ├── pagoController.js       # Crear, confirmar (auto-unlock)
│   │   │   ├── certificadoController.js# Emitir, PDF, validar
│   │   │   ├── plantillaController.js  # CRUD plantillas + archivos
│   │   │   └── usuarioController.js    # CRUD usuarios + stats
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── cursos.js               # Multer para imágenes
│   │   │   ├── inscripciones.js
│   │   │   ├── pagos.js
│   │   │   ├── certificados.js         # /validar/:codigo ANTES de /:id
│   │   │   ├── plantillas.js           # Multer para firma/logo
│   │   │   └── usuarios.js             # Solo admin
│   │   ├── middleware/
│   │   │   ├── auth.js                 # JWT + roles + query token
│   │   │   ├── validate.js             # express-validator schemas
│   │   │   └── errorHandler.js         # Error handler centralizado
│   │   ├── seeders/
│   │   │   └── seed.js                 # 5 usuarios + 5 cursos de prueba
│   │   └── index.js                    # Entry + proxy → NestJS
│   ├── uploads/                        # QR, firmas, logos (volumen persistente)
│   └── .env
│
├── backend-next/                       # ═══ NESTJS NUEVO ( :3002 ) ═══
│   ├── src/
│   │   ├── main.ts                     # Entry point (NestFactory)
│   │   ├── app.module.ts               # Root module (TypeORM + Auth + Users)
│   │   ├── auth/
│   │   │   ├── auth.module.ts          # JWT + Passport config
│   │   │   ├── auth.controller.ts      # POST register/login, GET me, PUT profile
│   │   │   ├── auth.service.ts         # Lógica: register, login, generateToken
│   │   │   └── jwt.strategy.ts         # Passport JWT strategy
│   │   ├── users/
│   │   │   ├── user.entity.ts          # TypeORM entity (12 roles enum)
│   │   │   ├── users.module.ts
│   │   │   ├── users.service.ts        # CRUD + toggleActivo + estadísticas
│   │   │   └── users.controller.ts     # Endpoints admin con @Roles guard
│   │   ├── common/
│   │   │   ├── guards/
│   │   │   │   ├── jwt-auth.guard.ts   # AuthGuard('jwt')
│   │   │   │   └── roles.guard.ts      # CanActivate con reflector
│   │   │   └── decorators/
│   │   │       └── roles.decorator.ts  # @Roles() SetMetadata
│   │   └── config/
│   │       └── config.module.ts        # ConfigModule.forRoot
│   ├── .env.example
│   ├── tsconfig.json
│   ├── nest-cli.json
│   └── package.json
│
└── src/                                # ═══ FRONTEND REACT ═══
    ├── components/
    │   ├── Layout.jsx                  # Header + nav responsive + theme toggle
    │   ├── ProtectedRoute.jsx          # Guard por auth y roles
    │   ├── ErrorBoundary.jsx           # Captura errores de React
    │   └── RichTextEditor.jsx          # Tiptap (reemplaza react-quill)
    ├── context/
    │   ├── AuthContext.jsx             # Estado de auth global (JWT)
    │   ├── ThemeContext.jsx            # Dark/light mode (localStorage)
    │   └── NotificationContext.jsx     # Sistema de toasts
    ├── pages/
    │   ├── Landing.jsx                 # Hero + features + cursos + CTA + footer
    │   ├── Login.jsx                   # Formulario de login
    │   ├── Register.jsx                # Formulario de registro
    │   ├── CursosList.jsx              # Grid + búsqueda + filtro categoría
    │   ├── CursoDetail.jsx             # Detalle + inscripción + HTML render
    │   ├── MisInscripciones.jsx        # Estado inscripciones + descarga cert
    │   ├── Dashboard.jsx               # Admin panel con estadísticas
    │   ├── AdminCursos.jsx             # CRUD cursos + imágenes + estados
    │   ├── AdminInscripciones.jsx      # Aprobar/rechazar solicitudes
    │   ├── AdminCertificados.jsx       # Emitir + listar certificados
    │   ├── AdminPlantillas.jsx         # Editor visual plantillas (preview)
    │   └── AdminUsuarios.jsx           # CRUD usuarios + stats + filtros
    ├── services/
    │   └── api.js                      # Cliente HTTP (fetch + JWT auto)
    ├── App.jsx                         # Router con lazy loading por ruta
    ├── App.css                         # Estilos del sistema + plantillas
    ├── index.css                       # CSS variables + dark mode + reset
    └── main.jsx                        # ReactDOM.createRoot
```

---

## Modelo de datos

```
┌──────────┐     ┌──────────────┐     ┌──────────┐
│   User   │─1:N─│ Inscripcion  │─N:1─│  Curso   │
│          │     │              │     │          │
│ id       │     │ id           │     │ id       │
│ nombre   │     │ estado       │     │ nombre   │
│ email    │     │ fecha_soli   │     │ descrip. │
│ password │     │ motivo_rech  │     │modalidad │
│ rol      │     └──────┬───────┘     │ estado   │
│ telefono │            │             │ categor. │
│ avatar   │       ┌────┼────┐        │ imagen   │
│ activo   │       │    │    │        └──────────┘
└──────────┘     1:N  1:N  1:1
                   │    │    │
              ┌────▼┐ ┌▼────┐ ┌▼────────────┐
              │Pago │ │Asist│ │ Certificado  │
              │     │ │encia│ │              │
              │ monto│ │pres.│ │ codigo       │
              │ cuota│ │     │ │ qr_url       │
              │confirm│     │ │ horas        │
              └─────┘ └─────┘ │ fecha_emis.  │
                              └──────┬───────┘
                                     │ N:1
                              ┌──────▼───────┐
                              │  Plantilla   │
                              │  Certificado │
                              │              │
                              │ config (JSONB)│
                              │ firma_url    │
                              │ logo_url     │
                              │ is_default   │
                              └──────────────┘
```

---

## Roles

### Express (3 roles — actual)

| Rol | Cursos | Inscripciones | Pagos | Certificados | Plantillas | Usuarios |
|-----|--------|---------------|-------|--------------|------------|----------|
| **Admin** | CRUD todo | Aprobar/rechazar | Confirmar | Emitir/descargar | CRUD | CRUD |
| **Docente** | CRUD propios | Ver los suyos | — | — | — | — |
| **Estudiante** | Ver | Solicitar/ver | — | Descargar | — | — |

### NestJS (12 roles — SaaS futuro)

| Rol | Valor | Descripción |
|-----|-------|------------|
| Admin | `admin` | Administrador global del sistema |
| Organizador | `organizador` | Crea y gestiona eventos |
| Coordinador | `coordinador` | Coordina actividades del evento |
| Ponente | `ponente` | Speaker que dicta sesiones |
| Expositor | `expositor` | Exhibidor con stand propio |
| Patrocinador | `patrocinador` | Sponsor con beneficios |
| Asistente | `asistente` | Participante general |
| Invitado | `invitado` | Guest list |
| Check-in | `checkin` | Personal de acreditación |
| Moderador | `moderador` | Modera sesiones y chat |
| Docente | `docente` | Compatibilidad con Express |
| Estudiante | `estudiante` | Compatibilidad con Express |

---

## API Endpoints

### Express — `/api/*` (producción activa)

#### Auth (público + autenticado)

| Método | Ruta | Auth | Body | Respuesta |
|--------|------|------|------|-----------|
| POST | `/api/auth/register` | No | `{ nombre, email, password, rol? }` | `{ token, user }` |
| POST | `/api/auth/login` | No | `{ email, password }` | `{ token, user }` |
| GET | `/api/auth/me` | JWT | — | `user` (sin password) |
| PUT | `/api/auth/profile` | JWT | `{ nombre?, telefono? }` | `user` |

#### Cursos

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/cursos` | Sí | Listar (paginación: `?page=1&pageSize=20`) |
| GET | `/api/cursos/:id` | Sí | Detalle con docente |
| POST | `/api/cursos` | Admin/Docente | Crear (FormData: imagen + JSON) |
| PUT | `/api/cursos/:id` | Admin/Docente | Actualizar (dueño o admin) |
| DELETE | `/api/cursos/:id` | Admin | Soft delete |
| PUT | `/api/cursos/:id/estado` | Admin | Cambiar estado rápido (`{ estado }`) |

#### Inscripciones

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/inscripciones` | Estudiante | Solicitar (`{ curso_id }`) |
| GET | `/api/inscripciones/mis` | Estudiante | Mis inscripciones |
| GET | `/api/inscripciones` | Admin/Docente | Listar todas (paginación) |
| PUT | `/api/inscripciones/:id/aprobar` | Admin | Aprobar inscripción |
| PUT | `/api/inscripciones/:id/rechazar` | Admin | Rechazar (`{ motivo }`) |

#### Pagos

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/pagos` | Sí | Crear pago |
| GET | `/api/pagos` | Sí | Listar (paginación) |
| PUT | `/api/pagos/:id/confirmar` | Admin | Confirmar (desbloquea inscripción) |

#### Certificados

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/certificados` | Sí | Listar (paginación) |
| POST | `/api/certificados/emitir` | Admin | Emitir (verifica 80% asistencia) |
| GET | `/api/certificados/validar/:codigo` | **No** | Validación pública de certificado |
| GET | `/api/certificados/:id/descargar` | Sí | Descargar PDF (usa plantilla activa) |

#### Plantillas de certificado

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/plantillas` | Admin | Listar todas |
| GET | `/api/plantillas/default` | Admin | Obtener plantilla por defecto |
| GET | `/api/plantillas/:id` | Admin | Detalle |
| POST | `/api/plantillas` | Admin | Crear (FormData: config JSON + firma + logo) |
| PUT | `/api/plantillas/:id` | Admin | Actualizar |
| DELETE | `/api/plantillas/:id` | Admin | Eliminar |

#### Usuarios (solo admin)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/usuarios` | Admin | Listar (filtros: `?rol=&activo=&page=&pageSize=`) |
| GET | `/api/usuarios/estadisticas` | Admin | `{ total, activos, inactivos, porRol[] }` |
| GET | `/api/usuarios/:id` | Admin | Detalle |
| POST | `/api/usuarios` | Admin | Crear (`{ nombre, email, password, rol, telefono? }`) |
| PUT | `/api/usuarios/:id` | Admin | Actualizar |
| DELETE | `/api/usuarios/:id` | Admin | Hard delete |
| PUT | `/api/usuarios/:id/toggle` | Admin | Activar/desactivar |

#### Health

| Método | Ruta | Auth | Respuesta |
|--------|------|------|-----------|
| GET | `/api/health` | No | `{ "ok": true }` |

### NestJS — `/api/v2/*` (via proxy Express)

Mismos endpoints que Express, migrados a NestJS + TypeScript.

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/v2/auth/register` | No | Registro |
| POST | `/api/v2/auth/login` | No | Login → JWT |
| GET | `/api/v2/auth/me` | JWT | Perfil |
| PUT | `/api/v2/auth/profile` | JWT | Actualizar perfil |
| GET | `/api/v2/usuarios` | Admin | Listar |
| GET | `/api/v2/usuarios/estadisticas` | Admin | Estadísticas |
| GET | `/api/v2/usuarios/:id` | Admin | Detalle |
| POST | `/api/v2/usuarios` | Admin | Crear |
| PUT | `/api/v2/usuarios/:id` | Admin | Actualizar |
| DELETE | `/api/v2/usuarios/:id` | Admin | Eliminar |
| PUT | `/api/v2/usuarios/:id/toggle` | Admin | Toggle activo |

---

## Funcionalidades

### Core
- **12 roles jerárquicos** (NestJS) / 3 roles (Express)
- **JWT auth** con Bearer token, bcrypt hashing, protección automática de password
- **Soft delete** en todos los modelos (paranoid en Sequelize, DeleteDateColumn en TypeORM)
- **Paginación** `?page=1&pageSize=20` en todos los listados
- **Rate limiting:** 200 req/15min global, 20 req/15min en login/register
- **Validación** de entrada: express-validator (Express) + class-validator (NestJS)
- **CORS** configurable por orígenes

### Eventos / Cursos
- CRUD completo con modalidades (virtual/presencial/híbrido)
- Estados: `borrador` → `publicado` → `finalizado`
- Finalización rápida desde admin (botón directo)
- Subida de imágenes (jpg/png/webp, 5MB máx, multer)
- Editor enriquecido Tiptap para descripción y requisitos
- Búsqueda y filtros por categoría

### Inscripciones
- Flujo: `pendiente` → `aceptado` / `rechazado`
- Verificación de cupos y aceptación automática configurable
- Motivo de rechazo

### Pagos
- Pagos por cuota
- Confirmación manual con desbloqueo automático al completar

### Certificados
- PDF generado con código único + QR de validación pública
- Validación sin autenticación (endpoint público)
- Plantillas personalizables:
  - **Colores:** fondo, borde, título, código, nombre, texto (color pickers)
  - **Fuentes:** Helvetica, Times Roman, Courier (+ bold variants)
  - **Posiciones configurables:** logo (X/Y/w/h), título Y, código Y, nombre Y, curso Y, horas Y, fecha Y
  - **Firma:** ancho, alto, centrada o posición custom
  - **QR:** tamaño + posición en 4 esquinas (superior/inferior × izquierda/derecha)
  - **Upload:** firma electrónica + logo institucional (jpg/png/webp, 5MB)
  - **Plantilla por defecto** con toggle

### Plantillas
- Editor visual con preview en tiempo real
- Sección colapsable "Posiciones y tamaños" con controles numéricos
- Upload de firma y logo con preview
- Tabla de gestión con acciones: editar, predeterminar, eliminar

### Usuarios
- CRUD completo con activar/desactivar
- Estadísticas: total, activos, inactivos, por rol
- Filtros: rol, estado activo
- Protección: no se puede desactivar el último admin

### UI/UX
- **Dark/light mode** con persistencia en `localStorage`
- **Lazy loading** de todas las rutas (`React.lazy`)
- **Skeleton loaders** durante carga
- **Notificaciones toast** (éxito/error)
- **Error boundary** para capturar errores de React
- **Responsive** adaptado a mobile, tablet y desktop
- **Landing page** con hero, características, cursos destacados, CTA y footer
- **Navegación condicional** según rol (admin ve panel, estudiante ve cursos)

---

## Instalación local

### Requisitos

- Node.js 20+
- npm
- Docker + Docker Compose (recomendado)
- PostgreSQL 14+ (si no usás Docker)

### Paso 1 — Clonar el repo

```bash
git clone https://github.com/brandall2021/evento.git
cd evento-web
```

### Paso 2 — Infraestructura (Docker)

```bash
# Levantar PostgreSQL, Redis y MinIO
docker compose up -d

# Verificar que están corriendo
docker compose ps

# Salida esperada:
# NAME                    STATUS
# evento-web-postgres-1   Up (healthy)
# evento-web-redis-1      Up
# evento-web-minio-1      Up
```

Si preferís PostgreSQL local (sin Docker):

```bash
createdb evento_web
# Asegurate de que PostgreSQL corra en :5432 con usuario postgres/postgres
```

### Paso 3 — Backend Express

```bash
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
# (copiar del .env de ejemplo o crear manualmente — ver sección Variables)

# Sembrar datos de prueba (5 usuarios + 5 cursos)
npm run seed

# Iniciar en desarrollo
npm run dev

# Salida: Server running on http://localhost:3001
```

### Paso 4 — Backend NestJS

```bash
cd ../backend-next

# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env

# Iniciar en desarrollo (watch mode)
npm run start:dev

# Salida: NestJS running on http://localhost:3002
```

### Paso 5 — Frontend

```bash
# Volver a la raíz
cd ..

# Instalar dependencias (usar --legacy-peer-deps por Tiptap + React 19)
npm install --legacy-peer-deps

# Iniciar en desarrollo
npm run dev

# Salida: Vite dev server running at http://localhost:5173
```

### Verificación

Abrir `http://localhost:5173` y:
1. Ver la landing page
2. Registrarse con un email nuevo
3. Loguearse
4. Explorar cursos
5. Como admin (`admin@evento.com` / `admin123`): admin, certificados, plantillas, usuarios

---

## Variables de entorno

### Backend Express (`backend/.env`)

```env
# Servidor
PORT=3001

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=evento_web
DB_USER=postgres
DB_PASSWORD=postgres

# JWT
JWT_SECRET=evento-web-secret-key-2026
JWT_EXPIRES_IN=7d

# URLs
API_URL=http://localhost:3001
CORS_ORIGIN=http://localhost:5173,http://localhost:3001

# NestJS proxy
NESTJS_URL=http://localhost:3002
```

### Backend NestJS (`backend-next/.env`)

```env
# Servidor
PORT=3002

# PostgreSQL (misma DB que Express)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=evento_web
DB_USER=postgres
DB_PASSWORD=postgres

# JWT (MISMO secret que Express para compatibilidad)
JWT_SECRET=evento-web-secret-key-2026
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173,http://localhost:3001

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# MinIO (S3)
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
```

### Frontend (solo desarrollo, `evento-web/.env`)

```env
VITE_API_URL=http://localhost:3001/api
```

> En producción el frontend se sirve desde Express (`dist/`), usa `/api` por defecto.

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

### Build y run

```bash
# Build de la imagen
docker build -t evento-web:latest .

# Ejecutar
docker run -d \
  --name evento-web \
  -p 3001:3001 \
  -e DB_HOST=tu-host-postgres \
  -e DB_PORT=5432 \
  -e DB_NAME=evento_web \
  -e DB_USER=postgres \
  -e DB_PASSWORD=tu-password-seguro \
  -e JWT_SECRET=$(openssl rand -hex 32) \
  -e JWT_EXPIRES_IN=7d \
  -e API_URL=https://tu-dominio.com \
  -e CORS_ORIGIN=https://tu-dominio.com \
  evento-web:latest

# Seed dentro del contenedor
docker exec evento-web sh -c "cd /app/backend && npm run seed"
```

### Dockerfile explicado

```dockerfile
# ═══ Stage 1: Builder ═══
FROM node:20-alpine AS builder
WORKDIR /app

# Copiar manifests primero (cache de capas)
COPY package*.json ./
COPY backend/package*.json ./backend/

# Instalar dependencias
RUN npm ci --legacy-peer-deps          # Frontend (React 19 + Tiptap)
RUN cd backend && npm ci               # Backend Express

# Copiar código fuente
COPY . .

# Compilar frontend (genera dist/)
RUN npm run build

# ═══ Stage 2: Production ═══
FROM node:20-alpine
WORKDIR /app

# Copiar solo lo necesario del builder
COPY --from=builder /app/backend ./backend
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/backend/node_modules ./backend/node_modules

# Crear directorio para uploads
RUN mkdir -p /app/backend/uploads/cursos

WORKDIR /app/backend

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

VOLUME ["/app/backend/uploads"]

CMD ["node", "src/index.js"]
```

**Resultado:** imagen de ~40MB con Node.js + Express + frontend compilado.

---

## Despliegue con Dokploy

Guía paso a paso completa para desplegar en Dokploy.

### Requisitos previos

| Requisito | Detalle |
|-----------|---------|
| Servidor VPS | Ubuntu 22.04+, mínimo 2GB RAM, 20GB SSD |
| Docker | Instalado en el servidor |
| Dokploy | Instalado ([guía oficial](https://dokploy.com/docs/install)) |
| Dominio | Un dominio con DNS apuntando al servidor |
| GitHub | Repo en `https://github.com/brandall2021/evento` |

### Paso 1 — Instalar Dokploy

```bash
# Conectarse al servidor por SSH
ssh root@IP_DEL_SERVIDOR

# Instalar Dokploy (Ubuntu/Debian)
curl -fsSL https://dokploy.com/install.sh | sh

# El instalador imprime la URL del panel
# Generalmente: https://IP_DEL_SERVIDOR:3000
```

Acceder al panel desde el navegador con la URL impresa.

**Configuración inicial de Dokploy:**
1. Crear usuario admin (email + password)
2. Conectar un proveedor de cloud (opcional, para crear servidores)
3. Ir a **Settings** → verificar que Docker está funcionando

### Paso 2 — Crear el proyecto

1. En el menú lateral, ir a **Dokploy** → **Projects**
2. Hacer clic en **Create Project**
3. Completar:
   - **Project Name:** `evento-web`
   - **Description:** `Plataforma de gestión de eventos`
4. Hacer clic en **Create**

### Paso 3 — Conectar repositorio de GitHub

1. Dentro del proyecto `evento-web`, ir a la pestaña **Configuration**
2. En la sección **Git**:
   - **Repository URL:** `https://github.com/brandall2021/evento.git`
   - **Branch:** `master`
3. Si el repo es **público**, no necesita credenciales
4. Si el repo es **privado**:
   - Ir a **GitHub** → Settings → Developer settings → **Personal access tokens**
   - Crear token con permiso `repo`
   - En Dokploy, seleccionar **Auth Type:** `Token`
   - Pegar el token
5. Hacer clic en **Save**
6. Verificar: Dokploy muestra los commits recientes del repo

### Paso 4 — Configurar el dominio

1. Dentro del proyecto, ir a la pestaña **Domains**
2. Hacer clic en **Add Domain**
3. Completar:
   - **Service Name:** `evento-web` (seleccionar el servicio creado)
   - **Host:** `evento.tudominio.com`
   - **HTTPS:** ✅ Activar (Let's Encrypt automático)
4. Hacer clic en **Add**
5. Dokploy muestra los registros DNS que necesitás configurar

**Configurar DNS en tu proveedor** (Cloudflare, Namecheap, etc.):

```
Tipo:    A (recomendado) o CNAME
Nombre:  evento (subdominio)
Valor:   IP_DEL_SERVIDOR (para A record)
         o IP_DEL_SERVIDOR.yourdomain.com (para CNAME)
TTL:     Auto (o 300 segundos)
```

**Si usás Cloudflare:**
- Modo: **DNS Only** (el icono nube en GRIS, no naranja)
- SSL/TLS: **Full (strict)** en la pestaña SSL/TLS
- **NO** usar proxy de Cloudflare al principio (puede causar problemas con WebSocket)

Esperar ~5 minutos a que la propagación DNS surta efecto. Verificar con:
```bash
dig evento.tudominio.com
# Debe devolver la IP de tu servidor
```

### Paso 5 — Agregar servicio PostgreSQL

1. En el menú lateral de Dokploy, ir a **PostgreSQL**
2. Hacer clic en **Create PostgreSQL**
3. Completar:
   - **Service Name:** `evento-db`
   - **Database Name:** `evento_web`
   - **Database User:** `postgres`
   - **Password:** *(generar una segura)*
     ```bash
     # En tu terminal local:
     openssl rand -hex 16
     # Ejemplo: a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6
     ```
   - **Database Port:** `5432`
4. Hacer clic en **Create**
5. **Anotar los datos de conexión:**

   | Dato | Valor |
   |------|-------|
   | Host interno | `evento-db` |
   | Puerto | `5432` |
   | Usuario | `postgres` |
   | Contraseña | *(la que generaste)* |
   | Database | `evento_web` |

6. Vincular al proyecto:
   - Ir al proyecto `evento-web` → **Service Links** (o **Linked Services**)
   - H clic en **Link Service**
   - Seleccionar `evento-db`
   - Esto hace que `evento-db` esté disponible como hostname dentro del contenedor

### Paso 6 — Variables de entorno

Dentro del proyecto `evento-web`, ir a la pestaña **Environment**.

Agregar cada variable haciendo clic en **Add Variable**:

| # | Variable | Valor | Notas |
|---|----------|-------|-------|
| 1 | `PORT` | `3001` | Puerto del contenedor Express |
| 2 | `DB_HOST` | `evento-db` | **NO** usar `localhost`. Usar el nombre del servicio |
| 3 | `DB_PORT` | `5432` | Puerto de PostgreSQL |
| 4 | `DB_NAME` | `evento_web` | Nombre de la base de datos |
| 5 | `DB_USER` | `postgres` | Usuario de PostgreSQL |
| 6 | `DB_PASSWORD` | *(tu contraseña)* | La misma que configuraste en el servicio PostgreSQL |
| 7 | `JWT_SECRET` | *(generar nuevo)* | `openssl rand -hex 32` — NUNCA usar el de desarrollo |
| 8 | `JWT_EXPIRES_IN` | `7d` | Duración de los tokens JWT |
| 9 | `API_URL` | `https://evento.tudominio.com` | URL pública (con `https://`) |
| 10 | `CORS_ORIGIN` | `https://evento.tudominio.com` | Mismo que API_URL |
| 11 | `NESTJS_URL` | *(vacío por ahora)* | Se configura cuando NestJS esté en producción |

**Tip importante:** El `JWT_SECRET` debe ser **exactamente el mismo** en todos los reinicios del contenedor. Si cambia, todos los tokens existentes se invalidan. Usar `openssl rand -hex 32` una vez y reusarlo.

### Paso 7 — Puerto y health check

1. Ir a la pestaña **Configuration** del proyecto
2. En **Ports / Expose:**
   - **Container Port:** `3001`
   - **Protocol:** TCP
3. En **Health Check** (si Dokploy lo soporta):
   - **Path:** `/api/health`
   - **Port:** `3001`
   - **Interval:** `30`
   - **Timeout:** `5`
   - **Retries:** `3`

### Paso 8 — Volumen para uploads

Los archivos generados (QR de certificados, firmas, logos) se guardan en `backend/uploads/`. Sin un volumen persistente, se pierden al reiniciar el contenedor.

1. Ir a la pestaña **Advanced** (o **Volumes**)
2. En **Docker Compose** o **Volumes**, agregar:
   - **Mount Path:** `/app/backend/uploads`
   - **Type:** `Volume` (recomendado, persiste en el servidor)
   - **Name:** `evento-uploads` (Dokploy crea el volumen automáticamente)

Si preferís una ruta específica en el servidor:
   - **Type:** `Bind`
   - **Host Path:** `/opt/evento-uploads`

### Paso 9 — Desplegar

1. Ir a la pestaña **Deployments**
2. Hacer clic en **Deploy** (o **Deploy Latest**)
3. Esperar el build (~2-5 minutos dependiendo del servidor)
4. Verificar los logs en tiempo real:
   - Buscar: `Server running on http://localhost:3001`
   - Buscar: `DB connected`
5. Si hay errores, revisar la pestaña **Build Logs**

### Paso 10 — Seed de datos iniciales

Después del primer deploy exitoso, insertar los datos de prueba:

**Opción A — Desde el panel de Dokploy:**
1. Ir a la pestaña **Terminal** (o **SSH** dentro del contenedor)
2. Ejecutar:
   ```bash
   cd /app/backend && npm run seed
   ```

**Opción B — Desde SSH en el servidor:**
```bash
# Encontrar el contenedor
docker ps --filter "name=evento-web"

# Ejecutar seed
docker exec -it <CONTAINER_ID> sh -c "cd /app/backend && npm run seed"
```

**Opción A — Desde Dokploy (si tiene terminal):**
1. En el proyecto, ir a **Terminal**
2. Seleccionar el servicio `evento-web`
3. Ejecutar:
   ```bash
   cd /app/backend && npm run seed
   ```

### Paso 11 — Verificar el deploy

```bash
# 1. Health check
curl https://evento.tudominio.com/api/health
# Esperado: {"ok":true}

# 2. Login
curl -X POST https://evento.tudominio.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@evento.com","password":"admin123"}'
# Esperado: {"token":"eyJ...","user":{...}}

# 3. Cursos (con token del login anterior)
curl https://evento.tudominio.com/api/cursos \
  -H "Authorization: Bearer eyJ..."
# Esperado: [{"id":1,"nombre":"..."}, ...]

# 4. Frontend
# Abrir https://evento.tudominio.com en el navegador
# Debería mostrar la landing page
```

### Paso 12 — Auto-deploy (push to deploy)

Para que cada push a `master` despliegue automáticamente:

1. En Dokploy, dentro del proyecto → **Configuration**
2. Activar **Auto Deploy:** ✅

3. En **Dokploy** → **Settings** → **SSH Keys**:
   - Copiar la public key que Dokploy muestra
   - Agregarla en GitHub → Settings → Deploy keys (con permiso de lectura)

4. **O usar GitHub Webhooks:**
   - En GitHub → Settings → Webhooks → Add webhook
   - **Payload URL:** `https://TU-SERVIDOR:3000/api/deploy-webhook?token=TU_TOKEN_DOKPLOY`
   - **Content type:** `application/json`
   - **Secret:** *(dejar vacío)*
   - **Events:** `Just the push event`

### Arquitectura final en Dokploy

```
┌─────────────────────────────────────────────┐
│                 Dokploy                      │
│                                              │
│  ┌──────────────┐  ┌──────────────────────┐ │
│  │  evento-web  │  │     evento-db        │ │
│  │  (Express)   │──│  (PostgreSQL 16)     │ │
│  │  :3001       │  │  :5432               │ │
│  │              │  │                      │ │
│  │  Frontend    │  │  DB: evento_web      │ │
│  │  compilado   │  │  User: postgres      │ │
│  │  en dist/    │  │                      │ │
│  └──────┬───────┘  └──────────────────────┘ │
│         │                                    │
│  ┌──────▼───────┐  ┌──────────────────────┐ │
│  │   Domain     │  │   Volume: uploads    │ │
│  │  SSL (LE)    │  │   /app/backend/      │ │
│  │  HTTPS       │  │   uploads/           │ │
│  └──────────────┘  └──────────────────────┘ │
└─────────────────────────────────────────────┘
```

---

## Troubleshooting

### Problemas comunes

| # | Problema | Causa | Solución |
|---|----------|-------|----------|
| 1 | Build falla: `npm ERR! peer dep` | React 19 incompatible con Tiptap peers | Verificar `--legacy-peer-deps` en Dockerfile |
| 2 | `ECONNREFUSED 127.0.0.1:5432` | `DB_HOST=localhost` en Dokploy | Cambiar a `DB_HOST=evento-db` (nombre del servicio) |
| 3 | `ECONNREFUSED` Redis/MinIO | Estos servicios no están en producción | Ignorar por ahora, se integrarán en Fase 1 |
| 4 | Frontend muestra 404 | Build de Vite falló silenciosamente | Revisar build logs, verificar `npm run build` |
| 5 | `CORS error` en navegador | Dominio no está en `CORS_ORIGIN` | Agregar `https://evento.tudominio.com` a CORS_ORIGIN |
| 6 | `jwt malformed` / token inválido | `JWT_SECRET` cambió entre reinicios | Usar el MISMO secret en todas las variables |
| 7 | Archivos (QR, firmas) se pierden | No hay volumen persistente | Configurar volumen para `/app/backend/uploads` |
| 8 | Build muy lento (>10min) | Servidor con poca RAM | Mínimo 2GB RAM recomendado para Docker build |
| 9 | `Cannot find module` en NestJS | Dependencias no instaladas | Ejecutar `npm install` en `backend-next/` |
| 10 | Proxy `/api/v2/*` retorna 502 | NestJS no está corriendo | Verificar que NestJS esté en `:3002` (solo desarrollo por ahora) |
| 11 | SSL no funciona | DNS no propagado o Cloudflare proxy activo | Esperar 5-10 min, verificar DNS con `dig`, desactivar proxy Cloudflare |
| 12 | Seed no funciona | Contenedor no tiene el script | Verificar que `backend/src/seeders/seed.js` existe |

### Cómo revisar logs en Dokploy

1. Ir al proyecto → pestaña **Logs**
2. Seleccionar servicio `evento-web`
3. Buscar mensajes clave:
   - ✅ `DB connected` — PostgreSQL conectado
   - ✅ `Server running on http://localhost:3001` — Express funcionando
   - ❌ `Startup error:` — Error al iniciar (revisar variables de entorno)
   - ❌ `ECONNREFUSED` — No puede conectar a PostgreSQL

### Cómo reiniciar el contenedor

En Dokploy: **Deployments** → **Redeploy** (rebuild + restart)

O desde SSH:
```bash
docker restart <CONTAINER_ID>
```

### Cómo verificar variables de entorno

```bash
# Desde SSH en el servidor
docker exec -it <CONTAINER_ID> env | grep -E "DB_|JWT_|PORT"
```

---

## Roadmap de migración

### Fase 0 — Infraestructura ✅
- [x] Docker Compose (PostgreSQL + Redis + MinIO)
- [x] NestJS scaffold con TypeScript
- [x] Módulo Auth migrado (register/login/me/profile)
- [x] Módulo Users migrado (CRUD + 12 roles + stats)
- [x] Proxy Express → NestJS (`/api/v2/*`)

### Fase 1 — Migrar módulos core
- [ ] Eventos (CRUD + modalidad + configuración)
- [ ] Inscripciones (registro + estados + cupos)
- [ ] Pagos (Stripe/MercadoPago + cupones)
- [ ] Certificados (PDF + QR + plantillas)

### Fase 2 — Asistentes & Agenda
- [ ] Perfil de asistente (empresa, cargo, foto, intereses, redes)
- [ ] Agenda jerárquica (día/bloque/sala/sesión)
- [ ] Check-in QR (escaneo, control de salas, modo offline)
- [ ] Credenciales PDF/Wallet (Apple/Google Wallet)

### Fase 3 — Ponentes, Expositores, Patrocinadores
- [ ] Perfiles de ponente con CV, sesiones, calificación
- [ ] Stands de expositor con productos, catálogos, chat
- [ ] Patrocinadores con categorías (Platino/Oro/Plata/Bronce)
- [ ] Beneficios de patrocinio (banners, popups, videos)

### Fase 4 — Networking & Streaming
- [ ] Chat privado/grupal (Socket.IO)
- [ ] Match por intereses
- [ ] Videollamadas
- [ ] Agenda de reuniones
- [ ] Streaming integrado (Zoom/Teams/YouTube/RTMP)
- [ ] Sala de streaming con chat, encuestas, Q&A

### Fase 5 — Interacción & Gamificación
- [ ] Encuestas y votaciones en sesiones
- [ ] Preguntas al ponente (Q&A)
- [ ] Trivia, ranking, puntos, badges
- [ ] Comentarios, likes

### Fase 6 — CMS & Noticias
- [ ] Editor visual de contenido
- [ ] Blog, galerías, videos, FAQ
- [ ] Páginas libres
- [ ] Push/Email/SMS/WhatsApp

### Fase 7 — Móvil & API
- [ ] PWA (service worker, modo offline)
- [ ] App Android/iOS (React Native o Flutter)
- [ ] API REST pública con OAuth2 + OpenAPI
- [ ] Webhooks para integraciones

### Fase 8 — Analytics & Admin
- [ ] Estadísticas avanzadas (visitantes, embudo, no-show)
- [ ] Exportación Excel/PDF
- [ ] Logs de auditoría
- [ ] Multi-tenant (dominio por evento)
- [ ] Gestión de roles y permisos granulares

---

## Licencia

MIT
