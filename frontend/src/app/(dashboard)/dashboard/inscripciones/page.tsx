"use client"

import { useState } from "react"
import { toast } from "sonner"
import { DataTable, type Column } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useApproveRegistration, useRejectRegistration, useRegistrations } from "@/hooks/use-inscripciones"
import type { Registration } from "@/types/registration"
import { Check, CircleAlert, GraduationCap, XIcon } from "lucide-react"

const statuses = ["pendiente", "aceptado", "en_espera", "rechazado", "en_curso", "finalizado"] as const

export default function InscripcionesPage() {
  const [estado, setEstado] = useState<string>("")
  const [cursoId, setCursoId] = useState<string>("")
  const [rejectRegistration, setRejectRegistration] = useState<Registration | null>(null)

  const { data, isLoading } = useRegistrations({ estado: estado || undefined, curso_id: cursoId || undefined, page: 1, pageSize: 20 })
  const approveRegistration = useApproveRegistration()
  const rejectMutation = useRejectRegistration()

  const registrations = Array.isArray(data) ? data : data?.data ?? []

  const columns: Column<Registration>[] = [
    {
      key: "estudiante",
      header: "Estudiante",
      render: (registration) =>
        registration.estudiante
          ? `${registration.estudiante.first_name} ${registration.estudiante.last_name}`
          : registration.estudiante_id,
    },
    {
      key: "curso",
      header: "Curso",
      render: (registration) => registration.curso?.nombre ?? registration.curso_id,
    },
    {
      key: "estado",
      header: "Estado",
      render: (registration) => <span className="text-sm text-muted-foreground">{registration.estado}</span>,
    },
  ]

  async function approve(id: number) {
    try {
      await approveRegistration.mutateAsync(id)
      toast.success("Inscripción aprobada")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al aprobar")
    }
  }

  async function reject(formData: FormData) {
    if (!rejectRegistration) return
    try {
      await rejectMutation.mutateAsync({ id: rejectRegistration.id, motivo: formData.get("motivo")?.toString() })
      toast.success("Inscripción rechazada")
      setRejectRegistration(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al rechazar")
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/70 bg-card/90 shadow-[0_18px_50px_rgba(11,42,85,0.08)]">
        <CardContent className="flex flex-col gap-5 p-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
              <GraduationCap className="size-3.5" />
              LACDI
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-balance">Inscripciones</h1>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Aprueba o rechaza solicitudes usando el flujo real del backend de cursos.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Select value={estado} onValueChange={(value) => setEstado(value ?? "")}>
              <SelectTrigger className="w-44"><SelectValue placeholder="Estado" /></SelectTrigger>
              <SelectContent>{statuses.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent>
            </Select>
            <Input className="w-44" placeholder="Curso ID" value={cursoId} onChange={(e) => setCursoId(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/90 shadow-[0_18px_50px_rgba(11,42,85,0.08)]">
        <CardContent className="p-2 sm:p-4">
          <DataTable
            columns={columns}
            data={registrations}
            isLoading={isLoading}
            emptyMessage="No hay inscripciones"
            actions={(registration) => (
              <div className="flex items-center justify-end gap-1">
                <Button variant="ghost" size="icon-sm" onClick={() => approve(registration.id)} disabled={approveRegistration.isPending}>
                  <Check className="size-4" />
                </Button>
                <Button variant="ghost" size="icon-sm" onClick={() => setRejectRegistration(registration)}>
                  <CircleAlert className="size-4" />
                </Button>
              </div>
            )}
          />
        </CardContent>
      </Card>

      <Dialog open={!!rejectRegistration} onOpenChange={(open) => !open && setRejectRegistration(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rechazar inscripción</DialogTitle>
            <DialogDescription>Agrega un motivo breve para registrar la decisión.</DialogDescription>
          </DialogHeader>
          <form action={reject} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="motivo">Motivo</Label>
              <textarea id="motivo" name="motivo" className="min-h-28 rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setRejectRegistration(null)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={rejectMutation.isPending}>
                <XIcon className="size-4" />
                {rejectMutation.isPending ? "Rechazando…" : "Rechazar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
