# Dynamic Form Builder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a DB-backed form builder with draft/publication versions, admin editing, and public rendering.

**Architecture:** Add a new Nest `forms` module for templates, versions, and submissions. Expose admin CRUD under `/forms` and public read endpoints under `/public/forms`. On the frontend, add a dashboard builder for editing schema JSON and a public renderer that reads only the published version.

**Tech Stack:** NestJS, TypeORM, Next.js App Router, TanStack Query, React Hook Form, Zod, Tailwind, shadcn/ui.

**Spec:** `docs/superpowers/specs/2026-08-21-dynamic-form-builder.md`

## Global Constraints

- Versioned forms must keep published snapshots immutable.
- The public renderer must read only published versions.
- Supported rules in this slice are `required`, length, range, regex, and simple conditionals.
- Keep the first implementation focused on a JSON schema form model, not drag-and-drop layout tooling.

---

### Task 1: Backend form model

**Files:**
- Create: `backend-next/src/forms/form-template.entity.ts`
- Create: `backend-next/src/forms/form-template-version.entity.ts`
- Create: `backend-next/src/forms/form-submission.entity.ts`
- Create: `backend-next/src/forms/forms.module.ts`
- Modify: `backend-next/src/app.module.ts`

**Interfaces:**
- Consumes: TypeORM patterns already used by `cms` and `public-api` modules.
- Produces: entities and module exports for the forms service and controller.

- [ ] **Step 1: Write the failing test**

```ts
test('forms module entities can be imported', async () => {
  const module = await import('../../src/forms/forms.module')
  expect(module.FormsModule).toBeDefined()
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/forms/forms.module.spec.ts --runInBand`
Expected: module not found / import failure

- [ ] **Step 3: Write minimal implementation**

```ts
@Entity('form_templates')
export class FormTemplate {
  @PrimaryGeneratedColumn()
  id: number
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/forms/forms.module.spec.ts --runInBand`
Expected: import succeeds

- [ ] **Step 5: Commit**

```bash
git add backend-next/src/forms backend-next/src/app.module.ts
git commit -m "feat: add forms model"
```

### Task 2: Backend forms API

**Files:**
- Create: `backend-next/src/forms/forms.controller.ts`
- Create: `backend-next/src/forms/forms.service.ts`
- Modify: `backend-next/src/forms/forms.module.ts`
- Modify: `backend-next/src/public-api/public-api.controller.ts`
- Modify: `backend-next/src/public-api/public-api.service.ts`

**Interfaces:**
- Consumes: `FormTemplate`, `FormTemplateVersion`, `FormSubmission`.
- Produces: `/forms` admin CRUD and `/public/forms/:slug` public reads.

- [ ] **Step 1: Write the failing test**

```ts
test('public forms endpoint returns published schema only', async () => {
  const result = await service.formBySlug('registration')
  expect(result.status).toBe('published')
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/forms/forms.service.spec.ts --runInBand`
Expected: method missing or returns undefined

- [ ] **Step 3: Write minimal implementation**

```ts
async formBySlug(slug: string) {
  return this.formRepo.findOne({ where: { slug, status: 'published' } })
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/forms/forms.service.spec.ts --runInBand`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend-next/src/forms backend-next/src/public-api
git commit -m "feat: expose forms api"
```

### Task 3: Admin builder UI

**Files:**
- Create: `frontend/src/types/form.ts`
- Create: `frontend/src/hooks/use-forms.ts`
- Create: `frontend/src/app/(dashboard)/dashboard/formularios/page.tsx`
- Create: `frontend/src/app/(dashboard)/dashboard/formularios/[id]/page.tsx`

**Interfaces:**
- Consumes: forms admin API and JSON schema shape.
- Produces: form list, edit screen, publish action, and schema editor.

- [ ] **Step 1: Write the failing test**

```ts
test('form schema normalizer preserves field order', () => {
  expect(normalizeFormSchema(input).fields[0].name).toBe('email')
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test src/lib/forms-schema.test.js`
Expected: helper missing

- [ ] **Step 3: Write minimal implementation**

```ts
export function normalizeFormSchema(input: unknown) {
  return { fields: Array.isArray(input) ? input : [] }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run lint && npm run build`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src/types frontend/src/hooks frontend/src/app/(dashboard)/dashboard/formularios
git commit -m "feat: add form builder ui"
```

### Task 4: Public renderer

**Files:**
- Create: `frontend/src/app/formularios/[slug]/page.tsx`
- Create: `frontend/src/hooks/use-public-forms.ts`
- Create: `frontend/src/lib/forms-renderer.ts`

**Interfaces:**
- Consumes: published form API and schema evaluator.
- Produces: public form page and submission flow.

- [ ] **Step 1: Write the failing test**

```ts
test('renderer hides conditional field until dependency matches', () => {
  expect(rendered.fields.hiddenField).toBeUndefined()
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test src/lib/forms-renderer.test.js`
Expected: failure from missing renderer

- [ ] **Step 3: Write minimal implementation**

```ts
export function evaluateVisibility(schema, values) {
  return schema.fields.filter((field) => !field.condition || values[field.condition.field] === field.condition.equals)
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run lint && npm run build`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src/app/formularios frontend/src/hooks frontend/src/lib/forms-renderer.ts
git commit -m "feat: add public form renderer"
```
