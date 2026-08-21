"use client"

import { useEffect, useMemo, useState, type FormEvent } from "react"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  useProgramAgenda,
  useProgramRooms,
  useCreateProgramDay,
  useUpdateProgramDay,
  useDeleteProgramDay,
  useCreateProgramBlock,
  useUpdateProgramBlock,
  useDeleteProgramBlock,
  useCreateProgramRoom,
  useUpdateProgramRoom,
  useDeleteProgramRoom,
  useCreateProgramSession,
  useUpdateProgramSession,
  useDeleteProgramSession,
} from "@/hooks/use-programa-academico"
import { normalizeProgramAgenda } from "@/lib/programa-academico"
import { buildProgramAgendaView } from "@/lib/programa-academico-view"
import { moveOrderedItems } from "@/lib/programa-academico-order"
import { ArrowDown, ArrowUp, BookOpen, CalendarDays, DoorOpen, Layers3, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"

export default function ProgramaAcademicoPage() {
  const [courseId, setCourseId] = useState("7")
  const [selectedDayId, setSelectedDayId] = useState<string>("")
  const [selectedBlockId, setSelectedBlockId] = useState<string>("")
  const [dayEditor, setDayEditor] = useState<any | null>(null)
  const [blockEditor, setBlockEditor] = useState<any | null>(null)
  const [roomEditor, setRoomEditor] = useState<any | null>(null)
  const [sessionEditor, setSessionEditor] = useState<any | null>(null)
  const courseIdNumber = Number(courseId)
  const { data, isLoading } = useProgramAgenda(Number.isFinite(courseIdNumber) ? courseIdNumber : undefined)
  const { data: roomsData, isLoading: roomsLoading } = useProgramRooms(Number.isFinite(courseIdNumber) ? courseIdNumber : undefined)
  const createDay = useCreateProgramDay(courseIdNumber)
  const updateDay = useUpdateProgramDay(courseIdNumber)
  const deleteDay = useDeleteProgramDay(courseIdNumber)
  const createRoom = useCreateProgramRoom(courseIdNumber)
  const updateRoom = useUpdateProgramRoom(courseIdNumber)
  const deleteRoom = useDeleteProgramRoom(courseIdNumber)
  const createBlock = useCreateProgramBlock(courseIdNumber, Number(selectedDayId) || undefined)
  const updateBlock = useUpdateProgramBlock(courseIdNumber)
  const deleteBlock = useDeleteProgramBlock(courseIdNumber)
  const createSession = useCreateProgramSession(courseIdNumber, Number(selectedBlockId) || undefined)
  const updateSession = useUpdateProgramSession(courseIdNumber)
  const deleteSession = useDeleteProgramSession(courseIdNumber)

  const program = useMemo(() => normalizeProgramAgenda(data), [data])
  const rooms = roomsData ?? []
  const agendaView = useMemo(() => buildProgramAgendaView(program), [program])

  useEffect(() => {
    if (!selectedDayId && agendaView.selectedDayId) setSelectedDayId(agendaView.selectedDayId)
  }, [agendaView.selectedDayId, selectedDayId])

  useEffect(() => {
    if (!selectedBlockId && agendaView.selectedBlockId) setSelectedBlockId(agendaView.selectedBlockId)
  }, [agendaView.selectedBlockId, selectedBlockId])

  async function submitDay(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    try {
      await createDay.mutateAsync({
        fecha: String(formData.get("fecha") || ""),
        titulo: String(formData.get("titulo") || ""),
        orden: Number(formData.get("orden") || 0),
      })
      toast.success("Día creado")
      event.currentTarget.reset()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo crear el día")
    }
  }

  async function submitDayUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!dayEditor) return
    const formData = new FormData(event.currentTarget)
    try {
      await updateDay.mutateAsync({
        id: dayEditor.id,
        payload: {
          titulo: String(formData.get("titulo") || ""),
          fecha: String(formData.get("fecha") || ""),
          orden: Number(formData.get("orden") || 0),
        },
      })
      toast.success("Día actualizado")
      setDayEditor(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo actualizar el día")
    }
  }

  async function removeDay(day: any) {
    if (!confirm(`¿Eliminar el día ${day.titulo}?`)) return
    try {
      await deleteDay.mutateAsync(day.id)
      toast.success("Día eliminado")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo eliminar el día")
    }
  }

  async function submitRoom(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    try {
      await createRoom.mutateAsync({
        nombre: String(formData.get("nombre") || ""),
        capacidad: Number(formData.get("capacidad") || 0),
        ubicacion: String(formData.get("ubicacion") || "") || undefined,
      })
      toast.success("Sala creada")
      event.currentTarget.reset()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo crear la sala")
    }
  }

  async function submitRoomUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!roomEditor) return
    const formData = new FormData(event.currentTarget)
    try {
      await updateRoom.mutateAsync({
        id: roomEditor.id,
        payload: {
          nombre: String(formData.get("nombre") || ""),
          capacidad: Number(formData.get("capacidad") || 0),
          ubicacion: String(formData.get("ubicacion") || "") || undefined,
        },
      })
      toast.success("Sala actualizada")
      setRoomEditor(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo actualizar la sala")
    }
  }

  async function removeRoom(room: any) {
    if (!confirm(`¿Eliminar la sala ${room.nombre}?`)) return
    try {
      await deleteRoom.mutateAsync(room.id)
      toast.success("Sala eliminada")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo eliminar la sala")
    }
  }

  async function submitBlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    try {
      await createBlock.mutateAsync({
        titulo: String(formData.get("titulo_bloque") || ""),
        hora_inicio: String(formData.get("hora_inicio") || ""),
        hora_fin: String(formData.get("hora_fin") || ""),
      })
      toast.success("Bloque creado")
      event.currentTarget.reset()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo crear el bloque")
    }
  }

  async function submitBlockUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!blockEditor) return
    const formData = new FormData(event.currentTarget)
    try {
      await updateBlock.mutateAsync({
        id: blockEditor.id,
        payload: {
          titulo: String(formData.get("titulo") || ""),
          hora_inicio: String(formData.get("hora_inicio") || ""),
          hora_fin: String(formData.get("hora_fin") || ""),
        },
      })
      toast.success("Bloque actualizado")
      setBlockEditor(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo actualizar el bloque")
    }
  }

  async function removeBlock(block: any) {
    if (!confirm(`¿Eliminar el bloque ${block.titulo}?`)) return
    try {
      await deleteBlock.mutateAsync(block.id)
      toast.success("Bloque eliminado")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo eliminar el bloque")
    }
  }

  async function submitSession(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    try {
      await createSession.mutateAsync({
        titulo: String(formData.get("titulo_sesion") || ""),
        descripcion: String(formData.get("descripcion") || "") || undefined,
        tipo: String(formData.get("tipo") || "") || undefined,
        cupos: Number(formData.get("cupos") || 0) || undefined,
      })
      toast.success("Sesión creada")
      event.currentTarget.reset()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo crear la sesión")
    }
  }

  async function submitSessionUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!sessionEditor) return
    const formData = new FormData(event.currentTarget)
    try {
      await updateSession.mutateAsync({
        id: sessionEditor.id,
        payload: {
          titulo: String(formData.get("titulo") || ""),
          descripcion: String(formData.get("descripcion") || "") || undefined,
          tipo: String(formData.get("tipo") || "") || undefined,
          cupos: Number(formData.get("cupos") || 0) || undefined,
        },
      })
      toast.success("Sesión actualizada")
      setSessionEditor(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo actualizar la sesión")
    }
  }

  async function removeSession(session: any) {
    if (!confirm(`¿Eliminar la sesión ${session.titulo}?`)) return
    try {
      await deleteSession.mutateAsync(session.id)
      toast.success("Sesión eliminada")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo eliminar la sesión")
    }
  }

  async function moveDay(dayId: number, direction: "up" | "down") {
    const nextDays = moveOrderedItems(program, dayId, direction)
    const currentOrders = new Map(program.map((day) => [day.id, day.orden ?? 0]))
    const updates = nextDays.filter((day) => currentOrders.get(day.id) !== (day.orden ?? 0))

    if (!updates.length) return

    try {
      await Promise.all(updates.map((day) => updateDay.mutateAsync({ id: Number(day.id), payload: { orden: day.orden } })))
      toast.success("Orden de días actualizado")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo reordenar el día")
    }
  }

  async function moveBlock(dayId: number, blockId: number, direction: "up" | "down") {
    const day = program.find((item) => item.id === dayId)
    if (!day) return

    const nextBlocks = moveOrderedItems(day.bloques, blockId, direction)
    const currentOrders = new Map(day.bloques.map((block) => [block.id, block.orden ?? 0]))
    const updates = nextBlocks.filter((block) => currentOrders.get(block.id) !== (block.orden ?? 0))

    if (!updates.length) return

    try {
      await Promise.all(updates.map((block) => updateBlock.mutateAsync({ id: Number(block.id), payload: { orden: block.orden } })))
      toast.success("Orden de bloques actualizado")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo reordenar el bloque")
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/70 bg-card/90 shadow-[0_18px_50px_rgba(11,42,85,0.08)]">
        <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
              <BookOpen className="size-3.5" />
              Programa académico
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight">Agenda del curso</h1>
            <p className="mt-2 text-sm text-muted-foreground">Gestión admin de días, bloques, salas y sesiones.</p>
          </div>
          <div className="flex items-end gap-2">
            <Label htmlFor="courseId" className="sr-only">Curso ID</Label>
            <Input id="courseId" className="w-28" value={courseId} onChange={(e) => setCourseId(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/70 bg-card/90 shadow-[0_18px_50px_rgba(11,42,85,0.08)]">
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-primary"><CalendarDays className="size-4" />Días</div>
            <form onSubmit={submitDay} className="grid gap-4 md:grid-cols-2">
              <Input name="titulo" placeholder="Título del día" />
              <Input name="fecha" type="date" />
              <Input name="orden" type="number" placeholder="Orden" />
              <Button type="submit" disabled={createDay.isPending} className="md:col-span-2">
                <PlusIcon className="size-4" />
                Crear día
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/90 shadow-[0_18px_50px_rgba(11,42,85,0.08)]">
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-primary"><DoorOpen className="size-4" />Salas</div>
            <form onSubmit={submitRoom} className="grid gap-4 md:grid-cols-2">
              <Input name="nombre" placeholder="Nombre de sala" />
              <Input name="capacidad" type="number" placeholder="Capacidad" />
              <Input name="ubicacion" placeholder="Ubicación" />
              <Button type="submit" disabled={createRoom.isPending} className="md:col-span-2">
                <PlusIcon className="size-4" />
                Crear sala
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/70 bg-card/90 shadow-[0_18px_50px_rgba(11,42,85,0.08)]">
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-primary"><Layers3 className="size-4" />Bloques</div>
            <form onSubmit={submitBlock} className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2 flex flex-col gap-1.5">
                <Label htmlFor="dayId">Día</Label>
                <select id="dayId" value={selectedDayId} onChange={(event) => setSelectedDayId(event.target.value)} className="h-10 rounded-xl border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  {agendaView.dayOptions.map((day) => (
                    <option key={day.value} value={day.value}>{day.label}</option>
                  ))}
                </select>
              </div>
              <Input name="titulo_bloque" placeholder="Título del bloque" />
              <Input name="hora_inicio" type="time" />
              <Input name="hora_fin" type="time" />
              <Button type="submit" disabled={createBlock.isPending || !selectedDayId} className="md:col-span-2">
                <PlusIcon className="size-4" />
                Crear bloque
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/90 shadow-[0_18px_50px_rgba(11,42,85,0.08)]">
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-primary"><BookOpen className="size-4" />Sesiones</div>
            <form onSubmit={submitSession} className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2 flex flex-col gap-1.5">
                <Label htmlFor="blockId">Bloque</Label>
                <select id="blockId" value={selectedBlockId} onChange={(event) => setSelectedBlockId(event.target.value)} className="h-10 rounded-xl border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  {agendaView.blockOptions.map((block) => (
                    <option key={block.value} value={block.value}>{block.label}</option>
                  ))}
                </select>
              </div>
              <Input name="titulo_sesion" placeholder="Título de sesión" />
              <Input name="tipo" placeholder="Tipo" />
              <Input name="descripcion" placeholder="Descripción" />
              <Input name="cupos" type="number" placeholder="Cupos" />
              <Button type="submit" disabled={createSession.isPending || !selectedBlockId} className="md:col-span-2">
                <PlusIcon className="size-4" />
                Crear sesión
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/70 bg-card/90 shadow-[0_18px_50px_rgba(11,42,85,0.08)] lg:col-span-2">
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-primary"><DoorOpen className="size-4" />Salas</div>
            {roomsLoading ? (
              <p className="text-sm text-muted-foreground">Cargando salas…</p>
            ) : rooms.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2">
                {rooms.map((room: any) => (
                  <div key={room.id} className="rounded-2xl border border-border/70 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold">{room.nombre}</div>
                        <div className="text-sm text-muted-foreground">Capacidad: {room.capacidad ?? "—"}</div>
                        <div className="text-sm text-muted-foreground">{room.ubicacion || "Sin ubicación"}</div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="outline" size="icon" onClick={() => setRoomEditor(room)}>
                          <PencilIcon className="size-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => removeRoom(room)}>
                          <Trash2Icon className="size-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Todavía no hay salas cargadas para este curso.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/70 bg-card/90 shadow-[0_18px_50px_rgba(11,42,85,0.08)]">
        <CardContent className="p-6">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Cargando programa…</p>
          ) : program.length > 0 ? (
            <div className="space-y-4">
              {program.map((day) => (
                <div key={day.id} className="rounded-2xl border border-border/70 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold">{day.titulo}</div>
                      <div className="text-sm text-muted-foreground">{day.fecha}</div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="outline" size="icon" onClick={() => moveDay(Number(day.id), "up")} title="Subir día">
                        <ArrowUp className="size-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => moveDay(Number(day.id), "down")} title="Bajar día">
                        <ArrowDown className="size-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => setDayEditor(day)}>
                        <PencilIcon className="size-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => removeDay(day)}>
                        <Trash2Icon className="size-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3 space-y-3">
                    {day.bloques.map((block) => (
                      <div key={block.id} className="rounded-xl border border-border/70 bg-muted/20 p-3 text-sm">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-medium">{block.titulo}</div>
                            <div className="text-muted-foreground">{block.hora_inicio} - {block.hora_fin}</div>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="outline" size="icon" onClick={() => moveBlock(Number(day.id), Number(block.id), "up")} title="Subir bloque">
                              <ArrowUp className="size-4" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={() => moveBlock(Number(day.id), Number(block.id), "down")} title="Bajar bloque">
                              <ArrowDown className="size-4" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={() => setBlockEditor(block)}>
                              <PencilIcon className="size-4" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={() => removeBlock(block)}>
                              <Trash2Icon className="size-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="mt-2 space-y-1">
                          {block.sesiones.map((session) => (
                            <div key={session.id} className="flex items-center justify-between gap-3 rounded-lg bg-background px-3 py-2">
                              <span>{session.titulo}</span>
                              <div className="flex gap-1">
                                <Button variant="outline" size="icon" onClick={() => setSessionEditor(session)}>
                                  <PencilIcon className="size-4" />
                                </Button>
                                <Button variant="outline" size="icon" onClick={() => removeSession(session)}>
                                  <Trash2Icon className="size-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Todavía no hay programa cargado para este curso.</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!dayEditor} onOpenChange={(open) => !open && setDayEditor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar día</DialogTitle>
            <DialogDescription>Ajusta el título, fecha u orden del día.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submitDayUpdate} className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <Label htmlFor="edit-day-title">Título</Label>
              <Input id="edit-day-title" name="titulo" defaultValue={dayEditor?.titulo || ""} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-day-date">Fecha</Label>
              <Input id="edit-day-date" name="fecha" type="date" defaultValue={dayEditor?.fecha || ""} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-day-order">Orden</Label>
              <Input id="edit-day-order" name="orden" type="number" defaultValue={dayEditor?.orden ?? 0} />
            </div>
            <DialogFooter className="md:col-span-2">
              <Button type="button" variant="outline" onClick={() => setDayEditor(null)}>Cancelar</Button>
              <Button type="submit" disabled={updateDay.isPending}>{updateDay.isPending ? "Guardando…" : "Guardar"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!roomEditor} onOpenChange={(open) => !open && setRoomEditor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar sala</DialogTitle>
            <DialogDescription>Actualiza nombre, capacidad o ubicación.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submitRoomUpdate} className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <Label htmlFor="edit-room-name">Nombre</Label>
              <Input id="edit-room-name" name="nombre" defaultValue={roomEditor?.nombre || ""} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-room-capacity">Capacidad</Label>
              <Input id="edit-room-capacity" name="capacidad" type="number" defaultValue={roomEditor?.capacidad ?? 0} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-room-location">Ubicación</Label>
              <Input id="edit-room-location" name="ubicacion" defaultValue={roomEditor?.ubicacion || ""} />
            </div>
            <DialogFooter className="md:col-span-2">
              <Button type="button" variant="outline" onClick={() => setRoomEditor(null)}>Cancelar</Button>
              <Button type="submit" disabled={updateRoom.isPending}>{updateRoom.isPending ? "Guardando…" : "Guardar"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!blockEditor} onOpenChange={(open) => !open && setBlockEditor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar bloque</DialogTitle>
            <DialogDescription>Modifica el nombre y el rango horario.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submitBlockUpdate} className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <Label htmlFor="edit-block-title">Título</Label>
              <Input id="edit-block-title" name="titulo" defaultValue={blockEditor?.titulo || ""} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-block-start">Inicio</Label>
              <Input id="edit-block-start" name="hora_inicio" type="time" defaultValue={blockEditor?.hora_inicio || ""} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-block-end">Fin</Label>
              <Input id="edit-block-end" name="hora_fin" type="time" defaultValue={blockEditor?.hora_fin || ""} />
            </div>
            <DialogFooter className="md:col-span-2">
              <Button type="button" variant="outline" onClick={() => setBlockEditor(null)}>Cancelar</Button>
              <Button type="submit" disabled={updateBlock.isPending}>{updateBlock.isPending ? "Guardando…" : "Guardar"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!sessionEditor} onOpenChange={(open) => !open && setSessionEditor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar sesión</DialogTitle>
            <DialogDescription>Actualiza los datos básicos de la sesión.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submitSessionUpdate} className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <Label htmlFor="edit-session-title">Título</Label>
              <Input id="edit-session-title" name="titulo" defaultValue={sessionEditor?.titulo || ""} />
            </div>
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <Label htmlFor="edit-session-desc">Descripción</Label>
              <Input id="edit-session-desc" name="descripcion" defaultValue={sessionEditor?.descripcion || ""} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-session-type">Tipo</Label>
              <Input id="edit-session-type" name="tipo" defaultValue={sessionEditor?.tipo || ""} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-session-seats">Cupos</Label>
              <Input id="edit-session-seats" name="cupos" type="number" defaultValue={sessionEditor?.cupos ?? 0} />
            </div>
            <DialogFooter className="md:col-span-2">
              <Button type="button" variant="outline" onClick={() => setSessionEditor(null)}>Cancelar</Button>
              <Button type="submit" disabled={updateSession.isPending}>{updateSession.isPending ? "Guardando…" : "Guardar"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
