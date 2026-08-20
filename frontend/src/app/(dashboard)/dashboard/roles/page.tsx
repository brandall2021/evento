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
import { useRoles, useCreateRole } from "@/hooks/use-roles"
import type { Role } from "@/types/role"
import { PlusIcon, Shield } from "lucide-react"

const createRoleSchema = z.object({
  name: z.string().min(1, "Nombre requerido"),
  description: z.string().optional(),
})

type CreateRoleForm = z.infer<typeof createRoleSchema>

export default function RolesPage() {
  const [dialogOpen, setDialogOpen] = useState(false)

  const { data: roles, isLoading } = useRoles()
  const createRole = useCreateRole()

  const form = useForm<CreateRoleForm>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: { name: "", description: "" },
  })

  const columns: Column<Role>[] = [
    { key: "name", header: "Nombre" },
    {
      key: "description",
      header: "Descripción",
      render: (role) => (
        <span className="text-muted-foreground">
          {role.description || "—"}
        </span>
      ),
    },
    {
      key: "isSystem",
      header: "Tipo",
      render: (role) => (
        <span
          className={
            role.isSystem
              ? "text-sm font-medium"
              : "text-sm text-muted-foreground"
          }
        >
          {role.isSystem ? "Sistema" : "Personalizado"}
        </span>
      ),
    },
  ]

  async function onSubmit(values: CreateRoleForm) {
    try {
      await createRole.mutateAsync(values)
      toast.success("Rol creado")
      setDialogOpen(false)
      form.reset()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al crear rol")
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="border-border/70 bg-card/90 shadow-[0_18px_50px_rgba(11,42,85,0.08)]">
        <CardContent className="flex flex-col gap-5 p-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
              <Shield className="size-3.5" />
              LACDI
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-balance">Roles</h1>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Gestiona los roles y permisos con una jerarquía visual más clara.
              </p>
            </div>
          </div>
          <Button onClick={() => setDialogOpen(true)} className="shrink-0">
            <PlusIcon className="size-4" />
            Nuevo rol
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/90 shadow-[0_18px_50px_rgba(11,42,85,0.08)]">
        <CardContent className="p-2 sm:p-4">
          <DataTable
            columns={columns}
            data={roles ?? []}
            isLoading={isLoading}
            emptyMessage="No hay roles registrados"
          />
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo rol</DialogTitle>
            <DialogDescription>
              Crea un nuevo rol con nombre y descripción opcional
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
              <Label htmlFor="description">Descripción</Label>
              <Input id="description" {...form.register("description")} />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={createRole.isPending}>
                {createRole.isPending ? "Creando…" : "Crear rol"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
