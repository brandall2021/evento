# Admin settings implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish the remaining frontend admin partials and add a settings screen so the control panel matches the backend capabilities.

**Architecture:** Keep the existing Next App Router structure and extend the current hooks-driven CRUD flow. Reuse the existing backend endpoints for users, roles, tenants, and permissions, then add a lightweight settings page that reads and writes tenant configuration through the same API surface.

**Tech Stack:** Next.js 16 App Router, React 19, TanStack Query, React Hook Form, Zod, shadcn/ui, Tailwind CSS, NestJS backend APIs.

**Spec:** `docs/proyecto-status.md`

## Global Constraints

- Keep the current stack: Next.js 16 App Router, React 19, TanStack Query, React Hook Form, Zod, shadcn/ui, Tailwind CSS.
- Reuse existing backend endpoints and permission model; do not add a second admin architecture.
- Prefer small, reviewable changes over broad rewrites.
- Validate every user-facing form with client-side schema checks.
- Preserve the LACDI visual system already applied to the frontend.

---

### Task 1: Add missing admin hooks and types

**Files:**
- Modify: `frontend/src/hooks/use-users.ts`
- Modify: `frontend/src/hooks/use-roles.ts`
- Modify: `frontend/src/hooks/use-tenants.ts`
- Modify: `frontend/src/types/user.ts`
- Modify: `frontend/src/types/role.ts`
- Modify: `frontend/src/types/tenant.ts`

**Interfaces:**
- Consumes: `/users/:id`, `/roles/:id`, `/tenants/:id`, `/permissions`
- Produces: `useUpdateUser`, `useUpdateRole`, `useDeleteRole`, `useDeleteTenant`, `usePermissions`, `usePermission`, `UpdateUserPayload`, `UpdateRolePayload`, `Permission`

- [ ] **Step 1: Write the failing type/import usage test mentally and confirm missing exports by inspection**

- [ ] **Step 2: Add the hooks and payload types with invalidation on success**

- [ ] **Step 3: Run `npm run lint` in `frontend` to ensure the new exports and imports are consistent**

### Task 2: Complete users, roles, and tenants admin screens

**Files:**
- Modify: `frontend/src/app/(dashboard)/dashboard/usuarios/page.tsx`
- Modify: `frontend/src/app/(dashboard)/dashboard/roles/page.tsx`
- Modify: `frontend/src/app/(dashboard)/dashboard/instituciones/page.tsx`
- Modify: `frontend/src/components/data-table.tsx` only if an action column tweak is needed

**Interfaces:**
- Consumes: `useUsers`, `useUpdateUser`, `useDeleteUser`, `useRoles`, `useUpdateRole`, `useDeleteRole`, `useTenants`, `useUpdateTenant`, `useDeleteTenant`
- Produces: edit and delete actions for each admin table, prefilled dialogs, and refresh after mutations

- [ ] **Step 1: Add failing interaction coverage for edit/delete actions in the admin screens**

- [ ] **Step 2: Implement edit dialogs and action buttons using the existing LACDI card/table styling**

- [ ] **Step 3: Run `npm run lint` and `npm run build` in `frontend`**

### Task 3: Add permissions management screen

**Files:**
- Create: `frontend/src/app/(dashboard)/dashboard/permisos/page.tsx`
- Modify: `frontend/src/components/layout/sidebar.tsx`
- Modify: `frontend/src/components/layout/header.tsx` only if the nav needs to expose permissions on mobile

**Interfaces:**
- Consumes: `usePermissions`, `useAssignPermissions`, `useRoles`, `useRole`
- Produces: a permissions browser filtered by module, role-level permission assignment, and clear empty/loading states

- [ ] **Step 1: Add the page with a filterable permissions list and role selector**

- [ ] **Step 2: Wire the assign-permissions mutation and invalidate role queries after save**

- [ ] **Step 3: Add the route to the sidebar and verify the nav highlights correctly**

- [ ] **Step 4: Run `npm run lint` and `npm run build` in `frontend`**

### Task 4: Add settings screen for tenant configuration

**Files:**
- Create: `frontend/src/app/(dashboard)/settings/page.tsx`
- Modify: `frontend/src/components/layout/sidebar.tsx`
- Modify: `frontend/src/hooks/use-tenants.ts`

**Interfaces:**
- Consumes: `useTenant`, `useUpdateTenant`
- Produces: settings form for tenant name, domain, branding fields, and JSON settings blob

- [ ] **Step 1: Add a settings page that loads the active tenant and fills the form**

- [ ] **Step 2: Implement save/reset actions with Zod validation and toast feedback**

- [ ] **Step 3: Add the route to the sidebar and test the page loads without auth regressions**

- [ ] **Step 4: Run `npm run lint` and `npm run build` in `frontend`**

### Task 5: Update docs and verify the admin block is closed

**Files:**
- Modify: `docs/proyecto-status.md`
- Modify: `docs/roadmap.md`
- Modify: `README.md`

**Interfaces:**
- Consumes: the completed implementation from Tasks 1-4
- Produces: updated status marks for the admin/settings partials

- [ ] **Step 1: Mark the admin/settings partials as completed only after the code passes verification**

- [ ] **Step 2: Run `npm run lint` and `npm run build` in `frontend` one last time**

- [ ] **Step 3: Commit the changes with a focused message**
