"use client"

import { useEffect, useState } from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod/v4"
import { toast } from "sonner"
import { DataTable, type Column } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useChangeCourseStatus, useCreateCourse, useCourses, useDeleteCourse, useUpdateCourse } from "@/hooks/use-cursos"
import type { Course } from "@/types/course"
import { ArrowUpDown, CalendarDays, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"

const courseSchema = z.object({
  nombre: z.string().min(1, "Nombre requerido"),
  descripcion: z.string().optional(),
  categoria: z.string().optional(),
  fecha_inicio: z.string().min(1, "Fecha requerida"),
  fecha_fin: z.string().min(1, "Fecha requerida"),
  duracion_horas: z.string().min(1, "Debe ser mayor a 0"),
  modalidad: z.enum(["presencial", "virtual", "hibrido"]),
  cupos: z.string().min(1, "Debe ser mayor a 0"),
  precio: z.string().optional(),
  requisitos: z.string().optional(),
  aceptacion_auto: z.boolean().optional(),
})

type CourseForm = z.infer<typeof courseSchema>

function normalizeCourses(data: Course[] | { data: Course[] } | undefined): Course[] {
  if (!data) return []
  return Array.isArray(data) ? data : data.data
}

export default function CursosPage() {
  const [page, setPage] = useState(1)
  const [createOpen, setCreateOpen] = useState(false)
  const [editCourse, setEditCourse] = useState<Course | null>(null)

  const { data, isLoading } = useCourses({ page, pageSize: 10 })
  const createCourse = useCreateCourse()
  const updateCourse = useUpdateCourse()
  const deleteCourse = useDeleteCourse()
  const changeCourseStatus = useChangeCourseStatus()

  const createForm = useForm<CourseForm>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      nombre: "",
      descripcion: "",
      categoria: "",
      fecha_inicio: "",
      fecha_fin: "",
      duracion_horas: "1",
      modalidad: "virtual",
      cupos: "10",
      precio: "0",
      requisitos: "",
      aceptacion_auto: false,
    },
  })

  const editForm = useForm<CourseForm>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      nombre: "",
      descripcion: "",
      categoria: "",
      fecha_inicio: "",
      fecha_fin: "",
      duracion_horas: "1",
      modalidad: "virtual",
      cupos: "10",
      precio: "0",
      requisitos: "",
      aceptacion_auto: false,
    },
  })

  useEffect(() => {
    if (editCourse) {
      editForm.reset({
        nombre: editCourse.nombre,
        descripcion: editCourse.descripcion ?? "",
        categoria: editCourse.categoria ?? "",
        fecha_inicio: editCourse.fecha_inicio,
        fecha_fin: editCourse.fecha_fin,
        duracion_horas: String(editCourse.duracion_horas),
        modalidad: editCourse.modalidad,
        cupos: String(editCourse.cupos),
        precio: String(Number(editCourse.precio ?? 0)),
        requisitos: editCourse.requisitos ?? "",
        aceptacion_auto: editCourse.aceptacion_auto,
      })
    }
  }, [editCourse, editForm])

  const courses = normalizeCourses(data)
  const paginationMeta = !Array.isArray(data) && data
    ? {
        total: data.total,
        page: data.page,
        limit: data.pageSize,
        totalPages: Math.ceil(data.total / data.pageSize),
      }
    : undefined

  const columns: Column<Course>[] = [
    { key: "nombre", header: "Nombre" },
    { key: "categoria", header: "Categoría", render: (course) => course.categoria || "—" },
    { key: "modalidad", header: "Modalidad" },
    {
      key: "estado",
      header: "Estado",
      render: (course) => <span className="text-sm text-muted-foreground">{course.estado}</span>,
    },
    {
      key: "precio",
      header: "Precio",
      render: (course) => <span className="font-medium">${Number(course.precio).toFixed(2)}</span>,
    },
  ]

  async function onCreate(values: CourseForm) {
    try {
      await createCourse.mutateAsync({
        nombre: values.nombre,
        descripcion: values.descripcion || undefined,
        categoria: values.categoria || undefined,
        fecha_inicio: values.fecha_inicio,
        fecha_fin: values.fecha_fin,
        duracion_horas: Number(values.duracion_horas),
        modalidad: values.modalidad,
        cupos: Number(values.cupos),
        precio: values.precio ? Number(values.precio) : undefined,
        requisitos: values.requisitos || undefined,
        aceptacion_auto: values.aceptacion_auto,
      })
      toast.success("Curso creado")
      setCreateOpen(false)
      createForm.reset()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al crear curso")
    }
  }

  async function onEdit(values: CourseForm) {
    if (!editCourse) return
    try {
      await updateCourse.mutateAsync({
        id: editCourse.id,
        payload: {
          nombre: values.nombre,
          descripcion: values.descripcion || undefined,
          categoria: values.categoria || undefined,
          fecha_inicio: values.fecha_inicio,
          fecha_fin: values.fecha_fin,
          duracion_horas: Number(values.duracion_horas),
          modalidad: values.modalidad,
          cupos: Number(values.cupos),
          precio: values.precio ? Number(values.precio) : undefined,
          requisitos: values.requisitos || undefined,
          aceptacion_auto: values.aceptacion_auto,
        },
      })
      toast.success("Curso actualizado")
      setEditCourse(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al actualizar curso")
    }
  }

  async function handleDelete(course: Course) {
    if (!confirm(`¿Eliminar curso ${course.nombre}?`)) return
    try {
      await deleteCourse.mutateAsync(course.id)
      toast.success("Curso eliminado")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al eliminar curso")
    }
  }

  async function toggleStatus(course: Course) {
    const next = course.estado === "borrador" ? "publicado" : course.estado === "publicado" ? "finalizado" : "borrador"
    try {
      await changeCourseStatus.mutateAsync({ id: course.id, estado: next })
      toast.success("Estado actualizado")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al cambiar estado")
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/70 bg-card/90 shadow-[0_18px_50px_rgba(11,42,85,0.08)]">
        <CardContent className="flex flex-col gap-5 p-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
              <CalendarDays className="size-3.5" />
              LACDI
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-balance">Cursos</h1>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Gestiona la oferta académica y su estado de publicación.</p>
            </div>
          </div>
          <Button onClick={() => setCreateOpen(true)} className="shrink-0">
            <PlusIcon className="size-4" />
            Nuevo curso
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/90 shadow-[0_18px_50px_rgba(11,42,85,0.08)]">
        <CardContent className="p-2 sm:p-4">
          <DataTable
            columns={columns}
            data={courses}
            isLoading={isLoading}
            emptyMessage="No hay cursos cargados"
            meta={paginationMeta}
            onPageChange={setPage}
            actions={(course) => (
              <div className="flex items-center justify-end gap-1">
                <Button variant="ghost" size="icon-sm" onClick={() => toggleStatus(course)}>
                  <ArrowUpDown className="size-4" />
                </Button>
                <Button variant="ghost" size="icon-sm" onClick={() => setEditCourse(course)}>
                  <PencilIcon className="size-4" />
                </Button>
                <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(course)} disabled={deleteCourse.isPending}>
                  <Trash2Icon className="size-4 text-destructive" />
                </Button>
              </div>
            )}
          />
        </CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nuevo curso</DialogTitle>
            <DialogDescription>Crea un curso con los campos base del backend actual.</DialogDescription>
          </DialogHeader>
          <form onSubmit={createForm.handleSubmit(onCreate as SubmitHandler<CourseForm>)} className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2 flex flex-col gap-1.5">
              <Label htmlFor="nombre">Nombre</Label>
              <Input id="nombre" {...createForm.register("nombre")} />
            </div>
            <div className="md:col-span-2 flex flex-col gap-1.5">
              <Label htmlFor="descripcion">Descripción</Label>
              <textarea id="descripcion" className="min-h-28 rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" {...createForm.register("descripcion")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="categoria">Categoría</Label>
              <Input id="categoria" {...createForm.register("categoria")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="modalidad">Modalidad</Label>
              <select id="modalidad" className="h-9 rounded-xl border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" {...createForm.register("modalidad")}>
                <option value="presencial">Presencial</option>
                <option value="virtual">Virtual</option>
                <option value="hibrido">Híbrido</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5"><Label htmlFor="fecha_inicio">Fecha inicio</Label><Input id="fecha_inicio" type="date" {...createForm.register("fecha_inicio")} /></div>
            <div className="flex flex-col gap-1.5"><Label htmlFor="fecha_fin">Fecha fin</Label><Input id="fecha_fin" type="date" {...createForm.register("fecha_fin")} /></div>
            <div className="flex flex-col gap-1.5"><Label htmlFor="duracion_horas">Duración (hs)</Label><Input id="duracion_horas" type="number" {...createForm.register("duracion_horas")} /></div>
            <div className="flex flex-col gap-1.5"><Label htmlFor="cupos">Cupos</Label><Input id="cupos" type="number" {...createForm.register("cupos")} /></div>
            <div className="flex flex-col gap-1.5"><Label htmlFor="precio">Precio</Label><Input id="precio" type="number" step="0.01" {...createForm.register("precio")} /></div>
            <div className="flex items-center gap-2 self-end text-sm text-muted-foreground md:pt-6"><input type="checkbox" {...createForm.register("aceptacion_auto")} />Aceptación automática</div>
            <div className="md:col-span-2 flex flex-col gap-1.5"><Label htmlFor="requisitos">Requisitos</Label><textarea id="requisitos" className="min-h-24 rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" {...createForm.register("requisitos")} /></div>
            <DialogFooter className="md:col-span-2">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={createCourse.isPending}>{createCourse.isPending ? "Creando…" : "Crear curso"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editCourse} onOpenChange={(open) => !open && setEditCourse(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar curso</DialogTitle>
            <DialogDescription>Actualiza la oferta publicada.</DialogDescription>
          </DialogHeader>
          <form onSubmit={editForm.handleSubmit(onEdit as SubmitHandler<CourseForm>)} className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2 flex flex-col gap-1.5"><Label htmlFor="edit_nombre">Nombre</Label><Input id="edit_nombre" {...editForm.register("nombre")} /></div>
            <div className="md:col-span-2 flex flex-col gap-1.5"><Label htmlFor="edit_descripcion">Descripción</Label><textarea id="edit_descripcion" className="min-h-28 rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" {...editForm.register("descripcion")} /></div>
            <div className="flex flex-col gap-1.5"><Label htmlFor="edit_categoria">Categoría</Label><Input id="edit_categoria" {...editForm.register("categoria")} /></div>
            <div className="flex flex-col gap-1.5"><Label htmlFor="edit_modalidad">Modalidad</Label>
              <select id="edit_modalidad" className="h-9 rounded-xl border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" {...editForm.register("modalidad")}>
                <option value="presencial">Presencial</option>
                <option value="virtual">Virtual</option>
                <option value="hibrido">Híbrido</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5"><Label htmlFor="edit_fecha_inicio">Fecha inicio</Label><Input id="edit_fecha_inicio" type="date" {...editForm.register("fecha_inicio")} /></div>
            <div className="flex flex-col gap-1.5"><Label htmlFor="edit_fecha_fin">Fecha fin</Label><Input id="edit_fecha_fin" type="date" {...editForm.register("fecha_fin")} /></div>
            <div className="flex flex-col gap-1.5"><Label htmlFor="edit_duracion_horas">Duración (hs)</Label><Input id="edit_duracion_horas" type="number" {...editForm.register("duracion_horas")} /></div>
            <div className="flex flex-col gap-1.5"><Label htmlFor="edit_cupos">Cupos</Label><Input id="edit_cupos" type="number" {...editForm.register("cupos")} /></div>
            <div className="flex flex-col gap-1.5"><Label htmlFor="edit_precio">Precio</Label><Input id="edit_precio" type="number" step="0.01" {...editForm.register("precio")} /></div>
            <div className="flex items-center gap-2 self-end text-sm text-muted-foreground md:pt-6"><input type="checkbox" {...editForm.register("aceptacion_auto")} />Aceptación automática</div>
            <div className="md:col-span-2 flex flex-col gap-1.5"><Label htmlFor="edit_requisitos">Requisitos</Label><textarea id="edit_requisitos" className="min-h-24 rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" {...editForm.register("requisitos")} /></div>
            <DialogFooter className="md:col-span-2">
              <Button type="button" variant="outline" onClick={() => setEditCourse(null)}>Cancelar</Button>
              <Button type="submit" disabled={updateCourse.isPending}>{updateCourse.isPending ? "Guardando…" : "Guardar cambios"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
