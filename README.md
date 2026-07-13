# Evento — Plataforma SaaS de Gestión de Eventos

Plataforma completa para la administración integral de eventos presenciales, virtuales e híbridos. Permite crear eventos, vender entradas, administrar asistentes, generar acreditaciones, controlar accesos, networking, streaming, certificados y más.

**Backend:** NestJS 28 módulos + Express legacy (proxy)  
**Frontend:** React 19 + Vite 8  
**Infra:** PostgreSQL 16 + Redis 7 + MinIO (S3)

**Repo:** `https://github.com/brandall2021/evento.git`

---

## Tabla de contenidos

- [Resumen del sistema](#resumen-del-sistema)
- [Arquitectura](#arquitectura)
- [Stack tecnológico](#stack-tecnológico)
- [Módulos NestJS (28)](#módulos-nestjs-28)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Modelo de datos](#modelo-de-datos)
- [Roles](#roles)
- [API Endpoints — Express (`/api/*`)](#api-endpoints--express-apio)
- [API Endpoints — NestJS (`/api/v2/*`)](#api-endpoints--nestjs-apiv2)
- [Funcionalidades por fase](#funcionalidades-por-fase)
- [Instalación local](#instalación-local)
- [Variables de entorno](#variables-de-entorno)
- [Despliegue con Docker](#despliegue-con-docker)
- [Despliegue con Dokploy](#despliegue-con-dokploy)
- [Troubleshooting](#troubleshooting)
- [Roadmap](#roadmap)

---

## Resumen del sistema

| Componente | Stack | Estado |
|------------|-------|--------|
| Frontend React | React 19, Vite 8, Tiptap, dark/light mode | Producción |
| Backend Express | Node.js 20, Sequelize, JWT, PDFKit | Producción (legacy) |
| Backend NestJS | NestJS 11, TypeORM 0.3, Passport, TypeScript 5.8 | **28 módulos completos** |
| Base de datos | PostgreSQL 16 | Docker / Dokploy |
| Cache / Colas | Redis 7 | Docker / Dokploy |
| Storage S3 | MinIO | Docker / Dokploy |
| Despliegue | Docker multi-stage (~40MB) + Dokploy | Producción |

El frontend se compila a `dist/` y se sirve estáticamente desde Express en `:3001`. Express redirige `/api/v2/*` a NestJS en `:3002`, permitiendo migración incremental sin downtime.

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
                  ┌──────────────┐│   ┌───────▼────────┐
                  │   PostgreSQL ││   │  NestJS :3002   │
                  │   :5432      │◀┘   │  28 módulos     │
                  │              │     │  TypeORM         │
                  └──────────────┘     └───────┬────────┘
                                        ┌──────┼──────┐
                                   ┌────▼──┐ ┌─▼────┐ │
                                   │ Redis │ │MinIO │ │
                                   │ :6379 │ │:9000 │ │
                                   └───────┘ └──────┘ │
```

### ¿Por qué dos backends?

El sistema mantiene Express como backend de producción mientras NestJS se construye y valida. El proxy en Express (`/api/v2/*`) redirige a NestJS, lo que permite:

- Migrar módulo por módulo sin downtime
- Mantener la app funcionando durante la migración
- Testing comparativo entre ambos backends
- Cuando todo esté validado, NestJS reemplaza a Express directamente

---

## Stack tecnológico

### Frontend

| Capa | Tecnología | Versión | Descripción |
|------|-----------|---------|-------------|
| Framework | React | 19 | UI library con hooks |
| Bundler | Vite | 8 | Build tool ultrarrápido |
| Routing | React Router | 7 | Client-side routing con lazy loading |
| Editor WYSIWYG | Tiptap | 3.27 | Rich-text compatible con React 19 |
| Estilos | CSS custom properties | — | Variables CSS + dark/light mode |
| PWA | Service Worker | — | Manifest + sw.js (network-first) |
| HTTP Client | Fetch API | nativo | Con interceptor JWT manual |

### Backend Express (`:3001`)

| Capa | Tecnología | Descripción |
|------|-----------|-------------|
| Framework | Express 4 | HTTP minimalista |
| ORM | Sequelize 6 | PostgreSQL con soft delete |
| Auth | JWT + bcryptjs | Bearer tokens |
| PDF | PDFKit | Generación de certificados |
| QR | qrcode | Códigos de validación |
| Upload | Multer | Imágenes (5MB max) |
| Rate Limit | express-rate-limit | 200 req/15min, 20 en auth |

### Backend NestJS (`:3002`)

| Capa | Tecnología | Descripción |
|------|-----------|-------------|
| Framework | NestJS 11 | Modular con DI, Guards, Interceptors |
| ORM | TypeORM 0.3 | Entities + repositorios |
| Auth | Passport + JWT | Strategy pattern (local + Google OAuth2) |
| Validation | class-validator | Decoradores en DTOs |
| Language | TypeScript 5.8 | Tipado estático |
| PDF | PDFKit + qrcode | Certificados con plantillas configurables |

### Infraestructura

| Servicio | Imagen | Puerto | Descripción |
|----------|--------|--------|-------------|
| PostgreSQL | `postgres:16-alpine` | `5432` | Base de datos principal |
| Redis | `redis:7-alpine` | `6379` | Cache + sesiones |
| MinIO | `minio/minio` | `9000`/`9001` | S3-compatible storage |

---

## Módulos NestJS (28)

Todos los módulos están en `backend-next/src/` y se registran en `app.module.ts`.

### Fase 0 — Auth & Usuarios

| # | Módulo | Archivos | Descripción |
|---|--------|----------|-------------|
| 1 | `AuthModule` | `auth/` | Register, login, me, profile (JWT + Passport) + Google OAuth2 |
| 2 | `UsersModule` | `users/` | CRUD, 12 roles, toggleActivo, estadísticas |

### Fase 1 — Core

| # | Módulo | Archivos | Descripción |
|---|--------|----------|-------------|
| 3 | `CursosModule` | `cursos/` | CRUD + paginación + imagen upload + estado (borrador/publicado/finalizado) |
| 4 | `InscripcionesModule` | `inscripciones/` | Solicitar, misInscripciones, aprobar, rechazar, cupos, auto-accept |
| 5 | `AsistenciasModule` | `asistencias/` | Registrar asistencia, contar presentes |
| 6 | `PagosModule` | `pagos/` | Crear, confirmar, listar, auto-accept inscripción |
| 7 | `CertificadosModule` | `certificados/` | Emitir (80% asistencia, QR), descargar PDF, validar |
| 8 | `PlantillasModule` | `plantillas/` | CRUD plantillas certificado, config posiciones, firma/logo upload |

### Fase 2 — Asistentes & Agenda

| # | Módulo | Archivos | Descripción |
|---|--------|----------|-------------|
| 9 | `PerfilModule` | `perfil/` | Perfil asistente (1:1 con User), empresa, cargo, bio, intereses, redes |
| 10 | `AgendaModule` | `agenda/` | Días, Salas, Bloques, Sesiones — árbol jerárquico completo |
| 11 | `CheckinModule` | `checkin/` | QR/manual/geolocalización, por sesión o general, estadísticas |
| 12 | `CredencialesModule` | `credenciales/` | Emitir credencial PDF con QR, validar, misCredenciales |

### Fase 3 — Ponentes, Expositores, Patrocinadores

| # | Módulo | Archivos | Descripción |
|---|--------|----------|-------------|
| 13 | `PonentesModule` | `ponentes/` | Perfil ponente: CV, especialidad, calificación, experiencia |
| 14 | `ExpositoresModule` | `expositores/` | Expositor + Productos (empresa, stand, catálogo con precios) |
| 15 | `PatrocinadoresModule` | `patrocinadores/` | Patrocinador + Beneficios (Platino/Oro/Plata/Bronce, banners, popups) |

### Fase 4 — Networking & Streaming

| # | Módulo | Archivos | Descripción |
|---|--------|----------|-------------|
| 16 | `ChatModule` | `chat/` | Conversaciones privadas/grupales, mensajes con tipos, tracking lectura |
| 17 | `NetworkingModule` | `networking/` | Match por intereses, sugerencias con scoring, solicitudes |
| 18 | `ReunionesModule` | `reuniones/` | Reuniones con participantes, estados, programación |
| 19 | `StreamingModule` | `streaming/` | Salas (Zoom/Teams/YouTube/RTMP/WebRTC), encuestas, Q&A con votos |

### Fase 5 — Gamificación & Interacción

| # | Módulo | Archivos | Descripción |
|---|--------|----------|-------------|
| 20 | `GamificacionModule` | `gamificacion/` | Puntos (8 fuentes), badges con thresholds, ranking global |
| 21 | `InteraccionModule` | `interaccion/` | Comentarios (anidados), likes (toggle), trivias con scoring |

### Fase 6 — CMS & Notificaciones

| # | Módulo | Archivos | Descripción |
|---|--------|----------|-------------|
| 22 | `CmsModule` | `cms/` | Páginas, Blog Posts, Galería, FAQs |
| 23 | `NotificacionesModule` | `notificaciones/` | Enviar, masivas, leídas/no-leídas, plantillas |

### Fase 7 — API Pública, Webhooks, PWA, OAuth2

| # | Módulo | Archivos | Descripción |
|---|--------|----------|-------------|
| 24 | `PublicApiModule` | `public-api/` | Endpoints públicos (sin auth): cursos, blog, ponentes, validar certificados |
| 25 | `WebhooksModule` | `webhooks/` | CRUD webhooks + dispatch con HMAC-SHA256, reintento |

### Fase 8 — Analytics, Export, Admin

| # | Módulo | Archivos | Descripción |
|---|--------|----------|-------------|
| 26 | `AnalyticsModule` | `analytics/` | Dashboard, métricas por mes, top cursos, asistencia, usuario stats |
| 27 | `ExportModule` | `export/` | CSV export: cursos, inscripciones, pagos, asistencias, certificados |
| 28 | `AuditLogsModule` | `audit-logs/` | Logs de auditoría: acción, entidad, datos previos/nuevos, IP |
| 29 | `OrganizacionesModule` | `organizaciones/` | Multi-tenant: organizaciones, miembros, planes, configuración |
| 30 | `PermissionsModule` | `permissions/` | Permisos granulares: crear, asignar a roles, verificar |

> **Total: 30 módulos** (incluyendo Auth y Users como base)

---

## Estructura del proyecto

```
evento-web/
├── docker-compose.yml                  # PostgreSQL + Redis + MinIO
├── Dockerfile                          # Multi-stage: Express + frontend (~40MB)
├── index.html                          # Entry HTML (Vite)
├── vite.config.js                      # Config Vite
├── package.json                        # Dependencias frontend
│
├── backend/                            # ═══ EXPRESS LEGACY :3001 ═══
│   ├── src/
│   │   ├── index.js                    # Entry + proxy → NestJS (/api/v2/*)
│   │   ├── config/database.js          # Conexión PostgreSQL (Sequelize)
│   │   ├── models/                     # Sequelize models (7 modelos)
│   │   ├── controllers/                # Controllers (7)
│   │   ├── routes/                     # Rutas REST
│   │   ├── middleware/                 # Auth JWT, validación, errorHandler
│   │   └── seeders/seed.js            # Datos de prueba
│   ├── uploads/                        # QR, firmas, logos (volumen)
│   └── .env
│
├── backend-next/                       # ═══ NESTJS NUEVO :3002 ═══
│   ├── src/
│   │   ├── main.ts                     # NestFactory bootstrap
│   │   ├── app.module.ts               # Root: 30 entidades + 30 módulos
│   │   ├── common/
│   │   │   ├── guards/                 # JwtAuthGuard, RolesGuard
│   │   │   └── decorators/             # @Roles() decorator
│   │   ├── auth/                       # JWT + Google OAuth2
│   │   ├── users/                      # CRUD + 12 roles
│   │   ├── cursos/                     # CRUD + paginación + imagen
│   │   ├── inscripciones/              # Solicitud + aprobación + cupos
│   │   ├── asistencias/                # Control de asistencia
│   │   ├── pagos/                      # Pagos + confirmación
│   │   ├── certificados/               # PDF + QR + validación
│   │   ├── plantillas/                 # Plantilla certificado (configurable)
│   │   ├── perfil/                     # Perfil asistente
│   │   ├── agenda/                     # Días + Salas + Bloques + Sesiones
│   │   ├── checkin/                    # QR/manual/geolocalización
│   │   ├── credenciales/               # Credencial PDF
│   │   ├── ponentes/                   # Perfil ponente
│   │   ├── expositores/                # Expositor + Productos
│   │   ├── patrocinadores/             # Patrocinador + Beneficios
│   │   ├── chat/                       # Conversaciones + Mensajes
│   │   ├── networking/                 # Match por intereses
│   │   ├── reuniones/                  # Reuniones + Participantes
│   │   ├── streaming/                  # Salas + Encuestas + Q&A
│   │   ├── gamificacion/               # Puntos + Badges + Ranking
│   │   ├── interaccion/                # Comentarios + Likes + Trivias
│   │   ├── cms/                        # Páginas + Blog + Galería + FAQ
│   │   ├── notificaciones/             # Notificaciones + Plantillas
│   │   ├── public-api/                 # API pública (sin auth)
│   │   ├── webhooks/                   # Webhooks + dispatch
│   │   ├── analytics/                  # Dashboard + métricas
│   │   ├── export/                     # CSV export
│   │   ├── audit-logs/                 # Logs de auditoría
│   │   ├── organizaciones/             # Multi-tenant
│   │   └── permissions/                # Permisos granulares
│   ├── .env.example
│   ├── tsconfig.json
│   ├── nest-cli.json
│   └── package.json
│
└── src/                                # ═══ FRONTEND REACT ═══
    ├── components/
    │   ├── Layout.jsx                  # Header + nav + theme toggle
    │   ├── ProtectedRoute.jsx          # Guard por auth/roles
    │   └── RichTextEditor.jsx          # Tiptap editor
    ├── context/
    │   ├── AuthContext.jsx             # JWT auth global
    │   ├── ThemeContext.jsx            # Dark/light mode
    │   └── NotificationContext.jsx     # Toast notifications
    ├── pages/
    │   ├── Landing.jsx                 # Hero + features + cursos + CTA
    │   ├── Login.jsx / Register.jsx    # Auth forms
    │   ├── CursosList.jsx / CursoDetail.jsx
    │   ├── MisInscripciones.jsx        # Estado + descarga cert
    │   ├── Dashboard.jsx               # Admin panel
    │   ├── AdminCursos.jsx             # CRUD cursos
    │   ├── AdminInscripciones.jsx      # Aprobar/rechazar
    │   ├── AdminCertificados.jsx       # Emitir + listar
    │   ├── AdminPlantillas.jsx         # Editor visual plantillas
    │   └── AdminUsuarios.jsx           # CRUD usuarios
    ├── services/api.js                 # HTTP client (fetch + JWT)
    ├── App.jsx                         # Router lazy loading
    ├── index.css                       # CSS variables + dark mode
    └── main.jsx
```

---

## Modelo de datos

```
┌──────────┐     ┌──────────────┐     ┌──────────┐
│   User   │─1:N─│ Inscripcion  │─N:1─│  Curso   │
│ (12 roles)│     │              │     │(3 estados)│
│          │     │ estudiante_id│     │          │
│ nombre   │     │ curso_id     │     │ nombre   │
│ email    │     │ estado       │     │descripción│
│ password │     └──────┬───────┘     │modalidad │
│ activo   │            │             │ categor. │
└──────────┘       ┌────┼────┐        └──────────┘
                   │    │    │
              ┌────▼┐ ┌▼────┐ ┌▼────────────┐
              │Pago │ │Asist│ │ Certificado  │
              │     │ │encia│ │              │
              │monto│ │pres.│ │ codigo       │
              │cuota│ │     │ │ qr_url       │
              │metodo│     │ │ horas        │
              └─────┘ └─────┘ │ fecha_emis.  │
                              └──────┬───────┘
                                     │
                              ┌──────▼───────┐
                              │  Plantilla   │
                              │  Certificado │
                              │              │
                              │ config (JSONB)│
                              │ posiciones   │
                              │ firma/logo   │
                              └──────────────┘

┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Agenda      │  │  Chat        │  │  Streaming   │
│              │  │              │  │              │
│ Dia→Bloque→  │  │ Conversacion │  │ SalaStream   │
│   Sesion     │  │ Mensaje      │  │ Encuesta     │
│ Sala (indep) │  │ Participante │  │ Respuesta    │
└──────────────┘  └──────────────┘  │ PreguntaQA   │
                                    └──────────────┘

┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Gamificacion│  │  CMS         │  │  Admin       │
│              │  │              │  │              │
│ PuntosHist   │  │ Pagina       │  │ AuditLog     │
│ Badge        │  │ BlogPost     │  │ Organizacion │
│ UsuarioBadge │  │ Galeria      │  │ Permission   │
│              │  │ FAQ          │  │ RolePerm     │
└──────────────┘  └──────────────┘  │ Webhook      │
                                    │ WebhookEvent │
┌──────────────┐  ┌──────────────┐  └──────────────┘
│  Reuniones   │  │  Notificac.  │
│              │  │              │
│ Reunion      │  │ Notificacion │
│ Participante │  │ PlantillaNot │
└──────────────┘  └──────────────┘
```

---

## Roles

### Express (3 roles — actual)

| Rol | Cursos | Inscripciones | Pagos | Certificados | Plantillas | Usuarios |
|-----|--------|---------------|-------|--------------|------------|----------|
| **Admin** | CRUD todo | Aprobar/rechazar | Confirmar | Emitir/descargar | CRUD | CRUD |
| **Docente** | CRUD propios | Ver los suyos | — | — | — | — |
| **Estudiante** | Ver | Solicitar/ver | — | Descargar | — | — |

### NestJS (12 roles — SaaS)

| Rol | Valor | Descripción | Permisos típicos |
|-----|-------|------------|-----------------|
| Admin | `admin` | Administrador global | Todo |
| Organizador | `organizador` | Crea/gestiona eventos | CRUD eventos, inscripciones |
| Coordinador | `coordinador` | Coordina actividades | Ver todo, gestionar agenda |
| Ponente | `ponente` | Speaker | Ver sus sesiones, asistentes |
| Expositor | `expositor` | Exhibidor | CRUD productos, stand |
| Patrocinador | `patrocinador` | Sponsor | Ver beneficios, estadísticas |
| Asistente | `asistente` | Participante | Inscribirse, ver agenda |
| Invitado | `invitado` | Guest list | Ver agenda, check-in |
| Check-in | `checkin` | Acreditación | Escanear QR, registrar asistencia |
| Moderador | `moderador` | Modera sesiones | Chat, Q&A, encuestas |
| Docente | `docente` | Compat. Express | CRUD cursos propios |
| Estudiante | `estudiante` | Compat. Express | Inscribirse, ver certificados |

### Sistema de permisos granulares

```
PermissionsModule permite:
  - Crear permisos: { nombre, clave, categoria }
  - Asignar a roles: POST /permissions/rol/admin { permission_id: 5 }
  - Verificar: permissionsService.tienePermiso('admin', 'cursos.create')
  - Consultar: GET /permissions/rol/admin → lista de permisos
```

---

## API Endpoints — Express (`/api/*`)

Producción activa. Frontend consume estos endpoints.

### Auth

| Método | Ruta | Auth | Body | Respuesta |
|--------|------|------|------|-----------|
| POST | `/api/auth/register` | No | `{ nombre, email, password, rol? }` | `{ token, user }` |
| POST | `/api/auth/login` | No | `{ email, password }` | `{ token, user }` |
| GET | `/api/auth/me` | JWT | — | `user` |
| PUT | `/api/auth/profile` | JWT | `{ nombre?, telefono? }` | `user` |

### Cursos

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/cursos` | Sí | Listar (`?page=1&pageSize=20`) |
| GET | `/api/cursos/:id` | Sí | Detalle con docente |
| POST | `/api/cursos` | Admin/Docente | Crear (FormData: imagen + JSON) |
| PUT | `/api/cursos/:id` | Admin/Docente | Actualizar |
| DELETE | `/api/cursos/:id` | Admin | Soft delete |
| PUT | `/api/cursos/:id/estado` | Admin | Cambiar estado |

### Inscripciones

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/inscripciones` | Estudiante | Solicitar |
| GET | `/api/inscripciones/mis` | Estudiante | Mis inscripciones |
| GET | `/api/inscripciones` | Admin/Docente | Listar todas |
| PUT | `/api/inscripciones/:id/aprobar` | Admin | Aprobar |
| PUT | `/api/inscripciones/:id/rechazar` | Admin | Rechazar |

### Pagos / Certificados / Plantillas / Usuarios

Ver sección detallada en la versión anterior del README o ejecutar `curl /api/health` para verificar el servidor.

---

## API Endpoints — NestJS (`/api/v2/*`)

**28 módulos, 100+ endpoints.** Accesibles vía proxy Express o directamente en `:3002` (desarrollo).

### Auth (`/api/v2/auth`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/auth/register` | No | Registro con nombre, email, password |
| POST | `/auth/login` | No | Login → JWT token |
| GET | `/auth/me` | JWT | Perfil del usuario actual |
| PUT | `/auth/profile` | JWT | Actualizar nombre, teléfono |
| GET | `/auth/google` | No | Redirect a Google OAuth2 |
| GET | `/auth/google/callback` | No | Callback de Google |

### Users (`/api/v2/usuarios`) — Admin

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/usuarios` | Listar (`?rol=&activo=&page=&pageSize=`) |
| GET | `/usuarios/estadisticas` | `{ total, activos, inactivos, porRol[] }` |
| GET | `/usuarios/:id` | Detalle |
| POST | `/usuarios` | Crear |
| PUT | `/usuarios/:id` | Actualizar |
| DELETE | `/usuarios/:id` | Eliminar |
| PUT | `/usuarios/:id/toggle` | Activar/desactivar |

### Cursos (`/api/v2/cursos`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/cursos` | Sí | Listar (paginación) |
| GET | `/cursos/:id` | Sí | Detalle |
| POST | `/cursos` | Admin/Docente | Crear (FormData) |
| PUT | `/cursos/:id` | Admin/Docente | Actualizar |
| DELETE | `/cursos/:id` | Admin | Soft delete |

### Inscripciones (`/api/v2/inscripciones`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/inscripciones` | Solicitar inscripción |
| GET | `/inscripciones/mis` | Mis inscripciones |
| GET | `/inscripciones` | Listar todas |
| PUT | `/inscripciones/:id/aprobar` | Aprobar |
| PUT | `/inscripciones/:id/rechazar` | Rechazar |

### Asistencias (`/api/v2/asistencias`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/asistencias` | Registrar asistencia |
| GET | `/asistencias/:cursoId/contar` | Contar presentes por curso |

### Pagos (`/api/v2/pagos`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/pagos` | Crear pago |
| GET | `/pagos` | Listar |
| PUT | `/pagos/:id/confirmar` | Confirmar |

### Certificados (`/api/v2/certificados`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/certificados/emitir` | Admin | Emitir (verifica 80% asistencia) |
| GET | `/certificados` | Sí | Listar |
| GET | `/certificados/validar/:codigo` | **No** | Validación pública |
| GET | `/certificados/:id/descargar` | Sí | Descargar PDF |

### Plantillas (`/api/v2/plantillas`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/plantillas` | Listar todas |
| GET | `/plantillas/default` | Plantilla por defecto |
| POST | `/plantillas` | Crear (FormData: config + firma + logo) |
| PUT | `/plantillas/:id` | Actualizar |
| DELETE | `/plantillas/:id` | Eliminar |

### Perfil Asistente (`/api/v2/perfil`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/perfil/mi-perfil` | Mi perfil completo |
| PUT | `/perfil/mi-perfil` | Actualizar perfil |
| GET | `/perfil/publico/:userId` | Perfil público |
| GET | `/perfil/admin/todos` | Todos (admin) |

### Agenda (`/api/v2/agenda`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/agenda/dias` | Crear día |
| POST | `/agenda/salas` | Crear sala |
| POST | `/agenda/bloques` | Crear bloque |
| POST | `/agenda/sesiones` | Crear sesión |
| GET | `/agenda/completa/:cursoId` | Árbol completo (día→bloque→sesión) |
| CRUD | `/agenda/dias/:id`, `/agenda/salas/:id`, etc. | Actualizar/eliminar |

### Check-in (`/api/v2/checkin`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/checkin/qr` | Generar datos QR |
| POST | `/checkin/scan` | Escanear QR |
| POST | `/checkin/manual` | Check-in manual |
| GET | `/checkin/sesion/:id` | Check-ins por sesión |
| GET | `/checkin/estadisticas/:cursoId` | Estadísticas |

### Credenciales (`/api/v2/credenciales`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/credenciales/emitir` | Emitir credencial |
| GET | `/credenciales/:id/descargar` | Descargar PDF con QR |
| GET | `/credenciales/validar/:codigo` | Validar credencial |
| GET | `/credenciales/mis` | Mis credenciales |

### Ponentes (`/api/v2/ponentes`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/ponentes/mi-perfil` | Mi perfil de ponente |
| PUT | `/ponentes/mi-perfil` | Actualizar |
| GET | `/ponentes` | Listar todos |
| GET | `/ponentes/:id` | Detalle |

### Expositores (`/api/v2/expositores`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/expositores/curso/:cursoId` | Crear expositor |
| GET | `/expositores/curso/:cursoId` | Listar por curso |
| POST | `/expositores/:id/productos` | Agregar producto |
| GET | `/expositores/:id/productos` | Listar productos |

### Patrocinadores (`/api/v2/patrocinadores`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/patrocinadores/curso/:cursoId` | Crear (categoria: platino/oro/plata/bronce) |
| GET | `/patrocinadores/curso/:cursoId` | Listar por curso |
| POST | `/patrocinadores/:id/beneficios` | Agregar beneficio |
| GET | `/patrocinadores/:id/beneficios` | Listar beneficios |

### Chat (`/api/v2/chat`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/chat/conversaciones` | Crear conversación |
| POST | `/chat/mensajes` | Enviar mensaje |
| GET | `/chat/mensajes/:convId` | Mensajes paginados |
| PUT | `/chat/mensajes/:convId/leer` | Marcar como leído |

### Networking (`/api/v2/networking`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/networking/sugerencias` | Sugerencias por intereses |
| POST | `/networking/solicitudes` | Enviar solicitud |
| PUT | `/networking/solicitudes/:id` | Aceptar/rechazar |

### Reuniones (`/api/v2/reuniones`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/reuniones` | Crear con participantes |
| GET | `/reuniones/mis` | Mis reuniones |
| PUT | `/reuniones/:id/estado` | Cambiar estado |

### Streaming (`/api/v2/streaming`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/streaming/salas` | Crear sala (zoom/teams/youtube/rtmp/webrtc) |
| POST | `/streaming/encuestas` | Crear encuesta |
| POST | `/streaming/encuestas/:id/votar` | Votar |
| GET | `/streaming/encuestas/:id/resultados` | Resultados |
| POST | `/streaming/preguntas` | Pregunta Q&A |
| POST | `/streaming/preguntas/:id/votar` | Votar pregunta |

### Gamificación (`/api/v2/gamificacion`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/gamificacion/puntos` | Agregar puntos (auto-badge) |
| GET | `/gamificacion/puntos/totales/:userId` | Total puntos |
| GET | `/gamificacion/puntos/historial/:userId` | Historial |
| GET | `/gamificacion/ranking` | Top usuarios |
| GET | `/gamificacion/badges` | Todos los badges |
| POST | `/gamificacion/badges` | Crear badge |

### Interacción (`/api/v2/interaccion`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/interaccion/comentarios` | Crear comentario |
| GET | `/interaccion/comentarios/:cursoId` | Listar por curso |
| DELETE | `/interaccion/comentarios/:id` | Eliminar |
| POST | `/interaccion/likes` | Toggle like |
| POST | `/interaccion/trivias` | Crear trivia |
| POST | `/interaccion/trivias/:id/responder` | Responder |

### CMS (`/api/v2/cms`) — Admin

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/cms/paginas` | Crear página |
| GET | `/cms/paginas` | Listar |
| PUT | `/cms/paginas/:id` | Actualizar |
| DELETE | `/cms/paginas/:id` | Eliminar |
| POST | `/cms/blog` | Crear post |
| GET | `/cms/blog` | Listar |
| PUT | `/cms/blog/:id` | Actualizar |
| DELETE | `/cms/blog/:id` | Eliminar |
| POST | `/cms/galeria` | Agregar media |
| GET | `/cms/galeria/curso/:cursoId` | Galería por curso |
| POST | `/cms/faqs` | Crear FAQ |
| PUT | `/cms/faqs/:id` | Actualizar |
| DELETE | `/cms/faqs/:id` | Eliminar |

### Notificaciones (`/api/v2/notificaciones`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/notificaciones/enviar` | Enviar a usuario |
| POST | `/notificaciones/enviar-masiva` | Enviar a varios |
| GET | `/notificaciones/mis` | Mis notificaciones |
| PUT | `/notificaciones/:id/leer` | Marcar leída |
| PUT | `/notificaciones/leer-todas` | Marcar todas |
| GET | `/notificaciones/no-leidas` | Conteo no leídas |
| POST | `/notificaciones/plantillas` | Crear plantilla |
| GET | `/notificaciones/plantillas` | Listar plantillas |

### API Pública (`/api/public`) — Sin auth

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/public/cursos` | Cursos publicados |
| GET | `/public/cursos/:id` | Detalle curso |
| GET | `/public/blog` | Blog posts publicados |
| GET | `/public/blog/:slug` | Post por slug |
| GET | `/public/faq/curso/:cursoId` | FAQs por curso |
| GET | `/public/faq/globales` | FAQs globales |
| GET | `/public/galeria/curso/:cursoId` | Galería por curso |
| GET | `/public/ponentes` | Directorio ponentes |
| GET | `/public/ponentes/:id` | Detalle ponente |
| GET | `/public/certificados/validar/:codigo` | Validar certificado |
| GET | `/public/plantilla-certificado` | Plantilla por defecto |

### Webhooks (`/api/v2/webhooks`) — Admin

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/webhooks` | Crear webhook |
| GET | `/webhooks` | Listar |
| PUT | `/webhooks/:id` | Actualizar |
| DELETE | `/webhooks/:id` | Eliminar |
| POST | `/webhooks/disparar` | Disparar evento manual |
| GET | `/webhooks/eventos` | Últimos 50 eventos |

### Analytics (`/api/v2/analytics`) — Admin

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/analytics/dashboard` | Resumen completo |
| GET | `/analytics/cursos-por-estado` | Conteo por estado |
| GET | `/analytics/inscripciones-por-mes` | Inscripciones históricas |
| GET | `/analytics/pagos-por-mes` | Ingresos por mes |
| GET | `/analytics/top-cursos` | Top cursos por inscripciones |
| GET | `/analytics/asistencia-curso/:id` | % asistencia por curso |
| GET | `/analytics/usuario/:id` | Stats de un usuario |

### Export (`/api/v2/export`) — Admin (CSV)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/export/cursos` | CSV cursos |
| GET | `/export/inscripciones` | CSV inscripciones |
| GET | `/export/inscripciones/curso/:id` | CSV inscripciones por curso |
| GET | `/export/pagos` | CSV pagos |
| GET | `/export/asistencias/curso/:id` | CSV asistencias por curso |
| GET | `/export/certificados` | CSV certificados |

### Audit Logs (`/api/v2/audit-logs`) — Admin

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/audit-logs` | Todos (paginado) |
| GET | `/audit-logs/entidad/:entidad` | Por entidad |
| GET | `/audit-logs/usuario/:id` | Por usuario |

### Organizaciones (`/api/v2/organizaciones`) — Multi-tenant

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/organizaciones` | Crear (admin) |
| GET | `/organizaciones` | Listar |
| GET | `/organizaciones/mis` | Mis organizaciones |
| GET | `/organizaciones/:id` | Detalle con miembros |
| PUT | `/organizaciones/:id` | Actualizar |
| POST | `/organizaciones/:id/miembros` | Agregar miembro |
| DELETE | `/organizaciones/:id/miembros/:userId` | Remover miembro |
| GET | `/organizaciones/:id/miembros` | Listar miembros |

### Permissions (`/api/v2/permissions`) — Admin

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/permissions` | Crear permiso |
| GET | `/permissions` | Listar todos |
| POST | `/permissions/rol/:rol` | Asignar permiso a rol |
| DELETE | `/permissions/rol/:rol/:permissionId` | Remover de rol |
| GET | `/permissions/rol/:rol` | Permisos de un rol |

---

## Funcionalidades por fase

### Fase 0 — Infraestructura
- Docker Compose (PostgreSQL 16, Redis 7, MinIO)
- NestJS scaffold con TypeScript
- Auth (register/login/me) + Users (CRUD, 12 roles)
- Proxy Express → NestJS (`/api/v2/*`)

### Fase 1 — Core
- Cursos CRUD + paginación + imagen upload + estados
- Inscripciones: solicitud, aprobación, cupos, auto-accept
- Pagos: crear, confirmar, desbloqueo automático
- Certificados: emitir (80% asistencia), PDF + QR, validar
- Plantillas: editor visual, posiciones configurables, firma/logo

### Fase 2 — Asistentes & Agenda
- Perfil asistente: empresa, cargo, bio, intereses, redes sociales
- Agenda jerárquica: día → bloque → sesión, salas independientes
- Check-in: QR, manual, geolocalización, estadísticas
- Credenciales: PDF con QR, validación

### Fase 3 — Ponentes, Expositores, Patrocinadores
- Perfil ponente: CV, especialidad, calificación
- Expositores: empresa, stand, productos con precios
- Patrocinadores: categorías (Platino/Oro/Plata/Bronce), beneficios

### Fase 4 — Networking & Streaming
- Chat privado/grupal con tracking de lectura
- Match por intereses con scoring
- Reuniones con participantes y estados
- Streaming: salas (Zoom/Teams/YouTube/RTMP/WebRTC), encuestas, Q&A

### Fase 5 — Gamificación & Interacción
- Puntos (8 fuentes) + badges automáticos + ranking
- Comentarios anidados + likes toggle
- Trivias con scoring y ranking por trivia

### Fase 6 — CMS & Notificaciones
- Páginas, Blog Posts, Galería, FAQs
- Notificaciones: enviar, masivas, leídas, plantillas

### Fase 7 — API Pública, Webhooks, PWA, OAuth2
- API pública sin auth (cursos, blog, ponentes, validación certificados)
- Webhooks con HMAC-SHA256 y reintento
- PWA: manifest.json + service worker
- OAuth2: Google login

### Fase 8 — Analytics, Export, Admin
- Dashboard: usuarios, cursos, inscripciones, pagos, certificados
- CSV export de todas las entidades
- Audit logs con datos previos/nuevos
- Organizaciones multi-tenant con miembros y planes
- Permisos granulares por rol

---

## Instalación local

### Requisitos

- Node.js 20+
- npm
- Docker + Docker Compose (recomendado)

### Paso 1 — Clonar

```bash
git clone https://github.com/brandall2021/evento.git
cd evento-web
```

### Paso 2 — Infraestructura

```bash
docker compose up -d

# Verificar
docker compose ps
# NAME                    STATUS
# evento-web-postgres-1   Up (healthy)
# evento-web-redis-1      Up
# evento-web-minio-1      Up
```

### Paso 3 — Backend Express

```bash
cd backend
npm install
npm run seed   # 5 usuarios + 5 cursos de prueba
npm run dev
# → http://localhost:3001
```

### Paso 4 — Backend NestJS

```bash
cd ../backend-next
npm install
cp .env.example .env
npm run start:dev
# → http://localhost:3002
```

### Paso 5 — Frontend

```bash
cd ..
npm install --legacy-peer-deps
npm run dev
# → http://localhost:5173
```

### Verificación

1. Abrir `http://localhost:5173` → landing page
2. Registrarse con email nuevo
3. Login → explorar cursos
4. Como admin (`admin@evento.com` / `admin123`): admin, certificados, plantillas, usuarios

---

## Variables de entorno

### Backend Express (`backend/.env`)

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

### Backend NestJS (`backend-next/.env`)

```env
PORT=3002
DB_HOST=localhost
DB_PORT=5432
DB_NAME=evento_web
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=evento-web-secret-key-2026    # MISMO que Express
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173,http://localhost:3001
REDIS_HOST=localhost
REDIS_PORT=6379
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin

# Google OAuth2 (opcional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:3002/api/auth/google/callback
```

### Frontend (solo desarrollo)

```env
VITE_API_URL=http://localhost:3001/api
```

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
docker build -t evento-web:latest .

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
  -e NESTJS_URL=http://nestjs-interno:3002 \
  evento-web:latest

# Seed
docker exec evento-web sh -c "cd /app/backend && npm run seed"
```

### Dockerfile

```dockerfile
# Stage 1: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY backend/package*.json ./backend/
RUN npm ci --legacy-peer-deps
RUN cd backend && npm ci
COPY . .
RUN npm run build

# Stage 2: Production (~40MB)
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/backend ./backend
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/backend/node_modules ./backend/node_modules
RUN mkdir -p /app/backend/uploads/cursos
WORKDIR /app/backend
ENV NODE_ENV=production
ENV PORT=3001
EXPOSE 3001
VOLUME ["/app/backend/uploads"]
CMD ["node", "src/index.js"]
```

---

## Despliegue con Dokploy

Guía completa paso a paso para desplegar en un VPS con Dokploy.

### Arquitectura en Dokploy

```
┌─────────────────────────────────────────────────────┐
│                    Dokploy (VPS)                     │
│                                                      │
│  ┌──────────────┐    ┌──────────────────────────┐   │
│  │  evento-web  │    │       evento-db           │   │
│  │  (App)       │────│  (PostgreSQL 16)          │   │
│  │  Express:3001│    │  :5432                    │   │
│  │  + frontend  │    │                           │   │
│  │  en dist/    │    │  DB: evento_web           │   │
│  └──────┬───────┘    └──────────────────────────┘   │
│         │                                           │
│  ┌──────▼───────┐    ┌──────────────────────────┐   │
│  │  Domain      │    │  Volume: uploads          │   │
│  │  SSL (LE)    │    │  /app/backend/uploads     │   │
│  │  HTTPS       │    │  (persiste reinicios)     │   │
│  └──────────────┘    └──────────────────────────┘   │
│                                                      │
│  ┌──────────────┐  (Opcional — futuro)              │
│  │  NestJS      │  Deploy como segundo servicio     │
│  │  :3002       │  Conectado a mismo DB             │
│  └──────────────┘                                   │
└─────────────────────────────────────────────────────┘
```

### Requisitos previos

| Requisito | Detalle |
|-----------|---------|
| Servidor VPS | Ubuntu 22.04+, mínimo 2GB RAM, 20GB SSD |
| Docker | Instalado en el servidor |
| Dokploy | [Guía de instalación](https://dokploy.com/docs/install) |
| Dominio | DNS apuntando al servidor |
| GitHub | Repo: `https://github.com/brandall2012/evento` |

### Paso 1 — Instalar Dokploy

```bash
ssh root@IP_DEL_SERVIDOR
curl -fsSL https://dokploy.com/install.sh | sh
```

El instalador imprime la URL del panel (generalmente `https://IP:3000`).

**Configuración inicial:**
1. Crear usuario admin (email + password)
2. Ir a Settings → verificar Docker

### Paso 2 — Crear proyecto

1. Menú lateral → **Projects** → **Create Project**
2. **Name:** `evento-web`
3. **Description:** `Plataforma de gestión de eventos`
4. Create

### Paso 3 — Conectar repositorio GitHub

1. Dentro del proyecto → pestaña **Configuration** → sección **Git**
2. Completar:
   - **Repository URL:** `https://github.com/brandall2021/evento.git`
   - **Branch:** `master`
3. Si el repo es **privado**:
   - GitHub → Settings → Developer settings → **Personal access tokens**
   - Crear token con permiso `repo`
   - En Dokploy: **Auth Type** → `Token` → pegar el token
4. **Save** → verificar que muestra los commits recientes

### Paso 4 — Configurar dominio

1. Pestaña **Domains** → **Add Domain**
2. Completar:
   - **Service Name:** `evento-web`
   - **Host:** `evento.tudominio.com`
   - **HTTPS:** Activar (Let's Encrypt automático)
3. **Add**

**Configurar DNS** (Cloudflare, Namecheap, etc.):

```
Tipo:    A
Nombre:  evento
Valor:   IP_DEL_SERVIDOR
TTL:     Auto
```

**Cloudflare importante:**
- Modo: **DNS Only** (icono nube en GRIS, no naranja)
- SSL/TLS: **Full (strict)**
- NO activar proxy Cloudflare al inicio

Verificar DNS:
```bash
dig evento.tudominio.com
# Debe devolver la IP del servidor
```

### Paso 5 — Agregar servicio PostgreSQL

1. Menú lateral → **PostgreSQL** → **Create PostgreSQL**
2. Completar:
   - **Service Name:** `evento-db`
   - **Database Name:** `evento_web`
   - **Database User:** `postgres`
   - **Password:** generar segura:
     ```bash
     openssl rand -hex 16
     # Ejemplo: a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6
     ```
   - **Database Port:** `5432`
3. **Create**

**Anotar credenciales:**

| Dato | Valor |
|------|-------|
| Host | `evento-db` |
| Puerto | `5432` |
| Usuario | `postgres` |
| Password | *(la que generaste)* |
| Database | `evento_web` |

**Vincular al proyecto:**
1. Dentro del proyecto → **Service Links** o **Linked Services**
2. **Link Service** → seleccionar `evento-db`
3. Esto hace que `evento-db` esté disponible como hostname dentro del contenedor

### Paso 6 — Variables de entorno

Pestaña **Environment** → **Add Variable** por cada una:

| # | Variable | Valor | Notas |
|---|----------|-------|-------|
| 1 | `PORT` | `3001` | Puerto del contenedor |
| 2 | `DB_HOST` | `evento-db` | **NO** usar `localhost`. Usar el nombre del servicio |
| 3 | `DB_PORT` | `5432` | Puerto PostgreSQL |
| 4 | `DB_NAME` | `evento_web` | Nombre de la base |
| 5 | `DB_USER` | `postgres` | Usuario PostgreSQL |
| 6 | `DB_PASSWORD` | *(tu contraseña)* | La misma del paso 5 |
| 7 | `JWT_SECRET` | *(generar)* | `openssl rand -hex 32` — **NUNCA** usar el de desarrollo |
| 8 | `JWT_EXPIRES_IN` | `7d` | Duración tokens |
| 9 | `API_URL` | `https://evento.tudominio.com` | URL pública con `https://` |
| 10 | `CORS_ORIGIN` | `https://evento.tudominio.com` | Mismo que API_URL |
| 11 | `NESTJS_URL` | *(vacío por ahora)* | Se configura cuando NestJS esté en producción |

> **Importante:** El `JWT_SECRET` debe ser **exactamente el mismo** en cada reinicio. Si cambia, todos los tokens se invalidan. Generarlo una vez con `openssl rand -hex 32` y reusarlo.

### Paso 7 — Puerto y health check

1. Pestaña **Configuration**
2. **Ports / Expose:**
   - **Container Port:** `3001`
   - **Protocol:** TCP
3. **Health Check:**
   - **Path:** `/api/health`
   - **Port:** `3001`
   - **Interval:** `30`
   - **Timeout:** `5`
   - **Retries:** `3`

### Paso 8 — Volumen para uploads

Los archivos (QR, firmas, logos) se guardan en `backend/uploads/`. Sin volumen persistente se pierden al reiniciar.

1. Pestaña **Advanced** → **Volumes**
2. Agregar:
   - **Mount Path:** `/app/backend/uploads`
   - **Type:** `Volume`
   - **Name:** `evento-uploads`

O con ruta específica:
   - **Type:** `Bind`
   - **Host Path:** `/opt/evento-uploads`

### Paso 9 — Desplegar

1. Pestaña **Deployments** → **Deploy**
2. Esperar build (~2-5 min)
3. Verificar logs en tiempo real:
   - Buscar: `Server running on http://localhost:3001`
   - Buscar: `DB connected`
4. Si hay errores → **Build Logs**

### Paso 10 — Seed de datos iniciales

**Desde Dokploy:**
1. Pestaña **Terminal** → servicio `evento-web`
2. Ejecutar:
   ```bash
   cd /app/backend && npm run seed
   ```

**Desde SSH:**
```bash
docker ps --filter "name=evento-web"
docker exec -it <CONTAINER_ID> sh -c "cd /app/backend && npm run seed"
```

### Paso 11 — Verificar

```bash
# Health check
curl https://evento.tudominio.com/api/health
# → {"ok":true}

# Login
curl -X POST https://evento.tudominio.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@evento.com","password":"admin123"}'
# → {"token":"eyJ...","user":{...}}

# Frontend
# Abrir https://evento.tudominio.com → landing page
```

### Paso 12 — Auto-deploy (push to deploy)

**Opción A — Dokploy SSH Key:**
1. Dokploy → Settings → SSH Keys → copiar public key
2. GitHub → Settings → Deploy keys → agregar con permiso lectura
3. Activar **Auto Deploy** en el proyecto

**Opción B — GitHub Webhook:**
1. GitHub → Settings → Webhooks → Add webhook
2. **Payload URL:** `https://TU-SERVIDOR:3000/api/deploy-webhook?token=TU_TOKEN`
3. **Content type:** `application/json`
4. **Events:** `Just the push event`

### Desplegar NestJS (futuro)

Cuando NestJS esté listo para producción, desplegar como segundo servicio:

1. **Create Service** → `evento-api`
2. **Repository:** mismo repo
3. **Build Command:** `cd backend-next && npm ci && npx nest build`
4. **Start Command:** `cd backend-next && node dist/main.js`
5. **Port:** `3002`
6. **Variables de entorno:** las mismas que Express (mismo DB, mismo JWT_SECRET)
7. Vincular al mismo `evento-db`
8. Actualizar `NESTJS_URL` en el servicio `evento-web` → `http://evento-api:3002`

---

## Troubleshooting

| # | Problema | Causa | Solución |
|---|----------|-------|----------|
| 1 | Build falla: `peer dep` | React 19 vs Tiptap | Verificar `--legacy-peer-deps` en Dockerfile |
| 2 | `ECONNREFUSED 127.0.0.1:5432` | `DB_HOST=localhost` | Usar `DB_HOST=evento-db` (nombre servicio) |
| 3 | Frontend muestra 404 | Build de Vite falló | Revisar build logs, `npm run build` local |
| 4 | `CORS error` | Dominio no en CORS_ORIGIN | Agregar `https://evento.tudominio.com` |
| 5 | `jwt malformed` | JWT_SECRET cambió | Usar el MISMO secret siempre |
| 6 | Archivos se pierden | Sin volumen persistente | Configurar volumen `/app/backend/uploads` |
| 7 | Build lento (>10min) | Poca RAM | Mínimo 2GB RAM para Docker build |
| 8 | `ECONNREFUSED` Redis/MinIO | No están en Dokploy | Ignorar (solo desarrollo por ahora) |
| 9 | Proxy `/api/v2/*` retorna 502 | NestJS no corriendo | Solo desarrollo por ahora |
| 10 | SSL no funciona | DNS no propagado | Esperar 5-10 min, verificar con `dig` |

### Revisar logs en Dokploy

1. Proyecto → pestaña **Logs**
2. Mensajes clave:
   - `DB connected` — PostgreSQL OK
   - `Server running on http://localhost:3001` — Express OK
   - `Startup error:` — Revisar variables de entorno
   - `ECONNREFUSED` — No puede conectar a PostgreSQL

### Reiniciar

- Dokploy: **Deployments** → **Redeploy**
- SSH: `docker restart <CONTAINER_ID>`

### Verificar variables

```bash
docker exec -it <CONTAINER_ID> env | grep -E "DB_|JWT_|PORT"
```

---

## Roadmap

### Completado

- [x] **Fase 0** — Infraestructura: Docker Compose, NestJS scaffold, Auth + Users, proxy
- [x] **Fase 1** — Core: Cursos, Inscripciones, Pagos, Certificados, Plantillas
- [x] **Fase 2** — Asistentes & Agenda: Perfil, Agenda jerárquica, Check-in, Credenciales
- [x] **Fase 3** — Ponentes, Expositores, Patrocinadores con beneficios
- [x] **Fase 4** — Networking & Streaming: Chat, Match, Reuniones, Salas + Encuestas + Q&A
- [x] **Fase 5** — Gamificación & Interacción: Puntos, Badges, Ranking, Comentarios, Likes, Trivias
- [x] **Fase 6** — CMS & Notificaciones: Páginas, Blog, Galería, FAQ, Notificaciones con plantillas
- [x] **Fase 7** — API Pública, Webhooks, PWA, OAuth2 Google
- [x] **Fase 8** — Analytics, Export CSV, Audit Logs, Organizaciones multi-tenant, Permisos granulares

### Próximos pasos

- [ ] Desplegar NestJS como servicio separado en Dokploy
- [ ] Aplicar branding LACDI (colores hex + logo)
- [ ] Tests unitarios para módulos core
- [ ] Integración WebSocket (chat en tiempo real)
- [ ] Integración Redis para caching
- [ ] MinIO para storage de archivos
- [ ] App móvil (React Native o Flutter)
- [ ] OpenAPI/Swagger para documentación de API

---

## Licencia

MIT
