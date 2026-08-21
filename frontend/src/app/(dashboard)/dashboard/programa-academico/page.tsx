"use client"

import { useEffect, useMemo, useState, type FormEvent } from "react"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useProgramAgenda, useCreateProgramDay, useCreateProgramBlock, useCreateProgramRoom, useCreateProgramSession } from "@/hooks/use-programa-academico"
import { normalizeProgramAgenda } from "@/lib/programa-academico"
import { BookOpen, CalendarDays, DoorOpen, Layers3, PlusIcon } from "lucide-react"

export default function ProgramaAcademicoPage() {
  const [courseId, setCourseId] = useState("7")
  const [selectedDayId, setSelectedDayId] = useState<string>("")
  const [selectedBlockId, setSelectedBlockId] = useState<string>("")
  const courseIdNumber = Number(courseId)
  const { data, isLoading } = useProgramAgenda(Number.isFinite(courseIdNumber) ? courseIdNumber : undefined)
  const createDay = useCreateProgramDay(courseIdNumber)
  const createRoom = useCreateProgramRoom(courseIdNumber)
  const createBlock = useCreateProgramBlock(courseIdNumber, Number(selectedDayId) || undefined)
  const createSession = useCreateProgramSession(courseIdNumber, Number(selectedBlockId) || undefined)

  const program = normalizeProgramAgenda(data)
  const days = useMemo(() => program, [program])
  const blocks = useMemo(() => program.flatMap((day) => day.bloques.map((block) => ({ ...block, dayTitle: day.titulo }))), [program])

  useEffect(() => {
    if (!selectedDayId && days[0]?.id) setSelectedDayId(String(days[0].id))
  }, [days, selectedDayId])

  useEffect(() => {
    if (!selectedBlockId && blocks[0]?.id) setSelectedBlockId(String(blocks[0].id))
  }, [blocks, selectedBlockId])

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
                  {days.map((day) => (
                    <option key={day.id} value={day.id}>{day.titulo}</option>
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
                  {blocks.map((block) => (
                    <option key={block.id} value={block.id}>{block.dayTitle} · {block.titulo}</option>
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

      <Card className="border-border/70 bg-card/90 shadow-[0_18px_50px_rgba(11,42,85,0.08)]">
        <CardContent className="p-6">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Cargando programa…</p>
          ) : program.length > 0 ? (
            <div className="space-y-4">
              {program.map((day) => (
                <div key={day.id} className="rounded-2xl border border-border/70 p-4">
                  <div className="font-semibold">{day.titulo}</div>
                  <div className="mt-3 space-y-3">
                    {day.bloques.map((block) => (
                      <div key={block.id} className="rounded-xl border border-border/70 bg-muted/20 p-3 text-sm">
                        <div className="font-medium">{block.titulo}</div>
                        <div className="text-muted-foreground">{block.hora_inicio} - {block.hora_fin}</div>
                        <div className="mt-2 space-y-1">
                          {block.sesiones.map((session) => (
                            <div key={session.id} className="rounded-lg bg-background px-3 py-2">
                              {session.titulo}
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
    </div>
  )
}
