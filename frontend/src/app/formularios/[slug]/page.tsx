"use client"

import { useEffect } from "react"
import { useParams } from "next/navigation"
import { useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { usePublicForm, useSubmitPublicForm } from "@/hooks/use-public-forms"
import { getFieldRules, getVisibleFormFields, getRenderableFormSchema } from "@/lib/forms-renderer"

type FormValues = Record<string, unknown>

export default function PublicFormPage() {
  const params = useParams<{ slug: string }>()
  const slug = params.slug
  const { data, isLoading } = usePublicForm(slug)
  const submitForm = useSubmitPublicForm()

  const schema = getRenderableFormSchema(data?.draft_schema_json || data?.published_version?.schema_json || { fields: [] })

  const { register, handleSubmit, control, reset } = useForm<FormValues>({ defaultValues: {} })
  const currentValues = useWatch({ control }) ?? {}
  const liveVisibleFields = getVisibleFormFields(schema, currentValues)

  useEffect(() => {
    reset({})
  }, [slug, reset])

  if (isLoading || !data) {
    return <div className="px-4 py-10 text-sm text-muted-foreground">Cargando formulario…</div>
  }

  async function onSubmit(values: FormValues) {
    try {
      const payload = Object.fromEntries(liveVisibleFields.map((field) => [field.name, values[field.name]]))
      await submitForm.mutateAsync({ slug, payload })
      toast.success("Formulario enviado")
      reset({})
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo enviar el formulario")
    }
  }

  return (
    <main className="min-h-dvh bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <Card className="border-border/70 bg-card/90 shadow-[0_18px_50px_rgba(11,42,85,0.08)]">
          <CardContent className="p-6">
            <h1 className="text-3xl font-semibold tracking-tight">{data.name}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{data.context || "Formulario público"}</p>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/90 shadow-[0_18px_50px_rgba(11,42,85,0.08)]">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
              {liveVisibleFields.map((field) => {
                const rules = getFieldRules(field)
                if (field.type === "textarea") {
                  return (
                    <div key={field.id} className="flex flex-col gap-1.5">
                      <Label htmlFor={field.name}>{field.label}</Label>
                      <textarea id={field.name} {...register(field.name, rules)} className="min-h-28 rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                    </div>
                  )
                }

                if (field.type === "checkbox") {
                  return (
                    <label key={field.id} className="flex items-center gap-2 rounded-xl border border-border/70 px-4 py-3 text-sm">
                      <input type="checkbox" {...register(field.name, rules)} />
                      <span>{field.label}</span>
                    </label>
                  )
                }

                if (field.type === "select") {
                  return (
                    <div key={field.id} className="flex flex-col gap-1.5">
                      <Label htmlFor={field.name}>{field.label}</Label>
                      <select id={field.name} {...register(field.name, rules)} className="h-10 rounded-xl border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        <option value="">Seleccionar</option>
                        {field.options?.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>
                  )
                }

                const inputType = field.type === "email" || field.type === "number" || field.type === "date" ? field.type : "text"
                return (
                  <div key={field.id} className="flex flex-col gap-1.5">
                    <Label htmlFor={field.name}>{field.label}</Label>
                    <Input id={field.name} type={inputType} placeholder={field.placeholder || undefined} {...register(field.name, rules)} />
                  </div>
                )
              })}

              {liveVisibleFields.length === 0 && (
                <p className="text-sm text-muted-foreground">Este formulario no tiene campos visibles todavía.</p>
              )}

              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={submitForm.isPending}>{submitForm.isPending ? "Enviando…" : "Enviar formulario"}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
