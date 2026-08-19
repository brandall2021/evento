"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod/v4"
import { toast } from "sonner"
import { DataTable, type Column } from "@/components/data-table"
import { Button } from "@/components/ui/button"
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
import { PlusIcon } from "lucide-react"

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Roles</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona los roles y permisos
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <PlusIcon className="size-4" />
          Nuevo rol
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={roles ?? []}
        isLoading={isLoading}
        emptyMessage="No hay roles registrados"
      />

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
