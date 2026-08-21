"use client"

import { useEffect, useMemo, useState } from "react"
import { useForm, type Resolver, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod/v4"
import { toast } from "sonner"
import { DataTable, type Column } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCreateRole, useDeleteRole, useRoles, useUpdateRole } from "@/hooks/use-roles"
import { usePermissions } from "@/hooks/use-permissions"
import type { Permission } from "@/types/permission"
import type { Role } from "@/types/role"
import { PencilIcon, PlusIcon, Shield, Trash2Icon } from "lucide-react"

const createRoleSchema = z.object({
  name: z.string().min(1, "Nombre requerido"),
  description: z.string().optional(),
})

const updateRoleSchema = z.object({
  name: z.string().min(1, "Nombre requerido").optional(),
  description: z.string().optional(),
  permissionIds: z.array(z.string()).default([]),
})

type CreateRoleForm = z.infer<typeof createRoleSchema>
type UpdateRoleForm = z.infer<typeof updateRoleSchema>

export default function RolesPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editRole, setEditRole] = useState<Role | null>(null)

  const { data: roles, isLoading } = useRoles()
  const { data: permissions } = usePermissions()
  const createRole = useCreateRole()
  const updateRole = useUpdateRole()
  const deleteRole = useDeleteRole()

  const createForm = useForm<CreateRoleForm>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: { name: "", description: "" },
  })

  const editForm = useForm<UpdateRoleForm>({
    resolver: zodResolver(updateRoleSchema) as Resolver<UpdateRoleForm>,
    defaultValues: { name: "", description: "", permissionIds: [] },
  })

  useEffect(() => {
    if (editRole) {
      editForm.reset({
        name: editRole.name,
        description: editRole.description ?? "",
        permissionIds: editRole.permissions.map((permission) => permission.id),
      })
    }
  }, [editRole, editForm])

  const columns: Column<Role>[] = [
    { key: "name", header: "Nombre" },
    {
      key: "description",
      header: "Descripción",
      render: (role) => <span className="text-muted-foreground">{role.description || "—"}</span>,
    },
    {
      key: "isSystem",
      header: "Tipo",
      render: (role) => (
        <span className={role.isSystem ? "text-sm font-medium" : "text-sm text-muted-foreground"}>
          {role.isSystem ? "Sistema" : "Personalizado"}
        </span>
      ),
    },
  ]

  const groupedPermissions = useMemo(() => {
    const map = new Map<string, Permission[]>()
    for (const permission of permissions ?? []) {
      const current = map.get(permission.module) ?? []
      current.push(permission)
      map.set(permission.module, current)
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b))
  }, [permissions])

  async function onCreate(values: CreateRoleForm) {
    try {
      await createRole.mutateAsync({ ...values, description: values.description || undefined })
      toast.success("Rol creado")
      setDialogOpen(false)
      createForm.reset()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al crear rol")
    }
  }

  async function onEdit(values: UpdateRoleForm) {
    if (!editRole) return
    try {
      await updateRole.mutateAsync({
        id: editRole.id,
        payload: {
          name: values.name || undefined,
          description: values.description || undefined,
          permissionIds: values.permissionIds,
        },
      })
      toast.success("Rol actualizado")
      setEditRole(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al actualizar rol")
    }
  }

  async function handleDelete(role: Role) {
    if (!confirm(`¿Eliminar rol ${role.name}?`)) return
    try {
      await deleteRole.mutateAsync(role.id)
      toast.success("Rol eliminado")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al eliminar rol")
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
            actions={(role) => (
              <div className="flex items-center justify-end gap-1">
                <Button variant="ghost" size="icon-sm" onClick={() => setEditRole(role)}>
                  <PencilIcon className="size-4" />
                </Button>
                <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(role)} disabled={deleteRole.isPending}>
                  <Trash2Icon className="size-4 text-destructive" />
                </Button>
              </div>
            )}
          />
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo rol</DialogTitle>
            <DialogDescription>Crea un nuevo rol con nombre y descripción opcional</DialogDescription>
          </DialogHeader>

          <form onSubmit={createForm.handleSubmit(onCreate)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" {...createForm.register("name")} />
              {createForm.formState.errors.name && <p className="text-xs text-destructive">{createForm.formState.errors.name.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="description">Descripción</Label>
              <Input id="description" {...createForm.register("description")} />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={createRole.isPending}>{createRole.isPending ? "Creando…" : "Crear rol"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editRole} onOpenChange={(open) => !open && setEditRole(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar rol</DialogTitle>
            <DialogDescription>Actualiza el nombre, la descripción y los permisos del rol</DialogDescription>
          </DialogHeader>

          <form onSubmit={editForm.handleSubmit(onEdit as SubmitHandler<UpdateRoleForm>)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="editName">Nombre</Label>
              <Input id="editName" {...editForm.register("name")} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="editDescription">Descripción</Label>
              <Input id="editDescription" {...editForm.register("description")} />
            </div>

            <div className="space-y-3 rounded-2xl border border-border/70 bg-muted/40 p-4">
              <div>
                <p className="text-sm font-medium text-foreground">Permisos</p>
                <p className="text-xs text-muted-foreground">Selecciona los permisos que tendrá este rol</p>
              </div>
              <div className="max-h-80 space-y-3 overflow-auto pr-1">
                {groupedPermissions.map(([module, perms]) => (
                  <div key={module} className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">{module}</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {perms.map((permission) => (
                        <label key={permission.id} className="flex items-start gap-2 rounded-xl border border-border/70 bg-background px-3 py-2 text-sm">
                          <input type="checkbox" value={permission.id} {...editForm.register("permissionIds")} className="mt-1" />
                          <span>
                            <span className="block font-medium text-foreground">{permission.code}</span>
                            <span className="block text-xs text-muted-foreground">{permission.description || permission.action}</span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditRole(null)}>Cancelar</Button>
              <Button type="submit" disabled={updateRole.isPending}>{updateRole.isPending ? "Guardando…" : "Guardar cambios"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
