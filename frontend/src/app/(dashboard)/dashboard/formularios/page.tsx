"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { DataTable, type Column } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCreateForm, useForms } from "@/hooks/use-forms"
import type { FormTemplate } from "@/types/form"
import { FormInput, PlusIcon } from "lucide-react"

export default function FormulariosPage() {
  const router = useRouter()
  const [createOpen, setCreateOpen] = useState(false)
  const [slug, setSlug] = useState("")
  const [name, setName] = useState("")
  const [context, setContext] = useState("")
  const [draftSchema, setDraftSchema] = useState('{\n  "fields": []\n}')

  const { data, isLoading } = useForms()
  const createForm = useCreateForm()
  const forms = data ?? []

  const columns: Column<FormTemplate>[] = [
    { key: "name", header: "Nombre" },
    { key: "slug", header: "Slug" },
    { key: "context", header: "Contexto", render: (form) => form.context || "—" },
    { key: "status", header: "Estado" },
  ]

  async function submitCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    try {
      const parsedSchema = JSON.parse(draftSchema)
      const created = await createForm.mutateAsync({
        slug,
        name,
        context: context || null,
        draft_schema_json: parsedSchema,
      })
      toast.success("Formulario creado")
      setCreateOpen(false)
      setSlug("")
      setName("")
      setContext("")
      setDraftSchema('{\n  "fields": []\n}')
      router.push(`/dashboard/formularios/${created.id}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo crear el formulario")
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/70 bg-card/90 shadow-[0_18px_50px_rgba(11,42,85,0.08)]">
        <CardContent className="flex flex-col gap-5 p-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
              <FormInput className="size-3.5" />
              LACDI
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-balance">Formularios</h1>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Crea y administra formularios versionados desde el panel.
              </p>
            </div>
          </div>
          <Button onClick={() => setCreateOpen(true)} className="shrink-0">
            <PlusIcon className="size-4" />
            Nuevo formulario
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/90 shadow-[0_18px_50px_rgba(11,42,85,0.08)]">
        <CardContent className="p-2 sm:p-4">
          <DataTable
            columns={columns}
            data={forms}
            isLoading={isLoading}
            emptyMessage="No hay formularios"
            actions={(form) => (
              <div className="flex justify-end">
                <Link href={`/dashboard/formularios/${form.id}`} className="inline-flex items-center rounded-full border border-border px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-accent hover:text-accent-foreground">
                  Editar
                </Link>
              </div>
            )}
          />
        </CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nuevo formulario</DialogTitle>
            <DialogDescription>Creá el borrador inicial y después editá su esquema JSON.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submitCreate} className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" value={slug} onChange={(event) => setSlug(event.target.value)} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" value={name} onChange={(event) => setName(event.target.value)} required />
            </div>
            <div className="md:col-span-2 flex flex-col gap-1.5">
              <Label htmlFor="context">Contexto</Label>
              <Input id="context" value={context} onChange={(event) => setContext(event.target.value)} placeholder="inscription, cms, admin" />
            </div>
            <div className="md:col-span-2 flex flex-col gap-1.5">
              <Label htmlFor="draft_schema_json">Schema JSON</Label>
              <textarea id="draft_schema_json" value={draftSchema} onChange={(event) => setDraftSchema(event.target.value)} className="min-h-48 rounded-xl border border-input bg-background px-3 py-2 text-sm font-mono outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
            <DialogFooter className="md:col-span-2">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={createForm.isPending}>{createForm.isPending ? "Creando…" : "Crear"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
