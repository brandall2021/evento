"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod/v4"
import { toast } from "sonner"
import { DataTable, type Column } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCreateTenant, useDeleteTenant, useTenants, useUpdateTenant } from "@/hooks/use-tenants"
import type { Tenant } from "@/types/tenant"
import { Building2, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"

const tenantSchema = z.object({
  name: z.string().min(1, "Nombre requerido"),
  slug: z.string().min(1, "Slug requerido").regex(/^[a-z0-9-]+$/, "Solo minúsculas, números y guiones"),
  domain: z.string().optional(),
  logoUrl: z.string().optional(),
  bannerUrl: z.string().optional(),
  isActive: z.boolean().optional(),
})

type TenantForm = z.infer<typeof tenantSchema>

export default function InstitucionesPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const [editTenant, setEditTenant] = useState<Tenant | null>(null)

  const { data: tenants, isLoading } = useTenants()
  const createTenant = useCreateTenant()
  const updateTenant = useUpdateTenant()
  const deleteTenant = useDeleteTenant()

  const createForm = useForm<TenantForm>({
    resolver: zodResolver(tenantSchema),
    defaultValues: { name: "", slug: "", domain: "", logoUrl: "", bannerUrl: "", isActive: true },
  })

  const editForm = useForm<TenantForm>({
    resolver: zodResolver(tenantSchema),
    defaultValues: { name: "", slug: "", domain: "", logoUrl: "", bannerUrl: "", isActive: true },
  })

  useEffect(() => {
    if (editTenant) {
      editForm.reset({
        name: editTenant.name,
        slug: editTenant.slug,
        domain: editTenant.domain ?? "",
        logoUrl: editTenant.logoUrl ?? "",
        bannerUrl: editTenant.bannerUrl ?? "",
        isActive: editTenant.isActive,
      })
    }
  }, [editTenant, editForm])

  const columns: Column<Tenant>[] = [
    { key: "name", header: "Nombre" },
    { key: "slug", header: "Slug" },
    { key: "domain", header: "Dominio", render: (tenant) => <span className="text-muted-foreground">{tenant.domain || "—"}</span> },
    {
      key: "isActive",
      header: "Estado",
      render: (tenant) => (
        <span className={tenant.isActive ? "text-sm text-green-600" : "text-sm text-muted-foreground"}>
          {tenant.isActive ? "Activa" : "Inactiva"}
        </span>
      ),
    },
  ]

  async function onCreate(values: TenantForm) {
    try {
      await createTenant.mutateAsync({
        name: values.name,
        slug: values.slug,
        domain: values.domain || undefined,
        logoUrl: values.logoUrl || undefined,
        bannerUrl: values.bannerUrl || undefined,
        isActive: values.isActive,
      })
      toast.success("Institución creada")
      setCreateOpen(false)
      createForm.reset()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al crear institución")
    }
  }

  async function onEdit(values: TenantForm) {
    if (!editTenant) return
    try {
      await updateTenant.mutateAsync({
        id: editTenant.id,
        payload: {
          name: values.name,
          slug: values.slug,
          domain: values.domain || null,
          logoUrl: values.logoUrl || null,
          bannerUrl: values.bannerUrl || null,
          isActive: values.isActive,
        },
      })
      toast.success("Institución actualizada")
      setEditTenant(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al actualizar institución")
    }
  }

  async function handleDelete(tenant: Tenant) {
    if (!confirm(`¿Eliminar institución ${tenant.name}?`)) return
    try {
      await deleteTenant.mutateAsync(tenant.id)
      toast.success("Institución eliminada")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al eliminar institución")
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
          <Button onClick={() => setCreateOpen(true)} className="shrink-0">
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
            actions={(tenant) => (
              <div className="flex items-center justify-end gap-1">
                <Button variant="ghost" size="icon-sm" onClick={() => setEditTenant(tenant)}>
                  <PencilIcon className="size-4" />
                </Button>
                <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(tenant)} disabled={deleteTenant.isPending}>
                  <Trash2Icon className="size-4 text-destructive" />
                </Button>
              </div>
            )}
          />
        </CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva institución</DialogTitle>
            <DialogDescription>Crea un nuevo tenant en el sistema</DialogDescription>
          </DialogHeader>

          <form onSubmit={createForm.handleSubmit(onCreate)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" {...createForm.register("name")} />
              {createForm.formState.errors.name && <p className="text-xs text-destructive">{createForm.formState.errors.name.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" placeholder="mi-institucion" {...createForm.register("slug")} />
              {createForm.formState.errors.slug && <p className="text-xs text-destructive">{createForm.formState.errors.slug.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="domain">Dominio (opcional)</Label>
              <Input id="domain" placeholder="ejemplo.com" {...createForm.register("domain")} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="logoUrl">Logo URL</Label>
                <Input id="logoUrl" {...createForm.register("logoUrl")} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="bannerUrl">Banner URL</Label>
                <Input id="bannerUrl" {...createForm.register("bannerUrl")} />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input type="checkbox" {...createForm.register("isActive")} />
              Activa
            </label>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={createTenant.isPending}>{createTenant.isPending ? "Creando…" : "Crear institución"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editTenant} onOpenChange={(open) => !open && setEditTenant(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar institución</DialogTitle>
            <DialogDescription>Actualiza los datos del tenant seleccionado</DialogDescription>
          </DialogHeader>

          <form onSubmit={editForm.handleSubmit(onEdit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="editName">Nombre</Label>
              <Input id="editName" {...editForm.register("name")} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="editSlug">Slug</Label>
              <Input id="editSlug" {...editForm.register("slug")} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="editDomain">Dominio</Label>
              <Input id="editDomain" {...editForm.register("domain")} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="editLogoUrl">Logo URL</Label>
                <Input id="editLogoUrl" {...editForm.register("logoUrl")} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="editBannerUrl">Banner URL</Label>
                <Input id="editBannerUrl" {...editForm.register("bannerUrl")} />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input type="checkbox" {...editForm.register("isActive")} />
              Activa
            </label>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditTenant(null)}>Cancelar</Button>
              <Button type="submit" disabled={updateTenant.isPending}>{updateTenant.isPending ? "Guardando…" : "Guardar cambios"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
