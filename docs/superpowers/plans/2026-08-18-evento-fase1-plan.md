# Evento Fase 1: Infraestructura Base — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish the multi-tenant infrastructure with auth, RBAC, and a Next.js frontend consuming the NestJS API.

**Architecture:** Shared-database multi-tenancy with discriminator column (`tenant_id`). NestJS backend with TypeORM migrations. Next.js App Router frontend with shadcn/ui, TanStack Query, React Hook Form + Zod. JWT access (15min) + refresh tokens (7d).

**Tech Stack:** NestJS 11, TypeORM 0.3, PostgreSQL 16, Redis 7, Next.js 15, React 19, Tailwind CSS 4, shadcn/ui, Zod 3, TanStack Query 5, Jest 30, Playwright

**Spec:** `docs/superpowers/specs/2026-08-18-evento-fase1-infraestructura.md`

## Global Constraints

- Schema: `evento` en PostgreSQL 10.0.1.21:5432 (misma instancia, schema separado)
- API prefix: `/api/v1`
- JWT secret: `JWT_SECRET` env var
- Password hashing: bcryptjs (ya instalado)
- Rate limiting: `@nestjs/throttler`
- TypeScript estricto
- Tests: Jest unit + integration, Playwright E2E
- Commits: convencionales (`feat:`, `fix:`, `test:`, `refactor:`)

---

## Task 1: Docker + Database Schema + Migrations

**Files:**
- Create/Modify: `docker-compose.yml`
- Create: `.env`
- Create: `backend-next/src/database/data-source.ts`
- Create: 9 migration files in `backend-next/src/database/migrations/`

- [ ] **Step 1: Create docker-compose.yml** with postgres:16, redis:7, minio, mailhog
- [ ] **Step 2: Create .env** with DATABASE_URL, REDIS_URL, JWT_SECRET, S3, SMTP vars
- [ ] **Step 3: Create data-source.ts** for TypeORM CLI
- [ ] **Step 4: Create migration CreateSchema** — `CREATE SCHEMA IF NOT EXISTS evento`
- [ ] **Step 5: Create migration CreateEnums** — `user_role`, `audit_action` ENUMs
- [ ] **Step 6: Create migration CreateTenants** — tenants table with indexes
- [ ] **Step 7: Create migration CreateUsers** — users table with soft delete
- [ ] **Step 8: Create migration CreateRolesAndPermissions** — roles, permissions, role_permissions
- [ ] **Step 9: Create migration CreateUserTenantsAndRoles** — user_tenants, user_roles pivots
- [ ] **Step 10: Create migration CreateRefreshTokens** — refresh_tokens with hash
- [ ] **Step 11: Create migration CreateAuditLogs** — audit_logs with JSONB
- [ ] **Step 12: Create migration SeedPermissions** — 17 permisos predefinidos
- [ ] **Step 13: Verify migrations run** — `npx typeorm migration:run`
- [ ] **Step 14: Commit** — `feat(db): add multi-tenant schema with TypeORM migrations`

## Task 2: Tenant Entity + Module

**Files:**
- Create: `backend-next/src/tenants/entities/tenant.entity.ts`
- Create: `backend-next/src/tenants/dto/create-tenant.dto.ts`
- Create: `backend-next/src/tenants/dto/update-tenant.dto.ts`
- Create: `backend-next/src/tenants/tenants.service.ts`
- Create: `backend-next/src/tenants/tenants.controller.ts`
- Create: `backend-next/src/tenants/tenants.module.ts`
- Create: `backend-next/src/tenants/tenants.service.spec.ts`

- [ ] **Step 1: Create tenant.entity.ts** — UUID, name, slug (unique), domain, logo_url, settings JSONB, is_active, timestamps, soft delete
- [ ] **Step 2: Create create-tenant.dto.ts** — name, slug (lowercase alphanumeric), optional domain/logo/settings
- [ ] **Step 3: Create update-tenant.dto.ts** — PartialType of create
- [ ] **Step 4: Create tenants.service.ts** — CRUD with slug uniqueness check, findAll, findBySlug
- [ ] **Step 5: Create tenants.controller.ts** — POST (super_admin), GET, GET/:id, PATCH (admin), DELETE (super_admin)
- [ ] **Step 6: Create tenants.module.ts** — TypeOrmModule.forFeature([Tenant])
- [ ] **Step 7: Write failing test** — 6 tests: create, duplicate slug, findAll, findOne, not found, update, remove
- [ ] **Step 8: Register TenantsModule in app.module.ts**
- [ ] **Step 9: Run test** — `npx jest src/tenants/tenants.service.spec.ts` → PASS
- [ ] **Step 10: Commit** — `feat(tenants): add tenant entity, CRUD service and controller`

## Task 3: Permission Entity + Module

**Files:**
- Create: `backend-next/src/permissions/entities/permission.entity.ts`
- Create: `backend-next/src/permissions/permissions.service.ts`
- Create: `backend-next/src/permissions/permissions.controller.ts`
- Create: `backend-next/src/permissions/permissions.module.ts`
- Create: `backend-next/src/permissions/permissions.service.spec.ts`

- [ ] **Step 1: Create permission.entity.ts** — UUID, code (unique), module, action, description
- [ ] **Step 2: Create permissions.service.ts** — findAll, findByModule, findByCodes, findByIds, tienePermiso
- [ ] **Step 3: Create permissions.controller.ts** — GET /permissions (authenticated)
- [ ] **Step 4: Create permissions.module.ts** — exports PermissionsService
- [ ] **Step 5: Write failing test** — 5 tests: findAll, findByModule, findByCodes, tienePermiso true/false
- [ ] **Step 6: Register PermissionsModule in app.module.ts**
- [ ] **Step 7: Run test** → PASS
- [ ] **Step 8: Commit** — `feat(permissions): add permission entity, service and controller`

## Task 4: Role Entity + Module

**Files:**
- Create: `backend-next/src/roles/entities/role.entity.ts`
- Create: `backend-next/src/roles/entities/role-permission.entity.ts`
- Create: `backend-next/src/roles/dto/create-role.dto.ts`
- Create: `backend-next/src/roles/dto/update-role.dto.ts`
- Create: `backend-next/src/roles/dto/assign-permissions.dto.ts`
- Create: `backend-next/src/roles/roles.service.ts`
- Create: `backend-next/src/roles/roles.controller.ts`
- Create: `backend-next/src/roles/roles.module.ts`
- Create: `backend-next/src/roles/roles.service.spec.ts`

- [ ] **Step 1: Create role.entity.ts** — UUID, tenant_id FK, name, description, is_system
- [ ] **Step 2: Create role-permission.entity.ts** — UUID, role_id FK, permission_id FK (CASCADE)
- [ ] **Step 3: Create DTOs** — create (name, description, permissionIds[]), update (partial), assign-permissions
- [ ] **Step 4: Create roles.service.ts** — CRUD, assignPermissions (replace all), getPermissionsByRoleId, system role protection
- [ ] **Step 5: Create roles.controller.ts** — POST (admin), GET, GET/:id, PATCH, DELETE, POST/:id/permissions
- [ ] **Step 6: Create roles.module.ts** — imports PermissionsModule
- [ ] **Step 7: Write failing test** — 5 tests: create, duplicate, system role rename block, system role delete block, assignPermissions
- [ ] **Step 8: Register RolesModule in app.module.ts**
- [ ] **Step 9: Run test** → PASS
- [ ] **Step 10: Commit** — `feat(roles): add role entity, CRUD service, RBAC with permissions`

## Task 5: Common Guards, Decorators, Filters

**Files:**
- Modify: `backend-next/src/common/guards/jwt-auth.guard.ts`
- Modify: `backend-next/src/common/guards/roles.guard.ts`
- Create: `backend-next/src/common/guards/permissions.guard.ts`
- Modify: `backend-next/src/common/decorators/roles.decorator.ts`
- Create: `backend-next/src/common/decorators/permissions.decorator.ts`
- Create: `backend-next/src/common/decorators/current-user.decorator.ts`
- Create: `backend-next/src/common/decorators/tenant.decorator.ts`
- Create: `backend-next/src/common/dto/pagination.dto.ts`
- Create: `backend-next/src/common/filters/http-exception.filter.ts`

- [ ] **Step 1: Refactor jwt-auth.guard.ts** — clean handleRequest
- [ ] **Step 2: Refactor roles.guard.ts** — Reflector-based, checks user.roles
- [ ] **Step 3: Create permissions.guard.ts** — Reflector-based, checks user.permissions (ALL required)
- [ ] **Step 4: Refactor roles.decorator.ts** — SetMetadata(ROLES_KEY, roles)
- [ ] **Step 5: Create permissions.decorator.ts** — SetMetadata(PERMISSIONS_KEY, permissions)
- [ ] **Step 6: Create current-user.decorator.ts** — param decorator extracting request.user
- [ ] **Step 7: Create tenant.decorator.ts** — param decorator extracting request.user.tenant_id
- [ ] **Step 8: Create pagination.dto.ts** — PageDto (page, limit, skip) + PaginatedResponseDto<T>
- [ ] **Step 9: Create http-exception.filter.ts** — logs warning, returns consistent error format
- [ ] **Step 10: Commit** — `feat(common): add guards, decorators, pagination, exception filter`

## Task 6: Auth Module Refactor

**Files:**
- Modify: `backend-next/src/auth/dto/register.dto.ts`
- Modify: `backend-next/src/auth/dto/login.dto.ts`
- Create: `backend-next/src/auth/dto/refresh.dto.ts`
- Create: `backend-next/src/auth/dto/auth-response.dto.ts`
- Modify: `backend-next/src/auth/strategies/jwt.strategy.ts`
- Modify: `backend-next/src/auth/auth.service.ts`
- Modify: `backend-next/src/auth/auth.controller.ts`
- Replace: `backend-next/src/auth/auth.service.spec.ts`

- [ ] **Step 1: Refactor register.dto.ts** — email, password (min 8, uppercase+lowercase+number+special), firstName, lastName
- [ ] **Step 2: Refactor login.dto.ts** — email, password (min 1)
- [ ] **Step 3: Create refresh.dto.ts** — refresh_token string
- [ ] **Step 4: Create auth-response.dto.ts** — AuthUserDto + AuthResponseDto
- [ ] **Step 5: Refactor jwt.strategy.ts** — load user with relations, return {id, email, tenant_id, roles, permissions}
- [ ] **Step 6: Refactor auth.service.ts** — register (hash+save+tokens), login (validate+tokens), refresh (verify+revoke+new), logout (revoke), getMe (user with tenants/roles/permissions)
- [ ] **Step 7: Refactor auth.controller.ts** — POST register, POST login, POST refresh, POST logout (guarded), GET me (guarded)
- [ ] **Step 8: Replace auth.service.spec.ts** — 6 tests: register, duplicate email, login, invalid credentials, inactive user, refresh, revoked token
- [ ] **Step 9: Run all tests** → PASS
- [ ] **Step 10: Commit** — `refactor(auth): JWT access+refresh tokens, register/login/me with RBAC`

## Task 7: User Entity + Module Refactor

**Files:**
- Create: `backend-next/src/users/entities/user.entity.ts` (replace)
- Create: `backend-next/src/users/entities/user-tenant.entity.ts`
- Create: `backend-next/src/users/entities/user-role.entity.ts`
- Create: `backend-next/src/users/entities/refresh-token.entity.ts`
- Create: DTOs (create, update, user-response, assign-role)
- Create: `backend-next/src/users/users.service.ts` (replace)
- Create: `backend-next/src/users/users.controller.ts` (replace)
- Create: `backend-next/src/users/users.module.ts` (replace)

- [ ] **Step 1: Create user.entity.ts** — UUID, email (unique), password_hash, first_name, last_name, phone, avatar_url, is_active, email_verified, last_login_at, timestamps, soft delete, OneToMany user_tenants/user_roles/refresh_tokens
- [ ] **Step 2: Create user-tenant.entity.ts** — UUID, user_id FK, tenant_id FK (eager), is_active, role_id FK (eager, nullable)
- [ ] **Step 3: Create user-role.entity.ts** — UUID, user_id FK, role_id FK (eager), tenant_id FK
- [ ] **Step 4: Create refresh-token.entity.ts** — UUID, user_id FK, token_hash (unique), expires_at, revoked_at
- [ ] **Step 5: Create DTOs** — CreateUserDto, UpdateUserDto (PartialType + is_active), UserResponseDto, AssignRoleDto
- [ ] **Step 6: Create users.service.ts** — create (hash), findAll (by tenant via join), findOne, findByEmail, update, remove (soft), assignRole, removeRole
- [ ] **Step 7: Create users.controller.ts** — CRUD + POST :id/roles + DELETE :id/roles/:tenantId, all guarded with RolesGuard + Permissions
- [ ] **Step 8: Create users.module.ts** — TypeOrmModule.forFeature([User, UserTenant, UserRole, RefreshToken]), exports UsersService + TypeOrmModule
- [ ] **Step 9: Run tests** → PASS
- [ ] **Step 10: Commit** — `feat(users): add user entity with multi-tenancy, RBAC, CRUD`

## Task 8: Audit Module Refactor

**Files:**
- Create: `backend-next/src/audit/entities/audit-log.entity.ts` (replace)
- Create: `backend-next/src/audit/audit.service.ts` (replace)
- Create: `backend-next/src/audit/audit.service.spec.ts`
- Create: `backend-next/src/common/interceptors/audit.interceptor.ts`

- [ ] **Step 1: Create audit-log.entity.ts** — UUID, tenant_id, user_id, action (ENUM), entity, entity_id, old_values JSONB, new_values JSONB, ip_address INET, user_agent
- [ ] **Step 2: Create audit.service.ts** — log(), findByEntity(), findByUser()
- [ ] **Step 3: Create audit.interceptor.ts** — intercept POST/PATCH/DELETE, extract entity from URL, log automatically
- [ ] **Step 4: Write tests** — 2 tests: log creation, findByEntity
- [ ] **Step 5: Run tests** → PASS
- [ ] **Step 6: Commit** — `feat(audit): add audit log entity, service and interceptor`

## Task 9: Health + Swagger + Bootstrap Update

**Files:**
- Create: `backend-next/src/health/health.module.ts`
- Create: `backend-next/src/health/health.controller.ts`
- Modify: `backend-next/src/main.ts`
- Modify: `backend-next/src/app.module.ts`

- [ ] **Step 1: Create health.controller.ts** — GET /health, GET /health/database (SELECT 1), GET /health/redis (PING)
- [ ] **Step 2: Create health.module.ts**
- [ ] **Step 3: Update app.module.ts** — add all new modules, set `synchronize: false`, ThrottlerModule
- [ ] **Step 4: Update main.ts** — global prefix `/api/v1`, ValidationPipe (whitelist+forbid+transform), HttpExceptionFilter, CORS, Swagger at /docs
- [ ] **Step 5: Commit** — `feat(health): add health endpoints, swagger docs, update bootstrap`

## Task 10: Backend Full Verification

- [ ] **Step 1: Install deps** — `@nestjs/throttler`, `ioredis`, `@nestjs-modules/ioredis`
- [ ] **Step 2: Run all tests** — `npx jest --verbose` → ALL PASS
- [ ] **Step 3: Typecheck** — `npx tsc --noEmit` → 0 errors
- [ ] **Step 4: Lint** — `npm run lint` → 0 errors
- [ ] **Step 5: Commit if fixes needed**

## Task 11: Frontend Next.js Scaffolding

**Files:**
- Create: `frontend/` directory (Next.js project)
- Create: lib/api.ts, lib/auth.ts, lib/utils.ts
- Create: types/api.ts, types/user.ts, types/role.ts, types/tenant.ts
- Create: hooks/use-auth.ts, hooks/use-users.ts, hooks/use-roles.ts, hooks/use-tenants.ts
- Create: components/layout/providers.tsx

- [ ] **Step 1: Init Next.js** — `npx create-next-app@latest frontend --typescript --tailwind --eslint --app --src-dir`
- [ ] **Step 2: Install deps** — @tanstack/react-query, axios, react-hook-form, zod, lucide-react, next-themes
- [ ] **Step 3: Init shadcn/ui** — `npx shadcn@latest init -d` + add button, input, card, label, table, dialog, toast, form, select
- [ ] **Step 4: Create api.ts** — axios instance with JWT interceptor + auto-refresh on 401
- [ ] **Step 5: Create auth.ts** — getAccessToken, setTokens, clearTokens, isAuthenticated
- [ ] **Step 6: Create types** — ApiResponse<T>, PaginatedResponse<T>, User, AuthUser, AuthResponse, MeResponse, Role, Permission, Tenant
- [ ] **Step 7: Create hooks** — useAuth (login/register/logout/me), useUsers, useCreateUser, useDeleteUser, useRoles, useCreateRole, useTenants, useCreateTenant
- [ ] **Step 8: Create providers.tsx** — QueryClientProvider + ThemeProvider
- [ ] **Step 9: Commit** — `feat(frontend): scaffold Next.js with auth, hooks, types, API client`

## Task 12: Frontend Auth Pages + Dashboard

**Files:**
- Modify: `frontend/src/app/layout.tsx`
- Create: `frontend/src/app/(auth)/login/page.tsx`
- Create: `frontend/src/app/(auth)/register/page.tsx`
- Create: `frontend/src/app/(dashboard)/layout.tsx`
- Create: `frontend/src/app/(dashboard)/dashboard/page.tsx`
- Create: `frontend/src/components/layout/sidebar.tsx`
- Create: `frontend/src/components/layout/header.tsx`

- [ ] **Step 1: Update root layout** — Inter font, Providers wrapper, metadata
- [ ] **Step 2: Create login page** — form with email/password, error handling, redirect to /dashboard
- [ ] **Step 3: Create register page** — form with firstName/lastName/email/password
- [ ] **Step 4: Create dashboard layout** — auth guard, Sidebar + Header
- [ ] **Step 5: Create dashboard page** — welcome + role/institution/permissions cards
- [ ] **Step 6: Create sidebar.tsx** — nav links (Dashboard, Usuarios, Roles, Instituciones), active state
- [ ] **Step 7: Create header.tsx** — email display + logout button
- [ ] **Step 8: Commit** — `feat(frontend): add login, register, dashboard with sidebar and header`

## Task 13: Frontend Admin Pages

**Files:**
- Create: `frontend/src/app/(dashboard)/users/page.tsx`
- Create: `frontend/src/app/(dashboard)/roles/page.tsx`
- Create: `frontend/src/app/(dashboard)/tenants/page.tsx`

- [ ] **Step 1: Create users page** — table + create form (toggle), delete button
- [ ] **Step 2: Create roles page** — table + create form (name, description)
- [ ] **Step 3: Create tenants page** — table + create form (name, slug)
- [ ] **Step 4: Commit** — `feat(frontend): add users, roles, tenants admin pages`

## Task 14: E2E Smoke Test

**Files:**
- Create: `playwright.config.ts`
- Create: `e2e/smoke.spec.ts`

- [ ] **Step 1: Create playwright.config.ts** — chromium, baseURL localhost:3000
- [ ] **Step 2: Create smoke test** — load login, load register, redirect to login when unauthenticated
- [ ] **Step 3: Commit** — `test(e2e): add smoke tests for auth flow`

## Task 15: Final Verification

- [ ] **Step 1: Start Docker** — `docker-compose up -d`
- [ ] **Step 2: Run migrations** — all 9 run successfully
- [ ] **Step 3: Start backend** — running on :3002, Swagger at /docs
- [ ] **Step 4: Test health** — `curl localhost:3002/api/v1/health` → ok
- [ ] **Step 5: Test auth flow** — register → login → access /users → refresh → me
- [ ] **Step 6: Start frontend** — running on :3000
- [ ] **Step 7: E2E tests** — `npx playwright test` → PASS
- [ ] **Step 8: Final commit** — `chore: Phase 1 complete — infrastructure base ready`
