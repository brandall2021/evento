"use client"

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react"
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, type DragEndEvent, useSensor, useSensors } from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { getProgramEditorMeta } from "@/lib/programa-academico-editor"
import { buildDuplicatedSessionPayload } from "@/lib/programa-academico-duplicate"
import { buildDuplicatedBlockPayload, buildDuplicatedDayPayload } from "@/lib/programa-academico-duplicate-structure"
import { getProgramDragId, getProgramDragTargets, moveSessionBetweenBlocks } from "@/lib/programa-academico-dnd"
import { BookOpen, CalendarDays, CopyIcon, DoorOpen, GripVertical, Layers3, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"

function sortByOrden(items: Array<any>) {
  return [...items].sort((left, right) => (left.orden ?? 0) - (right.orden ?? 0))
}

function renumberOrderedItems(items: Array<any>) {
  return items.map((item, index) => ({
    ...item,
    orden: index + 1,
  }))
}

function findDayAndBlockBySessionId(program: Array<any>, sessionId: number) {
  for (const day of program) {
    for (const block of day.bloques) {
      if (block.sesiones.some((session: any) => session.id === sessionId)) {
        return { day, block }
      }
    }
  }

  return null
}

function SortableHandle({ attributes, listeners, label }: { attributes: Record<string, any>; listeners?: Record<string, any>; label: string }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="size-8 shrink-0 cursor-grab touch-none active:cursor-grabbing"
      aria-label={label}
      {...attributes}
      {...(listeners || {})}
    >
      <GripVertical className="size-4" />
    </Button>
  )
}

function SortableDayCard({ day, children, onEdit, onDuplicate, onDelete }: { day: any; children: ReactNode; onEdit: () => void; onDuplicate: () => void; onDelete: () => void }) {
  const dragId = getProgramDragId("day", Number(day.id))
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: dragId })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.7 : 1 }}
      className="rounded-2xl border border-border/70 p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <SortableHandle attributes={attributes} listeners={listeners} label={`Mover día ${day.titulo}`} />
          <div>
            <div className="font-semibold">{day.titulo}</div>
            <div className="text-sm text-muted-foreground">{day.fecha}</div>
          </div>
        </div>
        <div className="flex gap-1">
          <Button variant="outline" size="icon" onClick={onDuplicate} title="Duplicar día">
            <CopyIcon className="size-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={onEdit} title="Editar día">
            <PencilIcon className="size-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={onDelete} title="Eliminar día">
            <Trash2Icon className="size-4" />
          </Button>
        </div>
      </div>
      <div className="mt-3 space-y-3">{children}</div>
    </div>
  )
}

function SortableBlockCard({ block, children, onEdit, onDuplicate, onDelete }: { block: any; children: ReactNode; onEdit: () => void; onDuplicate: () => void; onDelete: () => void }) {
  const dragId = getProgramDragId("block", Number(block.id))
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: dragId })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.7 : 1 }}
      className="rounded-xl border border-border/70 bg-muted/20 p-3 text-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <SortableHandle attributes={attributes} listeners={listeners} label={`Mover bloque ${block.titulo}`} />
          <div>
            <div className="font-medium">{block.titulo}</div>
            <div className="text-muted-foreground">
              {block.hora_inicio} - {block.hora_fin}
            </div>
          </div>
        </div>
        <div className="flex gap-1">
          <Button variant="outline" size="icon" onClick={onDuplicate} title="Duplicar bloque">
            <CopyIcon className="size-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={onEdit} title="Editar bloque">
            <PencilIcon className="size-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={onDelete} title="Eliminar bloque">
            <Trash2Icon className="size-4" />
          </Button>
        </div>
      </div>
      <div className="mt-2 space-y-1">{children}</div>
    </div>
  )
}

function SortableSessionRow({ session, onDuplicate, onEdit, onDelete }: { session: any; onDuplicate: () => void; onEdit: () => void; onDelete: () => void }) {
  const dragId = getProgramDragId("session", Number(session.id))
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: dragId })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.7 : 1 }}
      className="flex items-center justify-between gap-3 rounded-lg bg-background px-3 py-2"
    >
      <div className="flex items-center gap-2">
        <SortableHandle attributes={attributes} listeners={listeners} label={`Mover sesión ${session.titulo}`} />
        <span>{session.titulo}</span>
      </div>
      <div className="flex gap-1">
        <Button variant="outline" size="icon" onClick={onDuplicate} title="Duplicar sesión">
          <CopyIcon className="size-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={onEdit} title="Editar sesión">
          <PencilIcon className="size-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={onDelete} title="Eliminar sesión">
          <Trash2Icon className="size-4" />
        </Button>
      </div>
    </div>
  )
}

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
        dayId: Number(selectedDayId) || undefined,
        payload: {
          titulo: String(formData.get("titulo_bloque") || ""),
          hora_inicio: String(formData.get("hora_inicio") || ""),
          hora_fin: String(formData.get("hora_fin") || ""),
        },
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
        blockId: Number(selectedBlockId) || undefined,
        payload: {
          titulo: String(formData.get("titulo_sesion") || ""),
          descripcion: String(formData.get("descripcion") || "") || undefined,
          tipo: String(formData.get("tipo") || "") || undefined,
          cupos: Number(formData.get("cupos") || 0) || undefined,
        },
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

  async function duplicateSession(blockId: number, blockSessions: Array<any>, session: any) {
    const nextOrden = blockSessions.reduce((max, current) => Math.max(max, Number(current.orden ?? 0)), 0) + 1

    try {
      await createSession.mutateAsync({
        blockId,
        payload: buildDuplicatedSessionPayload(session, nextOrden),
      })
      toast.success("Sesión duplicada")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo duplicar la sesión")
    }
  }

  async function duplicateBlock(day: any, block: any) {
    const nextOrden = day.bloques.reduce((max: number, current: any) => Math.max(max, Number(current.orden ?? 0)), 0) + 1
    const duplicated = buildDuplicatedBlockPayload(block, nextOrden)

    try {
      const createdBlock = await createBlock.mutateAsync({
        dayId: day.id,
        payload: {
          titulo: duplicated.titulo,
          hora_inicio: duplicated.hora_inicio,
          hora_fin: duplicated.hora_fin,
          orden: duplicated.orden,
        },
      })

      for (const session of duplicated.sesiones) {
        await createSession.mutateAsync({
          blockId: createdBlock.id,
          payload: {
            titulo: session.titulo,
            descripcion: session.descripcion,
            tipo: session.tipo,
            cupos: session.cupos,
            sala_id: session.sala_id,
            ponente_id: session.ponente_id,
            orden: session.orden,
          },
        })
      }

      toast.success("Bloque duplicado")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo duplicar el bloque")
    }
  }

  async function duplicateDay(day: any) {
    const nextOrden = program.reduce((max, current) => Math.max(max, Number(current.orden ?? 0)), 0) + 1
    const duplicated = buildDuplicatedDayPayload(day, nextOrden)

    try {
      const createdDay = await createDay.mutateAsync({
        titulo: duplicated.titulo,
        fecha: duplicated.fecha,
        orden: duplicated.orden,
      })

      for (const block of duplicated.bloques) {
        const createdBlock = await createBlock.mutateAsync({
          dayId: createdDay.id,
          payload: {
            titulo: block.titulo,
            hora_inicio: block.hora_inicio,
            hora_fin: block.hora_fin,
            orden: block.orden,
          },
        })

        for (const session of block.sesiones) {
          await createSession.mutateAsync({
            blockId: createdBlock.id,
            payload: {
              titulo: session.titulo,
              descripcion: session.descripcion,
              tipo: session.tipo,
              cupos: session.cupos,
              sala_id: session.sala_id,
              ponente_id: session.ponente_id,
              orden: session.orden,
            },
          })
        }
      }

      void createdDay
      toast.success("Día duplicado")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo duplicar el día")
    }
  }

  const editorKind = dayEditor ? "day" : blockEditor ? "block" : roomEditor ? "room" : sessionEditor ? "session" : null
  const editorMeta = editorKind ? getProgramEditorMeta(editorKind) : null

  function closeEditor() {
    setDayEditor(null)
    setBlockEditor(null)
    setRoomEditor(null)
    setSessionEditor(null)
  }

  function renderEditorForm() {
    if (dayEditor) {
      return (
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
          <div className="md:col-span-2 flex justify-end gap-2 border-t pt-4">
            <Button type="button" variant="outline" onClick={closeEditor}>Cancelar</Button>
            <Button type="submit" disabled={updateDay.isPending}>{updateDay.isPending ? "Guardando…" : editorMeta?.submitLabel || "Guardar"}</Button>
          </div>
        </form>
      )
    }

    if (blockEditor) {
      return (
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
          <div className="md:col-span-2 flex justify-end gap-2 border-t pt-4">
            <Button type="button" variant="outline" onClick={closeEditor}>Cancelar</Button>
            <Button type="submit" disabled={updateBlock.isPending}>{updateBlock.isPending ? "Guardando…" : editorMeta?.submitLabel || "Guardar"}</Button>
          </div>
        </form>
      )
    }

    if (roomEditor) {
      return (
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
          <div className="md:col-span-2 flex justify-end gap-2 border-t pt-4">
            <Button type="button" variant="outline" onClick={closeEditor}>Cancelar</Button>
            <Button type="submit" disabled={updateRoom.isPending}>{updateRoom.isPending ? "Guardando…" : editorMeta?.submitLabel || "Guardar"}</Button>
          </div>
        </form>
      )
    }

    if (sessionEditor) {
      return (
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
          <div className="md:col-span-2 flex justify-end gap-2 border-t pt-4">
            <Button type="button" variant="outline" onClick={closeEditor}>Cancelar</Button>
            <Button type="submit" disabled={updateSession.isPending}>{updateSession.isPending ? "Guardando…" : editorMeta?.submitLabel || "Guardar"}</Button>
          </div>
        </form>
      )
    }

    return null
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function getDayOrderUpdates(nextDays: Array<any>) {
    const currentOrders = new Map(program.map((day) => [day.id, day.orden ?? 0]))
    return nextDays.filter((day) => currentOrders.get(day.id) !== (day.orden ?? 0))
  }

  function getBlockOrderUpdates(nextDays: Array<any>) {
    const currentBlocks = new Map<string, { dayId: number; orden: number }>()

    for (const day of program) {
      for (const block of day.bloques) {
        currentBlocks.set(String(block.id), { dayId: Number(day.id), orden: block.orden ?? 0 })
      }
    }

    const updates: Array<any> = []

    for (const day of nextDays) {
      for (const block of day.bloques) {
        const current = currentBlocks.get(String(block.id))
        if (!current || current.dayId !== day.id || current.orden !== (block.orden ?? 0)) {
          updates.push({ id: Number(block.id), payload: { dia_id: Number(day.id), orden: block.orden } })
        }
      }
    }

    return updates
  }

  function getSessionOrderUpdates(nextBlocks: Array<any>) {
    const currentSessions = new Map<string, { blockId: number; orden: number }>()

    for (const day of program) {
      for (const block of day.bloques) {
        for (const session of block.sesiones) {
          currentSessions.set(String(session.id), { blockId: Number(block.id), orden: session.orden ?? 0 })
        }
      }
    }

    const updates: Array<any> = []

    for (const block of nextBlocks) {
      for (const session of block.sesiones) {
        const current = currentSessions.get(String(session.id))
        if (!current || current.blockId !== block.id || current.orden !== (session.orden ?? 0)) {
          updates.push({ id: Number(session.id), payload: { bloque_id: Number(block.id), orden: session.orden } })
        }
      }
    }

    return updates
  }

  function moveBlockBetweenDays(activeBlockId: number, targetDayId: number, overBlockId?: number) {
    const sourceDay = program.find((day) => day.bloques.some((block: any) => block.id === activeBlockId))
    const targetDay = program.find((day) => day.id === targetDayId)

    if (!sourceDay || !targetDay) {
      return program
    }

    const sourceBlocks = sortByOrden(sourceDay.bloques)
    const targetBlocks = sourceDay.id === targetDay.id ? sourceBlocks : sortByOrden(targetDay.bloques)
    const sourceIndex = sourceBlocks.findIndex((block) => block.id === activeBlockId)

    if (sourceIndex < 0) {
      return program
    }

    const [movedBlock] = sourceBlocks.splice(sourceIndex, 1)

    if (sourceDay.id === targetDay.id) {
      const nextIndex = typeof overBlockId === "number" ? sourceBlocks.findIndex((block) => block.id === overBlockId) : -1

      if (nextIndex >= 0) {
        sourceBlocks.splice(nextIndex, 0, movedBlock)
      } else {
        sourceBlocks.push(movedBlock)
      }

      return program.map((day) => (day.id === sourceDay.id ? { ...day, bloques: renumberOrderedItems(sourceBlocks) } : day))
    }

    if (typeof overBlockId === "number") {
      const targetIndex = targetBlocks.findIndex((block) => block.id === overBlockId)
      if (targetIndex >= 0) {
        targetBlocks.splice(targetIndex, 0, movedBlock)
      } else {
        targetBlocks.push(movedBlock)
      }
    } else {
      targetBlocks.push(movedBlock)
    }

    return program.map((day) => {
      if (day.id === sourceDay.id) {
        return { ...day, bloques: renumberOrderedItems(sourceBlocks) }
      }

      if (day.id === targetDay.id) {
        return { ...day, bloques: renumberOrderedItems(targetBlocks) }
      }

      return day
    })
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (!over || String(active.id) === String(over.id)) {
      return
    }

    const activeTarget = getProgramDragTargets(program, active.id)
    const overTarget = getProgramDragTargets(program, over.id)

    if (!activeTarget || !overTarget) {
      return
    }

    try {
      if (activeTarget.kind === "day" && overTarget.kind === "day") {
        const orderedDays = sortByOrden(program)
        const activeIndex = orderedDays.findIndex((day) => day.id === activeTarget.dayId)
        const overIndex = orderedDays.findIndex((day) => day.id === overTarget.dayId)

        if (activeIndex < 0 || overIndex < 0) return

        const nextDays = arrayMove(orderedDays, activeIndex, overIndex).map((day, index) => ({ ...day, orden: index + 1 }))
        const updates = getDayOrderUpdates(nextDays)

        if (!updates.length) return

        await Promise.all(updates.map((day) => updateDay.mutateAsync({ id: Number(day.id), payload: { orden: day.orden } })))
        toast.success("Orden de días actualizado")
        return
      }

      if (activeTarget.kind === "block") {
        const sourceDay = program.find((day) => day.id === activeTarget.dayId)
        const targetDay = program.find((day) => day.id === overTarget.dayId)

        if (!sourceDay || !targetDay) return

        const activeBlockId = Number(active.id.toString().split(":").pop())
        const overBlockId = overTarget.kind === "day" ? undefined : overTarget.blockId
        const nextDays = moveBlockBetweenDays(activeBlockId, Number(targetDay.id), overBlockId)
        const updates = getBlockOrderUpdates(nextDays)

        if (!updates.length) return

        await Promise.all(updates.map((block) => updateBlock.mutateAsync({ id: Number(block.id), payload: block.payload })))
        toast.success("Orden de bloques actualizado")
        return
      }

      if (activeTarget.kind === "session") {
        const source = findDayAndBlockBySessionId(program, Number(active.id.toString().split(":").pop()))
        const targetDay = program.find((day) => day.id === overTarget.dayId)
        const targetBlock =
          overTarget.kind === "block"
            ? targetDay?.bloques.find((block: any) => block.id === overTarget.blockId)
            : findDayAndBlockBySessionId(program, Number(over.id.toString().split(":").pop()))?.block

        if (!source || !targetBlock) return

        const activeSessionId = Number(active.id.toString().split(":").pop())

        if (source.block.id === targetBlock.id) {
          if (overTarget.kind !== "session") return

          const orderedSessions = sortByOrden(source.block.sesiones)
          const activeIndex = orderedSessions.findIndex((session) => session.id === activeSessionId)
          const overSessionId = Number(over.id.toString().split(":").pop())
          const overIndex = orderedSessions.findIndex((session) => session.id === overSessionId)

          if (activeIndex < 0 || overIndex < 0) return

          const nextBlocks = [{ ...source.block, sesiones: renumberOrderedItems(arrayMove(orderedSessions, activeIndex, overIndex)) }]
          const updates = getSessionOrderUpdates(nextBlocks)

          if (!updates.length) return

          await Promise.all(updates.map((session) => updateSession.mutateAsync({ id: Number(session.id), payload: session.payload })))
          toast.success("Orden de sesiones actualizado")
          return
        }

        const blockPool = source.day.id === targetDay?.id ? source.day.bloques : [...source.day.bloques, ...(targetDay?.bloques || [])]
        const nextBlocks = moveSessionBetweenBlocks(blockPool, activeSessionId, targetBlock.id).blocks
        const updates = getSessionOrderUpdates(nextBlocks)

        if (!updates.length) return

        await Promise.all(updates.map((session) => updateSession.mutateAsync({ id: Number(session.id), payload: session.payload })))
        toast.success("Orden de sesiones actualizado")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo reordenar el programa")
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
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={sortByOrden(program).map((day) => getProgramDragId("day", Number(day.id)))} strategy={verticalListSortingStrategy}>
                <div className="space-y-4">
                  {sortByOrden(program).map((day) => {
                    const orderedBlocks = sortByOrden(day.bloques)

                    return (
                      <SortableDayCard
                        key={day.id}
                        day={day}
                        onDuplicate={() => duplicateDay(day)}
                        onEdit={() => setDayEditor(day)}
                        onDelete={() => removeDay(day)}
                      >
                        <SortableContext items={orderedBlocks.map((block) => getProgramDragId("block", Number(block.id)))} strategy={verticalListSortingStrategy}>
                          {orderedBlocks.map((block) => {
                            const orderedSessions = sortByOrden(block.sesiones || [])

                            return (
                              <SortableBlockCard
                                key={block.id}
                                block={block}
                                onDuplicate={() => duplicateBlock(day, block)}
                                onEdit={() => setBlockEditor(block)}
                                onDelete={() => removeBlock(block)}
                              >
                                <SortableContext items={orderedSessions.map((session) => getProgramDragId("session", Number(session.id)))} strategy={verticalListSortingStrategy}>
                                  {orderedSessions.map((session) => (
                                    <SortableSessionRow
                                      key={session.id}
                                      session={session}
                                      onDuplicate={() => duplicateSession(Number(block.id), orderedSessions, session)}
                                      onEdit={() => setSessionEditor(session)}
                                      onDelete={() => removeSession(session)}
                                    />
                                  ))}
                                </SortableContext>
                              </SortableBlockCard>
                            )
                          })}
                        </SortableContext>
                      </SortableDayCard>
                    )
                  })}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <p className="text-sm text-muted-foreground">Todavía no hay programa cargado para este curso.</p>
          )}
        </CardContent>
      </Card>

      <div className={`fixed inset-0 z-50 transition ${editorKind ? "pointer-events-auto" : "pointer-events-none"}`} aria-hidden={!editorKind}>
        <button type="button" aria-label="Cerrar editor" onClick={closeEditor} className={`absolute inset-0 bg-black/20 backdrop-blur-[2px] transition ${editorKind ? "opacity-100" : "opacity-0"}`} />
        <aside className={`absolute top-0 right-0 h-full w-full max-w-xl border-l border-border bg-background shadow-2xl transition-transform duration-200 ${editorKind ? "translate-x-0" : "translate-x-full"}`}>
          <div className="flex h-full flex-col">
            <div className="border-b p-6">
              <div className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Programa académico</div>
              <h2 className="mt-3 text-2xl font-semibold">{editorMeta?.title || "Editar"}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{editorMeta?.description || ""}</p>
            </div>
            <div className="flex-1 overflow-auto p-6">
              {renderEditorForm()}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
