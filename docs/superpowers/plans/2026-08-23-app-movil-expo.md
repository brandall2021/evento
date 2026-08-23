# App Móvil de Evento Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Crear una app móvil iOS/Android separada que reutilice el mismo backend y el mismo auth del web actual, con experiencias para asistentes y staff.

**Architecture:** `mobile/` será una app Expo independiente, con navegación por archivos, cliente API propio y sesión persistida en storage seguro. La primera mitad del plan deja lista la base de app, auth y routing; la segunda mitad monta las superficies de asistente y staff sobre el backend existente sin duplicar lógica de negocio.

**Tech Stack:** React Native, Expo, Expo Router, TypeScript, TanStack Query, `expo-secure-store`, `expo-camera`, Vitest.

**Spec:** `docs/superpowers/specs/2026-08-23-app-movil-expo-design.md`

## Global Constraints

- Crear la app móvil como una app separada dentro del repo, en un directorio `mobile/` propio, con su `package.json`, configuración y build independientes.
- Reutilizar el mismo backend y el mismo sistema de autenticación del web actual.
- La app consumirá la API existente y usará la misma identidad de usuario que el web: `login`, `refresh`, `me`, `logout`.
- La app móvil debe soportar asistentes y staff/organización en una sola app.
- No reescribir el frontend web.
- No crear un backend nuevo.
- No cambiar permisos o credenciales del backend.
- No offline-first completo.
- No chat en tiempo real o streaming nativo en esta primera versión.

---

### Task 1: Expo workspace scaffold

**Files:**
- Create: `mobile/package.json` with `expo`, `expo-router`, `react-native`, `expo-secure-store`, `expo-camera`, `@tanstack/react-query`, `axios`, `vitest`, and `@testing-library/react-native`
- Create: `mobile/app.json`
- Create: `mobile/babel.config.js`
- Create: `mobile/tsconfig.json`
- Create: `mobile/.gitignore`
- Create: `mobile/app/_layout.tsx`
- Create: `mobile/app/index.tsx`
- Create: `mobile/src/lib/env.ts`
- Create: `mobile/src/lib/env.test.ts`
- Create: `mobile/src/theme/colors.ts`

**Interfaces:**
- Consumes: `process.env` values for the Expo app and a single API base URL.
- Produces: a bootable Expo app shell and a pure helper for resolving the mobile API base URL.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest'
import { getMobileApiBaseUrl } from './env'

describe('getMobileApiBaseUrl', () => {
  it('falls back to the local API URL when the env var is missing', () => {
    expect(getMobileApiBaseUrl(undefined)).toBe('http://localhost:3002/api/v1')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd mobile && npx vitest run src/lib/env.test.ts`
Expected: FAIL with `getMobileApiBaseUrl is not defined`

- [ ] **Step 3: Write minimal implementation**

```ts
export function getMobileApiBaseUrl(value?: string) {
  return value?.trim() || 'http://localhost:3002/api/v1'
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd mobile && npx vitest run src/lib/env.test.ts && npx tsc --noEmit`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add mobile/package.json mobile/app.json mobile/babel.config.js mobile/tsconfig.json mobile/.gitignore mobile/app/_layout.tsx mobile/app/index.tsx mobile/src/lib/env.ts mobile/src/lib/env.test.ts mobile/src/theme/colors.ts
git commit -m "feat: scaffold mobile expo app"
```

### Task 2: Auth session foundation

**Files:**
- Create: `mobile/src/lib/session.ts`
- Create: `mobile/src/lib/session.test.ts`
- Create: `mobile/src/lib/auth.ts`
- Create: `mobile/src/lib/auth.test.ts`
- Create: `mobile/src/state/auth-context.tsx`
- Create: `mobile/src/hooks/use-session.ts`
- Create: `mobile/src/components/FullScreenSpinner.tsx`
- Create: `mobile/app/(auth)/login.tsx`

**Interfaces:**
- Consumes: login/refresh/me/logout responses from the existing backend auth endpoints.
- Produces: `MobileSession`, `MobileUser`, `loadStoredSession`, `saveStoredSession`, `clearStoredSession`, `loginWithPassword`, `refreshSession`, `logoutSession`, and `AuthProvider`/`useAuth`.

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, expect, it } from 'vitest'
import { normalizeAuthResponse } from './auth'
import { normalizeStoredSession } from './session'

describe('normalizeAuthResponse', () => {
  it('maps backend auth payloads into a mobile session', () => {
    expect(normalizeAuthResponse({
      access_token: 'a',
      refresh_token: 'r',
      user: { id: 1, nombre: 'Ana', email: 'ana@evento.com', roles: ['asistente'] },
    })).toEqual({
      accessToken: 'a',
      refreshToken: 'r',
      user: { id: 1, nombre: 'Ana', email: 'ana@evento.com', roles: ['asistente'] },
    })
  })
})

describe('normalizeStoredSession', () => {
  it('returns null when the stored value is invalid', () => {
    expect(normalizeStoredSession('not-json')).toBeNull()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd mobile && npx vitest run src/lib/session.test.ts src/lib/auth.test.ts`
Expected: FAIL with missing helper exports

- [ ] **Step 3: Write minimal implementation**

```ts
export function normalizeAuthResponse(input: {
  access_token: string
  refresh_token: string
  user: MobileUser
}): MobileSession {
  return {
    accessToken: input.access_token,
    refreshToken: input.refresh_token,
    user: input.user,
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd mobile && npx vitest run src/lib/session.test.ts src/lib/auth.test.ts && npx tsc --noEmit`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add mobile/src/lib/session.ts mobile/src/lib/session.test.ts mobile/src/lib/auth.ts mobile/src/lib/auth.test.ts mobile/src/state/auth-context.tsx mobile/src/hooks/use-session.ts mobile/src/components/FullScreenSpinner.tsx mobile/app/(auth)/login.tsx
git commit -m "feat: add mobile auth session foundation"
```

### Task 3: Assistant navigation and agenda flow

**Files:**
- Create: `mobile/src/lib/role-routes.ts`
- Create: `mobile/src/lib/role-routes.test.ts`
- Create: `mobile/src/features/agenda/agenda-list.tsx`
- Create: `mobile/src/features/agenda/event-detail.tsx`
- Create: `mobile/src/features/inscripciones/inscription-list.tsx`
- Create: `mobile/app/(app)/_layout.tsx`
- Create: `mobile/app/(app)/(tabs)/_layout.tsx`
- Create: `mobile/app/(app)/(tabs)/agenda.tsx`
- Create: `mobile/app/(app)/(tabs)/inscripciones.tsx`
- Create: `mobile/app/(app)/(tabs)/perfil.tsx`
- Create: `mobile/app/(app)/eventos/[id].tsx`

**Interfaces:**
- Consumes: `useAuth()` plus normalized agenda and inscription data from the mobile API client.
- Produces: `getVisibleTabsForRoles(roles)`, `getInitialTabForRoles(roles)`, assistant tab layout, agenda list, event detail, and mis-inscripciones screens.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest'
import { getVisibleTabsForRoles, getInitialTabForRoles } from './role-routes'

describe('role routes', () => {
  it('shows staff routes only when the user has staff roles', () => {
    expect(getVisibleTabsForRoles(['asistente'])).toEqual(['agenda', 'inscripciones', 'perfil'])
    expect(getVisibleTabsForRoles(['coordinador'])).toEqual(['agenda', 'inscripciones', 'perfil', 'staff'])
  })

  it('picks agenda as the default tab for both roles', () => {
    expect(getInitialTabForRoles(['asistente'])).toBe('agenda')
    expect(getInitialTabForRoles(['coordinador'])).toBe('agenda')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd mobile && npx vitest run src/lib/role-routes.test.ts`
Expected: FAIL with missing helper exports

- [ ] **Step 3: Write minimal implementation**

```ts
export function getVisibleTabsForRoles(roles: string[]) {
  const tabs = ['agenda', 'inscripciones', 'perfil']
  if (roles.some((role) => ['admin', 'coordinador', 'docente', 'checkin'].includes(role))) {
    tabs.push('staff')
  }
  return tabs
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd mobile && npx vitest run src/lib/role-routes.test.ts && npx tsc --noEmit`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add mobile/src/lib/role-routes.ts mobile/src/lib/role-routes.test.ts mobile/src/features/agenda/agenda-list.tsx mobile/src/features/agenda/event-detail.tsx mobile/src/features/inscripciones/inscription-list.tsx mobile/app/(app)/_layout.tsx mobile/app/(app)/(tabs)/_layout.tsx mobile/app/(app)/(tabs)/agenda.tsx mobile/app/(app)/(tabs)/inscripciones.tsx mobile/app/(app)/(tabs)/perfil.tsx mobile/app/(app)/eventos/[id].tsx
git commit -m "feat: add mobile assistant flows"
```

### Task 4: Staff surface and check-in

**Files:**
- Create: `mobile/src/lib/checkin.ts`
- Create: `mobile/src/lib/checkin.test.ts`
- Create: `mobile/src/features/checkin/checkin-form.tsx`
- Create: `mobile/src/features/checkin/checkin-scanner.tsx`
- Create: `mobile/src/features/staff/staff-dashboard.tsx`
- Create: `mobile/app/(app)/(tabs)/staff.tsx`
- Create: `mobile/app/(app)/checkin.tsx`

**Interfaces:**
- Consumes: staff-only data from the backend check-in endpoints and QR/manual payloads from the device.
- Produces: `parseCheckinScanValue`, `buildManualCheckinPayload`, staff dashboard cards, and a check-in screen with camera or manual fallback.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest'
import { parseCheckinScanValue } from './checkin'

describe('parseCheckinScanValue', () => {
  it('parses the inscription prefix into an id', () => {
    expect(parseCheckinScanValue('inscripcion:42')).toEqual({ inscripcionId: 42 })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd mobile && npx vitest run src/lib/checkin.test.ts`
Expected: FAIL with missing helper export

- [ ] **Step 3: Write minimal implementation**

```ts
export function parseCheckinScanValue(value: string) {
  const match = value.trim().match(/^inscripcion:(\d+)$/)
  return match ? { inscripcionId: Number(match[1]) } : null
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd mobile && npx vitest run src/lib/checkin.test.ts && npx tsc --noEmit`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add mobile/src/lib/checkin.ts mobile/src/lib/checkin.test.ts mobile/src/features/checkin/checkin-form.tsx mobile/src/features/checkin/checkin-scanner.tsx mobile/src/features/staff/staff-dashboard.tsx mobile/app/(app)/(tabs)/staff.tsx mobile/app/(app)/checkin.tsx
git commit -m "feat: add mobile staff checkin"
```

### Task 5: Mobile docs and final verification

**Files:**
- Modify: `docs/proyecto-status.md`
- Modify: `docs/roadmap.md`
- Create: `mobile/README.md`

**Interfaces:**
- Consumes: the completed mobile app implementation.
- Produces: updated project status notes, a mobile runbook, and the final verification record.

- [ ] **Step 1: Update project docs**

Mark the mobile app as completed in `docs/proyecto-status.md` and `docs/roadmap.md`, and add `mobile/README.md` with local run instructions.

- [ ] **Step 2: Run final verification**

Run:
`cd mobile && npx vitest run`
`cd mobile && npx tsc --noEmit`
`cd mobile && npx expo doctor`

Expected: all pass.

- [ ] **Step 3: Commit**

```bash
git add docs/proyecto-status.md docs/roadmap.md mobile/README.md
git commit -m "docs: mark mobile app complete"
```
