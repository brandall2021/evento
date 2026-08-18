# Task 7 Report: User Entity + Module Refactor

**Status:** DONE  
**Commit:** `174e4fe` — feat(users): add user entity with multi-tenancy, RBAC, CRUD

## What was done

### Entities Created (in `users/entities/`)
1. **`user.entity.ts`** — UUID PK, email (unique), password_hash, first_name, last_name, phone, avatar_url, is_active, email_verified, last_login_at, timestamps, soft delete, OneToMany to user_tenants/user_roles/refresh_tokens, `comparePassword()` method
2. **`user-tenant.entity.ts`** — UUID PK, user_id FK, tenant_id FK (eager), is_active, role_id FK (eager, nullable), unique constraint on [user_id, tenant_id]
3. **`user-role.entity.ts`** — UUID PK, user_id FK, role_id FK (eager), tenant_id FK (eager), unique constraint on [user_id, role_id, tenant_id]
4. **`refresh-token.entity.ts`** — UUID PK, user_id FK, token_hash (unique, indexed), expires_at, revoked_at

### DTOs Created (in `users/dto/`)
- `CreateUserDto` — email, password, firstName, lastName, phone?, avatarUrl? (with class-validator + Swagger)
- `UpdateUserDto` — PartialType of CreateUserDto + is_active
- `UserResponseDto` — id, email, firstName, lastName, phone, avatarUrl, isActive, createdAt
- `AssignRoleDto` — roleId (UUID), tenantId (UUID)

### Service (`users.service.ts`)
- `create()` — hash password, check email uniqueness
- `findAll()` — paginated with tenant filter, isActive filter via QueryBuilder join
- `findOne()` — by UUID
- `findByEmail()` — with password_hash selected (for auth)
- `update()` — with email uniqueness check, password re-hash
- `remove()` — soft delete
- `assignRole()` — creates UserRole + ensures UserTenant exists
- `removeRole()` — deletes UserRole by roleId

### Controller (`users.controller.ts`)
- All endpoints guarded with `JwtAuthGuard + RolesGuard + PermissionsGuard`
- `GET /users` — admin, `users.list` permission
- `GET /users/:id` — admin, `users.read` permission
- `POST /users` — admin, `users.create` permission
- `PATCH /users/:id` — admin, `users.update` permission
- `DELETE /users/:id` — super_admin, `users.delete` permission
- `POST /users/:id/roles` — admin, `users.assign_role` permission
- `DELETE /users/:id/roles/:roleId` — admin, `users.remove_role` permission

### Module (`users.module.ts`)
- TypeOrmModule.forFeature([User, UserTenant, UserRole, RefreshToken])
- Exports UsersService + TypeOrmModule (so auth module can inject repos)

## Backward Compatibility
- Old `user.entity.ts` now re-exports User class + preserves UserRole enum (used by 20+ modules)
- Auth entities re-export from users module (RefreshToken, UserTenant, UserRoleAssignment → UserRole)
- Auth module imports UsersModule for shared entity access

## Downstream Fixes
- `auth.service.ts` — updated field references (nombre→first_name/last_name, activo→is_active, password→password_hash)
- `auth.service.spec.ts` — updated mock data to match new field names
- `jwt.strategy.ts` — fixed import path + activo→is_active
- `certificados.service.ts` — estudiante.nombre → first_name + last_name
- `credenciales.service.ts` — user.nombre → first_name + last_name
- `cursos.service.ts` — docente.nombre select → first_name + last_name; fixed pre-existing type error
- `organizaciones.service.ts` — fixed Partial<Organizacion> type error from new User relations
- `app.module.ts` — updated entity imports to users module

## Test Results
- `npx jest src/users/` — **13/13 passed**
- `npx jest src/auth/` — **13/13 passed**
- `npx jest` (full suite) — **77/77 passed** across 10 suites
- `npx tsc --noEmit` — **clean** (0 errors)

## Concerns
None. All entity relationships follow existing patterns. The `UserRole` enum is preserved for backward compatibility with 20+ modules that reference it.

---

## Fix Report (2026-08-18)

**Commit:** `fdda2af` — fix(users): tenant-scoped removeRole + /usuarios backward compat

### Critical Fix: `removeRole` now scoped by tenant
- **Before:** `this.userRoleRepo.delete({ user_id: userId, role_id: roleId })` — would delete ALL matching roles across all tenants
- **After:** `this.userRoleRepo.delete({ user_id: userId, role_id: roleId, tenant_id: tenantId })` — scoped to specific tenant
- Controller now accepts `tenantId` as a required query parameter on `DELETE /users/:id/roles/:roleId`
- Error message updated to include tenant context

### Important Fix: Backward-compatible `/usuarios` route
- Created `UsuariosAliasController` at `users/usuarios-alias.controller.ts`
- Mirrors all `UsersController` endpoints under `/usuarios` prefix
- Registered in `UsersModule` alongside `UsersController`
- Existing API clients hitting `/usuarios` will continue to work

### Files Changed
- `backend-next/src/users/users.service.ts` — `removeRole` now accepts `tenantId` param
- `backend-next/src/users/users.controller.ts` — `removeRole` passes `tenantId` from query
- `backend-next/src/users/users.service.spec.ts` — tests updated for tenant-scoped delete
- `backend-next/src/users/users.module.ts` — registers `UsuariosAliasController`
- `backend-next/src/users/usuarios-alias.controller.ts` — new backward-compatible alias

### Verification
- `npx jest src/users/` — **13/13 passed**
- `npx tsc --noEmit` — **clean** (0 errors)
