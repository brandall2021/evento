# Spec: Evento — Fase 1: Infraestructura Base

**Fecha:** 2026-08-18
**Proyecto:** evento-web
**Branch:** `feat/fase1-infraestructura`
**Estado:** Borrador — pendiente revisión del usuario

---

## 1. Objetivo

Establecer los cimientos de la plataforma multiinstitucional de gestión de eventos académicos. Esta fase construye la infraestructura sobre la que se apoyarán todas las fases posteriores (eventos, inscripciones, pagos, certificados, etc.).

**Criterio de aceptación de la fase:** Un usuario puede registrarse, loguearse, obtener un token JWT válido, y acceder a endpoints protegidos según su rol. La base de datos tiene el schema multi-tenant preparado. El frontend consume la API correctamente.

---

## 2. Alcance de la Fase 1

### Incluido
- Schema multi-tenant en PostgreSQL (nuevo schema `evento`)
- TypeORM migraciones versionadas
- Módulo Auth (registro, login, refresh, logout, me)
- Módulo Users (CRUD, asociación a roles)
- Módulo Roles (CRUD, asociación a permisos)
- Módulo Permissions (catálogo de permisos)
- Módulo Tenants (CRUD instituciones)
- Frontend Next.js con App Router, Tailwind, shadcn/ui
- Login/Register/ Dashboard básico
- Jest unit tests + integration tests
- Playwright E2E smoke test

### Excluido (fases posteriores)
- Eventos, módulos, actividades, salas, ponentes
- Inscripciones, formularios dinámicos, cupos
- Pagos, Mercado Pago
- Credenciales, QR, acreditación
- Asistencia, evaluaciones, certificados
- Encuestas, notificaciones, reportes, exports

### Nota sobre módulos existentes
Los 33 módulos NestJS existentes (cursos, inscripciones, pagos, etc.) **se mantienen intactos** durante la Fase 1. Solo se refactorizan auth, users, permissions y audit-logs. Los módulos existentes seguirán funcionando con `synchronize: true` hasta que se migren a migraciones versionadas en sus respectivas fases.

---

## 3. Arquitectura

```
┌──────────────────────────────────────────┐
│              FRONTEND                    │
│         Next.js 15 (App Router)          │
│    Tailwind CSS + shadcn/ui + Zod        │
│         TanStack Query                   │
└──────────────────┬───────────────────────┘
                   │ HTTPS / REST
┌──────────────────▼───────────────────────┐
│              BACKEND                     │
│           NestJS 11 + TypeORM            │
│  /api/v1/*  (JWT, RBAC, DTOs, Guards)    │
└──────┬───────────────┬───────────────────┘
       │               │
┌──────▼──────┐ ┌──────▼──────┐
│ PostgreSQL  │ │   Redis     │
│  schema:    │ │  cache +    │
│  evento     │ │  sessions   │
└─────────────┘ └─────────────┘
```

### Decisiones arquitectónicas

| Decisión | Elección | Razón |
|----------|----------|-------|
| Schema DB | `evento` (nuevo, misma instancia) | Separar datos de otros proyectos sin另一个 instancia |
| API versioning | `/api/v1` | Consistencia, evolución sin breaking changes |
| Auth | JWT access + refresh tokens | Stateless, escalable, estándar |
| RBAC | User → Role → Permission (3 tablas) | Flexible, permisos granulares sin hardcodear |
| Frontend | Next.js App Router | SSR/SSG para páginas públicas, RSC, loading states |
| UI | shadcn/ui + Tailwind | Componentes accionables, no una librería black-box |
| Forms | React Hook Form + Zod | Validación type-safe, rendimiento |
| Data fetching | TanStack Query | Cache, invalidation, optimistic updates |
| Testing | Jest + Playwright | Unit + E2E |

---

## 4. Multi-tenancy

### Estrategia: Shared database, discriminator column

Cada tabla lleva `tenant_id UUID NOT NULL`. Todas las queries incluyen `WHERE tenant_id = ?`. Un middleware/interceptor de NestJS extrae el tenant del JWT y lo inyecta automáticamente.

### Tabla tenants

```sql
CREATE TABLE evento.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  domain VARCHAR(255),
  logo_url TEXT,
  settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
```

### Reglas
- Un usuario puede pertenecer a múltiples tenants (tabla pivote `user_tenants`)
- El JWT contiene `tenant_id` y `roles` por tenant
- Todas las queries administrativas filtran por `tenant_id`
- Las rutas públicas (`/api/v1/public/*`) no requieren tenant en el JWT

---

## 5. Modelo de datos — Fase 1

### 5.1 Enums PostgreSQL

```sql
-- Roles predefinidos (catálogo, extensible)
CREATE TYPE evento.user_role AS ENUM (
  'super_admin', 'admin', 'organizador', 'coordinador',
  'docente', 'ponente', 'asistente', 'invitado',
  'checkin', 'moderador', 'expositor', 'estudiante'
);

-- Acciones de auditoría
CREATE TYPE evento.audit_action AS ENUM (
  'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT',
  'REGISTER', 'PASSWORD_CHANGE', 'ROLE_CHANGE',
  'TENANT_SWITCH', 'EXPORT', 'BULK_IMPORT'
);
```

### 5.2 Tablas

#### tenants
```sql
CREATE TABLE evento.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  domain VARCHAR(255),
  logo_url TEXT,
  banner_url TEXT,
  settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_tenants_slug ON evento.tenants(slug);
CREATE INDEX idx_tenants_domain ON evento.tenants(domain);
```

#### users
```sql
CREATE TABLE evento.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_users_email ON evento.users(email);
```

#### roles
```sql
CREATE TABLE evento.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES evento.tenants(id),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_system BOOLEAN DEFAULT false, -- roles del sistema no se borran
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(tenant_id, name)
);

CREATE INDEX idx_roles_tenant ON evento.roles(tenant_id);
```

#### permissions
```sql
CREATE TABLE evento.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(100) NOT NULL UNIQUE, -- ej: 'event.create'
  module VARCHAR(50) NOT NULL,       -- ej: 'events'
  action VARCHAR(50) NOT NULL,       -- ej: 'create'
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_permissions_module ON evento.permissions(module);
```

#### role_permissions
```sql
CREATE TABLE evento.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES evento.roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES evento.permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(role_id, permission_id)
);

CREATE INDEX idx_role_permissions_role ON evento.role_permissions(role_id);
```

#### user_tenants (pivote)
```sql
CREATE TABLE evento.user_tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES evento.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES evento.tenants(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(user_id, tenant_id)
);

CREATE INDEX idx_user_tenants_user ON evento.user_tenants(user_id);
CREATE INDEX idx_user_tenants_tenant ON evento.user_tenants(tenant_id);
```

#### user_roles (por tenant)
```sql
CREATE TABLE evento.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES evento.users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES evento.roles(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES evento.tenants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(user_id, role_id, tenant_id)
);

CREATE INDEX idx_user_roles_user ON evento.user_roles(user_id);
CREATE INDEX idx_user_roles_tenant ON evento.user_roles(tenant_id);
```

#### refresh_tokens
```sql
CREATE TABLE evento.refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES evento.users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  revoked_at TIMESTAMPTZ
);

CREATE INDEX idx_refresh_tokens_user ON evento.refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_hash ON evento.refresh_tokens(token_hash);
```

#### audit_logs
```sql
CREATE TABLE evento.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES evento.tenants(id),
  user_id UUID REFERENCES evento.users(id),
  action evento.audit_action NOT NULL,
  entity VARCHAR(100) NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_audit_logs_tenant ON evento.audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_user ON evento.audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON evento.audit_logs(entity, entity_id);
CREATE INDEX idx_audit_logs_created ON evento.audit_logs(created_at);
```

### 5.3 Diagrama ER (Fase 1)

```
tenants
  │
  ├── user_tenants ──── users
  │                       │
  ├── roles               ├── refresh_tokens
  │     │                 │
  │     ├── role_permissions
  │     │         │
  │     └─────────┘
  │               │
  └── audit_logs ←┘
```

### 5.4 Permisos predefinidos

```sql
INSERT INTO evento.permissions (code, module, action, description) VALUES
-- Auth
('auth.register', 'auth', 'register', 'Registrar usuario'),
('auth.login', 'auth', 'login', 'Iniciar sesión'),
('auth.refresh', 'auth', 'refresh', 'Refrescar token'),

-- Users
('user.read', 'users', 'read', 'Ver usuarios'),
('user.create', 'users', 'create', 'Crear usuario'),
('user.update', 'users', 'update', 'Editar usuario'),
('user.delete', 'users', 'delete', 'Eliminar usuario'),

-- Roles
('role.read', 'roles', 'read', 'Ver roles'),
('role.create', 'roles', 'create', 'Crear rol'),
('role.update', 'roles', 'update', 'Editar rol'),
('role.delete', 'roles', 'delete', 'Eliminar rol'),

-- Tenants
('tenant.read', 'tenants', 'read', 'Ver instituciones'),
('tenant.create', 'tenants', 'create', 'Crear institución'),
('tenant.update', 'tenants', 'update', 'Editar institución'),
('tenant.delete', 'tenants', 'delete', 'Eliminar institución'),

-- Audit
('audit.read', 'audit', 'read', 'Ver logs de auditoría'),
('audit.export', 'audit', 'export', 'Exportar logs de auditoría');
```

### 5.5 Roles predefinidos por tenant

Al crear un tenant nuevo, se crean estos roles:
- `admin` — todos los permisos
- `organizador` — CRUD eventos + lectura
- `docente` — lectura eventos +写入 asistencia
- `asistente` — solo lectura propia
- `checkin` —写入 asistencia + lectura

---

## 6. Backend — Módulos Fase 1

### 6.1 Estructura

```
backend-next/src/
├── app.module.ts              # Root module (actualizar con nuevos módulos)
├── main.ts                    # Bootstrap (actualizar)
├── common/
│   ├── guards/
│   │   ├── jwt-auth.guard.ts        # (existente, refactorizar)
│   │   ├── roles.guard.ts           # (existente, refactorizar)
│   │   └── tenant.guard.ts          # NUEVO: extrae tenant del JWT
│   ├── decorators/
│   │   ├── roles.decorator.ts       # (existente)
│   │   ├── permissions.decorator.ts # NUEVO: @Permissions('event.create')
│   │   ├── current-user.decorator.ts# NUEVO: @CurrentUser() param decorator
│   │   └── tenant.decorator.ts      # NUEVO: @TenantId() param decorator
│   ├── interceptors/
│   │   └── audit.interceptor.ts     # NUEVO: registra cambios automáticamente
│   ├── middleware/
│   │   └── tenant.middleware.ts     # NUEVO: inyecta tenant_id
│   ├── dto/
│   │   └── pagination.dto.ts        # NUEVO: PageDto, PaginatedResponseDto
│   └── interfaces/
│       └── tenant-request.ts        # NUEVO: RequestWithTenant
├── auth/                            # REFACTORIZAR
│   ├── auth.module.ts
│   ├── auth.controller.ts           # /api/v1/auth/*
│   ├── auth.service.ts
│   ├── dto/
│   │   ├── register.dto.ts          # email, password, firstName, lastName
│   │   ├── login.dto.ts             # email, password
│   │   └── refresh.dto.ts           # refreshToken
│   ├── strategies/
│   │   └── jwt.strategy.ts          # (existente, refactorizar)
│   └── auth.service.spec.ts
├── users/                           # REFACTORIZAR
│   ├── users.module.ts
│   ├── users.controller.ts          # /api/v1/users/*
│   ├── users.service.ts
│   ├── entities/
│   │   └── user.entity.ts           # (existente, refactorizar)
│   ├── dto/
│   │   ├── create-user.dto.ts
│   │   ├── update-user.dto.ts
│   │   └── user-response.dto.ts
│   └── users.service.spec.ts
├── roles/                           # NUEVO (refactorizar desde permissions/)
│   ├── roles.module.ts
│   ├── roles.controller.ts          # /api/v1/roles/*
│   ├── roles.service.ts
│   ├── entities/
│   │   ├── role.entity.ts
│   │   └── role-permission.entity.ts
│   ├── dto/
│   │   ├── create-role.dto.ts
│   │   └── update-role.dto.ts
│   └── roles.service.spec.ts
├── permissions/                     # REFACTORIZAR
│   ├── permissions.module.ts
│   ├── permissions.controller.ts    # /api/v1/permissions/*
│   ├── permissions.service.ts
│   ├── entities/
│   │   └── permission.entity.ts
│   └── permissions.service.spec.ts
├── tenants/                         # NUEVO
│   ├── tenants.module.ts
│   ├── tenants.controller.ts        # /api/v1/tenants/*
│   ├── tenants.service.ts
│   ├── entities/
│   │   └── tenant.entity.ts
│   ├── dto/
│   │   ├── create-tenant.dto.ts
│   │   └── update-tenant.dto.ts
│   └── tenants.service.spec.ts
└── audit/                           # REFACTORIZAR (ya existe audit-logs/)
    ├── audit.module.ts
    ├── audit.controller.ts          # /api/v1/audit/*
    ├── audit.service.ts
    ├── entities/
    │   └── audit-log.entity.ts
    └── audit.service.spec.ts
```

### 6.2 Endpoints — Fase 1

#### Auth
```
POST   /api/v1/auth/register        # { email, password, firstName, lastName }
POST   /api/v1/auth/login            # { email, password } → { access_token, refresh_token, user }
POST   /api/v1/auth/refresh          # { refresh_token } → { access_token, refresh_token }
POST   /api/v1/auth/logout           # revoca refresh token
GET    /api/v1/auth/me               # usuario actual con roles y permisos
```

#### Users
```
GET    /api/v1/users                 # lista paginada (admin)
GET    /api/v1/users/:id             # detalle usuario
POST   /api/v1/users                 # crear usuario (admin)
PATCH  /api/v1/users/:id             # actualizar usuario
DELETE /api/v1/users/:id             # soft delete (admin)
POST   /api/v1/users/:id/roles       # asignar rol { roleId, tenantId }
DELETE /api/v1/users/:id/roles/:roleId # revocar rol
```

#### Roles
```
GET    /api/v1/roles                 # lista roles del tenant
GET    /api/v1/roles/:id             # detalle con permisos
POST   /api/v1/roles                 # crear rol { name, permissionIds[] }
PATCH  /api/v1/roles/:id             # actualizar
DELETE /api/v1/roles/:id             # (no roles del sistema)
POST   /api/v1/roles/:id/permissions # asignar permisos { permissionIds[] }
```

#### Permissions
```
GET    /api/v1/permissions           # lista todos los permisos
GET    /api/v1/permissions/:id       # detalle
# No CRUD — permisos se.seedean desde código
```

#### Tenants
```
GET    /api/v1/tenants               # lista (super_admin)
GET    /api/v1/tenants/:id           # detalle
POST   /api/v1/tenants               # crear (super_admin)
PATCH  /api/v1/tenants/:id           # actualizar (admin del tenant)
DELETE /api/v1/tenants/:id           # soft delete (super_admin)
```

#### Health
```
GET    /api/v1/health                # { status: 'ok', timestamp }
GET    /api/v1/health/database       # { status: 'ok', latency }
GET    /api/v1/health/redis          # { status: 'ok', latency }
```

### 6.3 JWT Payload

```typescript
{
  sub: string;        // user_id
  email: string;
  tenant_id: string;  // tenant activo
  roles: string[];    // roles del usuario en ese tenant
  permissions: string[]; // permisos aplanados
  iat: number;
  exp: number;
}
```

### 6.5 Rate Limiting

| Endpoint | Límite | Ventana |
|----------|--------|---------|
| POST /auth/login | 10 req | 15 min |
| POST /auth/register | 5 req | 15 min |
| POST /auth/refresh | 20 req | 15 min |
| GET /health/* | Sin límite | — |
| Otros endpoints | 100 req | 15 min |

Implementar con `@nestjs/throttler`. Rate limit por IP y por tenant.

### 6.6 Refresh Token Flow

```
Login → access_token (15min) + refresh_token (7 días)
         │
         ▼
Access token expira → 401
         │
         ▼
POST /auth/refresh con refresh_token
         │
         ▼
Nuevo access_token + nuevo refresh_token
(refresh anterior queda revocado)
```

---

## 7. Frontend — Fase 1

### 7.1 Stack

| Paquete | Versión | Uso |
|---------|---------|-----|
| next | 15 | Framework React con App Router |
| react | 19 | UI library |
| tailwindcss | 4 | Utility-first CSS |
| @shadcn/ui | latest | Componentes UI |
| react-hook-form | 7 | Formularios |
| zod | 3 | Validación schemas |
| @tanstack/react-query | 5 | Data fetching + cache |
| lucide-react | latest | Iconos |
| next-themes | latest | Dark/light mode |

### 7.2 Estructura

```
src/
├── app/
│   ├── layout.tsx                    # Root layout (providers, fonts)
│   ├── page.tsx                      # Landing / redirect
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx                # Sidebar + header
│   │   ├── dashboard/page.tsx        # Home dashboard
│   │   ├── users/page.tsx
│   │   ├── roles/page.tsx
│   │   ├── tenants/page.tsx
│   │   └── settings/page.tsx
│   └── api/                          # (si se usa API routes)
├── components/
│   ├── ui/                           # shadcn/ui components
│   ├── layout/
│   │   ├── sidebar.tsx
│   │   ├── header.tsx
│   │   └── providers.tsx             # QueryClientProvider, ThemeProvider, AuthProvider
│   └── shared/
│       ├── data-table.tsx            # Generic table with pagination
│       ├── loading-spinner.tsx
│       └── error-boundary.tsx
├── lib/
│   ├── api.ts                        # Axios/fetch client con JWT interceptor
│   ├── auth.ts                       # Auth helpers (getToken, setToken, etc.)
│   ├── utils.ts                      # cn(), formatDate, etc.
│   └── validations/
│       ├── auth.ts                   # Zod schemas para login/register
│       ├── users.ts
│       ├── roles.ts
│       └── tenants.ts
├── hooks/
│   ├── use-auth.ts                   # useAuth() hook
│   ├── use-users.ts                  # useUsers(), useUser(id), useCreateUser(), etc.
│   ├── use-roles.ts
│   └── use-tenants.ts
└── types/
    ├── api.ts                        # PaginatedResponse<T>, ApiResponse<T>
    ├── user.ts
    ├── role.ts
    ├── permission.ts
    └── tenant.ts
```

### 7.3 Páginas Fase 1

| Ruta | Descripción | Auth | Roles |
|------|-------------|------|-------|
| `/login` | Formulario login | No | Público |
| `/register` | Formulario registro | No | Público |
| `/dashboard` | Resumen (placeholder) | Sí | Cualquier rol |
| `/users` | CRUD usuarios | Sí | admin |
| `/roles` | CRUD roles | Sí | admin |
| `/tenants` | CRUD instituciones | Sí | super_admin |
| `/settings` | Configuración propia | Sí | Cualquier rol |

### 7.4 API Client

```typescript
// lib/api.ts
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1',
});

// Interceptor: agrega Authorization header
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Interceptor: maneja 401, intenta refresh
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      const newTokens = await refreshTokens();
      if (newTokens) {
        error.config.headers.Authorization = `Bearer ${newTokens.access_token}`;
        return api(error.config);
      }
      logout();
    }
    return Promise.reject(error);
  }
);
```

---

## 8. Testing — Fase 1

### 8.1 Unit Tests (Jest)

Por cada servicio:
- `auth.service.spec.ts` — register, login, refresh, logout, validateToken
- `users.service.spec.ts` — CRUD, findByEmail, assignRole, removeRole
- `roles.service.spec.ts` — CRUD, assignPermissions, getPermissions
- `permissions.service.spec.ts` — findAll, findByModule, tienePermiso
- `tenants.service.spec.ts` — CRUD, createWithDefaults
- `audit.service.spec.ts` — log, findByEntity, findByUser

Mock: TypeORM repository pattern (`getRepositoryToken()`)

### 8.2 Integration Tests

Contra DB de test (schema `evento_test`):
- Auth flow completo: register → login → access → refresh → me
- RBAC: crear rol → asignar permisos → asignar a usuario → verificar acceso
- Multi-tenancy: crear 2 tenants → verificar isolación

### 8.3 E2E Tests (Playwright)

Smoke test:
1. Navegar a `/login`
2. Login con credenciales de admin
3. Verificar redirección a `/dashboard`
4. Navegar a `/users`
5. Crear un usuario
6. Verificar que aparece en la lista

---

## 9. Docker

### docker-compose.yml (actualizar)

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    ports:
      - '5432:5432'
    environment:
      POSTGRES_DB: evento_web
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data

  minio:
    image: minio/minio
    ports:
      - '9000:9000'
      - '9001:9001'
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    volumes:
      - minio_data:/data

  mailhog:
    image: mailhog/mailhog
    ports:
      - '1025:1025'
      - '8025:8025'

volumes:
  postgres_data:
  redis_data:
  minio_data:
```

### Variables de entorno

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/evento_web

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=evento-jwt-secret-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# S3/MinIO
S3_ENDPOINT=http://localhost:9000
S3_BUCKET=evento-files
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin

# SMTP (MailHog dev)
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=
SMTP_PASSWORD=

# App
APP_URL=http://localhost:3000
API_URL=http://localhost:3002

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3002/api/v1
```

---

## 10. Orden de implementación

1. **Schema DB** — crear schema `evento`, enums, tablas con migraciones TypeORM
2. **Módulo Tenants** — entidad, CRUD, servicio
3. **Módulo Permissions** — entidad, catálogo predefinido
4. **Módulo Roles** — entidad, CRUD, asociación con permisos
5. **Módulo Auth** — refactor: register, login, refresh, logout, JWT con tenant+roles+permissions
6. **Módulo Users** — refactor: CRUD, asociación a tenants y roles
7. **Guards y decorators** — JwtAuthGuard, RolesGuard, PermissionsGuard, TenantGuard, AuditInterceptor
8. **Health endpoints** — /health, /health/database, /health/redis
9. **Frontend Next.js** — scaffolding, providers, API client, login/register/dashboard/users/roles
10. **Tests** — unit, integration, E2E
11. **Docker** — actualizar docker-compose.yml

---

## 11. Reglas de negocio (Fase 1)

| Código | Regla |
|--------|-------|
| RN-F1-001 | Un email no puede estar registrado dos veces |
| RN-F1-002 | Un usuario inactivo no puede loguearse |
| RN-F1-003 | Un refresh token revocado no puede usarse |
| RN-F1-004 | Solo super_admin puede crear tenants |
| RN-F1-005 | Solo admin puede gestionar roles en su tenant |
| RN-F1-006 | Los roles del sistema (is_system=true) no se eliminan |
| RN-F1-007 | Un tenant inactivo bloquea todos los accesos |
| RN-F1-008 | Todos los cambios administrativos se registran en audit_logs |

---

## 12. Criterios de aceptación

### AC-001: Registro
- POST /auth/register con email, password, firstName, lastName crea usuario
- Email duplicado retorna 409 Conflict
- Password hasheada con Argon2/bcrypt (nunca en texto plano)

### AC-002: Login
- POST /auth/login con credenciales válidas retorna access_token + refresh_token
- Credenciales inválidas retornan 401
- Usuario inactivo retorna 403

### AC-003: Refresh
- POST /auth/refresh con refresh_token válido retorna nuevo par de tokens
- Refresh token revocado retorna 401
- Refresh token expirado retorna 401

### AC-004: Access
- Request con access_token válido accede a endpoints protegidos
- Request sin token retorna 401
- Request con token expirado retorna 401

### AC-005: RBAC
- Usuario con rol admin puede acceder a /users
- Usuario sin rol admin es rechazado con 403
- Permiso verificado con @Permissions('user.create')

### AC-006: Multi-tenancy
- Datos de tenant A no son visibles desde tenant B
- JWT contiene tenant_id
- Queries filtran por tenant_id automáticamente

### AC-007: Auditoría
- Login registra audit_log
- Crear usuario registra audit_log con old_values/new_values
- Audit log incluye ip_address y user_agent

### AC-008: Frontend
- Login redirige a /dashboard
- Dashboard muestra datos del usuario actual
- Logout limpia tokens y redirige a /login
- 401 en cualquier momento redirige a /login

---

## 13. Documentos pendientes

- **Documento B** — Contrato API completo (cada endpoint con request/response/errores)
- **Documento C** — Historias de usuario + criterios de aceptación detallados

Estos documentos se generarán en fases posteriores cuando se implementen los módulos correspondientes.
