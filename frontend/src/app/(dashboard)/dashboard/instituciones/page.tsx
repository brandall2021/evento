"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod/v4"
import { toast } from "sonner"
import { DataTable, type Column } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { useTenants, useCreateTenant } from "@/hooks/use-tenants"
import type { Tenant } from "@/types/tenant"
import { Building2, PlusIcon } from "lucide-react"

const createTenantSchema = z.object({
  name: z.string().min(1, "Nombre requerido"),
  slug: z.string().min(1, "Slug requerido").regex(/^[a-z0-9-]+$/, "Solo minúsculas, números y guiones"),
  domain: z.string().optional(),
})

type CreateTenantForm = z.infer<typeof createTenantSchema>

export default function InstitucionesPage() {
  const [dialogOpen, setDialogOpen] = useState(false)

  const { data: tenants, isLoading } = useTenants()
  const createTenant = useCreateTenant()

  const form = useForm<CreateTenantForm>({
    resolver: zodResolver(createTenantSchema),
    defaultValues: { name: "", slug: "", domain: "" },
  })

  const columns: Column<Tenant>[] = [
    { key: "name", header: "Nombre" },
    { key: "slug", header: "Slug" },
    {
      key: "domain",
      header: "Dominio",
      render: (t) => (
        <span className="text-muted-foreground">{t.domain || "—"}</span>
      ),
    },
    {
      key: "isActive",
      header: "Estado",
      render: (t) => (
        <span
          className={
            t.isActive
              ? "text-sm text-green-600"
              : "text-sm text-muted-foreground"
          }
        >
          {t.isActive ? "Activa" : "Inactiva"}
        </span>
      ),
    },
  ]

  async function onSubmit(values: CreateTenantForm) {
    try {
      await createTenant.mutateAsync(values)
      toast.success("Institución creada")
      setDialogOpen(false)
      form.reset()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al crear institución")
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="border-border/70 bg-card/90 shadow-[0_18px_50px_rgba(11,42,85,0.08)]">
        <CardContent className="flex flex-col gap-5 p-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
              <Building2 className="size-3.5" />
              LACDI
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-balance">Instituciones</h1>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Gestiona los tenants con una vista de administración más sobria y clara.
              </p>
            </div>
          </div>
          <Button onClick={() => setDialogOpen(true)} className="shrink-0">
            <PlusIcon className="size-4" />
            Nueva institución
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/90 shadow-[0_18px_50px_rgba(11,42,85,0.08)]">
        <CardContent className="p-2 sm:p-4">
          <DataTable
            columns={columns}
            data={tenants ?? []}
            isLoading={isLoading}
            emptyMessage="No hay instituciones registradas"
          />
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva institución</DialogTitle>
            <DialogDescription>
              Crea una nueva institución (tenant) en el sistema
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" {...form.register("name")} />
              {form.formState.errors.name && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" placeholder="mi-institucion" {...form.register("slug")} />
              {form.formState.errors.slug && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.slug.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="domain">Dominio (opcional)</Label>
              <Input id="domain" placeholder="ejemplo.com" {...form.register("domain")} />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={createTenant.isPending}>
                {createTenant.isPending ? "Creando…" : "Crear institución"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
