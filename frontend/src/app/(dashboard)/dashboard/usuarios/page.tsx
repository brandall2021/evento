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
import { useUsers, useCreateUser, useDeleteUser } from "@/hooks/use-users"
import type { User } from "@/types/user"
import { PlusIcon, Trash2Icon } from "lucide-react"

const createUserSchema = z.object({
  email: z.email("Email inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
  firstName: z.string().min(1, "Nombre requerido"),
  lastName: z.string().min(1, "Apellido requerido"),
  phone: z.string().optional(),
})

type CreateUserForm = z.infer<typeof createUserSchema>

export default function UsuariosPage() {
  const [page, setPage] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)

  const { data, isLoading } = useUsers({ page, limit: 10 })
  const createUser = useCreateUser()
  const deleteUser = useDeleteUser()

  const form = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      phone: "",
    },
  })

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
        <span
          className={
            user.isActive
              ? "text-sm text-green-600"
              : "text-sm text-muted-foreground"
          }
        >
          {user.isActive ? "Activo" : "Inactivo"}
        </span>
      ),
    },
  ]

  async function onSubmit(values: CreateUserForm) {
    try {
      await createUser.mutateAsync(values)
      toast.success("Usuario creado")
      setDialogOpen(false)
      form.reset()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al crear usuario")
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Usuarios</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona los usuarios del sistema
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <PlusIcon className="size-4" />
          Nuevo usuario
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        meta={data?.meta}
        onPageChange={setPage}
        isLoading={isLoading}
        emptyMessage="No hay usuarios registrados"
        actions={(user) => (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => handleDelete(user)}
            disabled={deleteUser.isPending}
          >
            <Trash2Icon className="size-4 text-destructive" />
          </Button>
        )}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo usuario</DialogTitle>
            <DialogDescription>
              Completa los datos para crear un nuevo usuario
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="firstName">Nombre</Label>
                <Input id="firstName" {...form.register("firstName")} />
                {form.formState.errors.firstName && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.firstName.message}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="lastName">Apellido</Label>
                <Input id="lastName" {...form.register("lastName")} />
                {form.formState.errors.lastName && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...form.register("email")} />
              {form.formState.errors.email && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" type="password" {...form.register("password")} />
              {form.formState.errors.password && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone">Teléfono (opcional)</Label>
              <Input id="phone" {...form.register("phone")} />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={createUser.isPending}>
                {createUser.isPending ? "Creando…" : "Crear usuario"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
