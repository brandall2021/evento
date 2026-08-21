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
import { useCreateUser, useDeleteUser, useUpdateUser, useUsers } from "@/hooks/use-users"
import type { User } from "@/types/user"
import { PencilIcon, PlusIcon, Trash2Icon, Users } from "lucide-react"

const createUserSchema = z.object({
  email: z.email("Email inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
  firstName: z.string().min(1, "Nombre requerido"),
  lastName: z.string().min(1, "Apellido requerido"),
  phone: z.string().optional(),
})

const updateUserSchema = z.object({
  email: z.email("Email inválido").optional(),
  password: z.string().min(8, "Mínimo 8 caracteres").optional(),
  firstName: z.string().min(1, "Nombre requerido").optional(),
  lastName: z.string().min(1, "Apellido requerido").optional(),
  phone: z.string().optional(),
  isActive: z.boolean().optional(),
})

type CreateUserForm = z.infer<typeof createUserSchema>
type UpdateUserForm = z.infer<typeof updateUserSchema>

export default function UsuariosPage() {
  const [page, setPage] = useState(1)
  const [createOpen, setCreateOpen] = useState(false)
  const [editUser, setEditUser] = useState<User | null>(null)

  const { data, isLoading } = useUsers({ page, limit: 10 })
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()
  const deleteUser = useDeleteUser()

  const createForm = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { email: "", password: "", firstName: "", lastName: "", phone: "" },
  })

  const editForm = useForm<UpdateUserForm>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: { email: "", password: "", firstName: "", lastName: "", phone: "", isActive: true },
  })

  useEffect(() => {
    if (editUser) {
      editForm.reset({
        email: editUser.email,
        password: "",
        firstName: editUser.firstName,
        lastName: editUser.lastName,
        phone: editUser.phone ?? "",
        isActive: editUser.isActive,
      })
    }
  }, [editUser, editForm])

  const columns: Column<User>[] = [
    {
      key: "name",
      header: "Nombre",
      render: (user) => `${user.firstName} ${user.lastName}`,
    },
    { key: "email", header: "Email" },
    {
      key: "isActive",
      header: "Estado",
      render: (user) => (
        <span className={user.isActive ? "text-sm text-green-600" : "text-sm text-muted-foreground"}>
          {user.isActive ? "Activo" : "Inactivo"}
        </span>
      ),
    },
  ]

  async function onCreate(values: CreateUserForm) {
    try {
      await createUser.mutateAsync({ ...values, phone: values.phone || undefined })
      toast.success("Usuario creado")
      setCreateOpen(false)
      createForm.reset()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al crear usuario")
    }
  }

  async function onEdit(values: UpdateUserForm) {
    if (!editUser) return
    try {
      await updateUser.mutateAsync({
        id: editUser.id,
        payload: {
          ...values,
          email: values.email || undefined,
          password: values.password || undefined,
          phone: values.phone === "" ? null : values.phone,
        },
      })
      toast.success("Usuario actualizado")
      setEditUser(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al actualizar usuario")
    }
  }

  async function handleDelete(user: User) {
    if (!confirm(`¿Eliminar usuario ${user.email}?`)) return
    try {
      await deleteUser.mutateAsync(user.id)
      toast.success("Usuario eliminado")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al eliminar")
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="border-border/70 bg-card/90 shadow-[0_18px_50px_rgba(11,42,85,0.08)]">
        <CardContent className="flex flex-col gap-5 p-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
              <Users className="size-3.5" />
              LACDI
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-balance">Usuarios</h1>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Gestiona los usuarios del sistema con una vista más clara y consistente.
              </p>
            </div>
          </div>
          <Button onClick={() => setCreateOpen(true)} className="shrink-0">
            <PlusIcon className="size-4" />
            Nuevo usuario
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/90 shadow-[0_18px_50px_rgba(11,42,85,0.08)]">
        <CardContent className="p-2 sm:p-4">
          <DataTable
            columns={columns}
            data={data?.data ?? []}
            meta={data?.meta}
            onPageChange={setPage}
            isLoading={isLoading}
            emptyMessage="No hay usuarios registrados"
            actions={(user) => (
              <div className="flex items-center justify-end gap-1">
                <Button variant="ghost" size="icon-sm" onClick={() => setEditUser(user)}>
                  <PencilIcon className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleDelete(user)}
                  disabled={deleteUser.isPending}
                >
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
            <DialogTitle>Nuevo usuario</DialogTitle>
            <DialogDescription>Completa los datos para crear un nuevo usuario</DialogDescription>
          </DialogHeader>

          <form onSubmit={createForm.handleSubmit(onCreate)} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="firstName">Nombre</Label>
                <Input id="firstName" {...createForm.register("firstName")} />
                {createForm.formState.errors.firstName && <p className="text-xs text-destructive">{createForm.formState.errors.firstName.message}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="lastName">Apellido</Label>
                <Input id="lastName" {...createForm.register("lastName")} />
                {createForm.formState.errors.lastName && <p className="text-xs text-destructive">{createForm.formState.errors.lastName.message}</p>}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...createForm.register("email")} />
              {createForm.formState.errors.email && <p className="text-xs text-destructive">{createForm.formState.errors.email.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" type="password" {...createForm.register("password")} />
              {createForm.formState.errors.password && <p className="text-xs text-destructive">{createForm.formState.errors.password.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone">Teléfono (opcional)</Label>
              <Input id="phone" {...createForm.register("phone")} />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={createUser.isPending}>{createUser.isPending ? "Creando…" : "Crear usuario"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar usuario</DialogTitle>
            <DialogDescription>Actualiza los datos del usuario seleccionado</DialogDescription>
          </DialogHeader>

          <form onSubmit={editForm.handleSubmit(onEdit)} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="editFirstName">Nombre</Label>
                <Input id="editFirstName" {...editForm.register("firstName")} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="editLastName">Apellido</Label>
                <Input id="editLastName" {...editForm.register("lastName")} />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="editEmail">Email</Label>
              <Input id="editEmail" type="email" {...editForm.register("email")} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="editPassword">Contraseña nueva (opcional)</Label>
              <Input id="editPassword" type="password" {...editForm.register("password")} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="editPhone">Teléfono</Label>
              <Input id="editPhone" {...editForm.register("phone")} />
            </div>

            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input type="checkbox" {...editForm.register("isActive")} />
              Activo
            </label>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditUser(null)}>Cancelar</Button>
              <Button type="submit" disabled={updateUser.isPending}>{updateUser.isPending ? "Guardando…" : "Guardar cambios"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
