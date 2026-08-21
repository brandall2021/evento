"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useFormTemplate, usePublishForm, useUpdateForm } from "@/hooks/use-forms"
import type { FormTemplate } from "@/types/form"

export default function FormularioDetailPage() {
  const params = useParams<{ id: string }>()
  const formId = Number(params.id)
  const { data, isLoading } = useFormTemplate(Number.isFinite(formId) ? formId : undefined)

  if (isLoading || !data) {
    return <div className="text-sm text-muted-foreground">Cargando formulario…</div>
  }

  return <FormularioEditor formId={formId} initialForm={data} />
}

function FormularioEditor({ formId, initialForm }: { formId: number; initialForm: FormTemplate }) {
  const updateForm = useUpdateForm()
  const publishForm = usePublishForm()

  const [slug, setSlug] = useState(initialForm.slug)
  const [name, setName] = useState(initialForm.name)
  const [context, setContext] = useState(initialForm.context || "")
  const [draftSchema, setDraftSchema] = useState(JSON.stringify(initialForm.draft_schema_json || { fields: [] }, null, 2))

  async function submitUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    try {
      const parsedSchema = JSON.parse(draftSchema)
      await updateForm.mutateAsync({
        id: formId,
        payload: {
          slug,
          name,
          context: context || null,
          draft_schema_json: parsedSchema,
        },
      })
      toast.success("Formulario actualizado")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo actualizar el formulario")
    }
  }

  async function publish() {
    try {
      await publishForm.mutateAsync(formId)
      toast.success("Formulario publicado")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo publicar el formulario")
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/70 bg-card/90 shadow-[0_18px_50px_rgba(11,42,85,0.08)]">
        <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{initialForm.name}</h1>
            <p className="mt-2 text-sm text-muted-foreground">Estado: {initialForm.status}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={publishForm.isPending ? undefined : publish} disabled={publishForm.isPending}>
              {publishForm.isPending ? "Publicando…" : "Publicar"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/90 shadow-[0_18px_50px_rgba(11,42,85,0.08)]">
        <CardContent className="p-6">
          <form onSubmit={submitUpdate} className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" value={slug} onChange={(event) => setSlug(event.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" value={name} onChange={(event) => setName(event.target.value)} />
            </div>
            <div className="md:col-span-2 flex flex-col gap-1.5">
              <Label htmlFor="context">Contexto</Label>
              <Input id="context" value={context} onChange={(event) => setContext(event.target.value)} />
            </div>
            <div className="md:col-span-2 flex flex-col gap-1.5">
              <Label htmlFor="draft_schema_json">Schema JSON</Label>
              <textarea id="draft_schema_json" value={draftSchema} onChange={(event) => setDraftSchema(event.target.value)} className="min-h-72 rounded-xl border border-input bg-background px-3 py-2 text-sm font-mono outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <Button type="submit" disabled={updateForm.isPending}>{updateForm.isPending ? "Guardando…" : "Guardar borrador"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
