"use client"

import { useState, type FormEvent } from "react"
import { toast } from "sonner"
import { DataTable, type Column } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatDateTime } from "@/lib/event-dashboard"
import { useAcreditacionStats, useGenerateAcreditacionQr, useManualAcreditacion, useScanAcreditacion, useSessionAcreditaciones } from "@/hooks/use-acreditacion"
import type { AcreditacionRecord } from "@/types/acreditacion"
import { Camera, ClipboardCheck, QrCode, ShieldCheck } from "lucide-react"

export default function AcreditacionPage() {
  const [sessionId, setSessionId] = useState("")
  const [courseId, setCourseId] = useState("")
  const [generatedQr, setGeneratedQr] = useState<string>("")

  const { data: sessionCheckins, isLoading: checkinsLoading } = useSessionAcreditaciones(sessionId || undefined)
  const { data: stats } = useAcreditacionStats(courseId || undefined)
  const generateQr = useGenerateAcreditacionQr()
  const scanCheckin = useScanAcreditacion()
  const manualCheckin = useManualAcreditacion()

  const columns: Column<AcreditacionRecord>[] = [
    {
      key: "inscripcion_id",
      header: "Inscripción",
      render: (checkin) => checkin.inscripcion?.estudiante
        ? `${checkin.inscripcion.estudiante.first_name} ${checkin.inscripcion.estudiante.last_name}`
        : `#${checkin.inscripcion_id}`,
    },
    { key: "sala_id", header: "Sala", render: (checkin) => checkin.sala?.nombre ?? (checkin.sala_id ? `#${checkin.sala_id}` : "—") },
    { key: "metodo", header: "Método" },
    { key: "timestamp", header: "Hora", render: (checkin) => formatDateTime(checkin.timestamp) },
  ]

  const checkins = sessionCheckins ?? []

  async function submitScan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    try {
      await scanCheckin.mutateAsync({
        token: String(formData.get("token") || ""),
        sesion_id: formData.get("sesion_id") ? Number(formData.get("sesion_id")) : undefined,
        sala_id: formData.get("sala_id") ? Number(formData.get("sala_id")) : undefined,
        device_info: String(formData.get("device_info") || "") || undefined,
      })
      toast.success("QR acreditado")
      event.currentTarget.reset()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo registrar el QR")
    }
  }

  async function submitManual(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    try {
      await manualCheckin.mutateAsync({
        inscripcion_id: Number(formData.get("inscripcion_id") || 0),
        sesion_id: formData.get("sesion_id_manual") ? Number(formData.get("sesion_id_manual")) : undefined,
        sala_id: formData.get("sala_id_manual") ? Number(formData.get("sala_id_manual")) : undefined,
      })
      toast.success("Acreditación manual registrada")
      event.currentTarget.reset()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo registrar")
    }
  }

  async function submitQr(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    try {
      const result = await generateQr.mutateAsync(Number(formData.get("qr_inscripcion_id") || 0)) as { token?: string }
      setGeneratedQr(result.token || "")
      toast.success("QR generado")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo generar el QR")
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/70 bg-card/90 shadow-[0_18px_50px_rgba(11,42,85,0.08)]">
        <CardContent className="flex flex-col gap-5 p-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
              <ShieldCheck className="size-3.5" />
              LACDI
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-balance">Acreditación al evento</h1>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Genera QR, acredita asistentes y revisa estadísticas por curso o sesión.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input className="w-44" placeholder="Sesión ID" value={sessionId} onChange={(event) => setSessionId(event.target.value)} />
            <Input className="w-44" placeholder="Curso ID" value={courseId} onChange={(event) => setCourseId(event.target.value)} />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/70 bg-card/90 shadow-[0_18px_50px_rgba(11,42,85,0.08)]">
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-primary"><QrCode className="size-4" />QR</div>
            <form onSubmit={submitQr} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="qr_inscripcion_id">Inscripción</Label>
                <Input id="qr_inscripcion_id" name="qr_inscripcion_id" type="number" min="1" required />
              </div>
              <Button type="submit" disabled={generateQr.isPending}>{generateQr.isPending ? "Generando…" : "Generar QR"}</Button>
            </form>
            {generatedQr && (
              <div className="rounded-2xl border border-border/70 bg-muted/40 p-3 text-xs break-all text-muted-foreground">{generatedQr}</div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/90 shadow-[0_18px_50px_rgba(11,42,85,0.08)]">
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-primary"><Camera className="size-4" />Scan</div>
            <form onSubmit={submitScan} className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2 flex flex-col gap-1.5">
                <Label htmlFor="token">Token</Label>
                <textarea id="token" name="token" className="min-h-28 rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="sesion_id">Sesión ID</Label>
                <Input id="sesion_id" name="sesion_id" type="number" min="1" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="sala_id">Sala ID</Label>
                <Input id="sala_id" name="sala_id" type="number" min="1" />
              </div>
              <div className="md:col-span-2 flex flex-col gap-1.5">
                <Label htmlFor="device_info">Dispositivo</Label>
                <Input id="device_info" name="device_info" />
              </div>
              <Button type="submit" className="md:col-span-2" disabled={scanCheckin.isPending}>{scanCheckin.isPending ? "Registrando…" : "Registrar QR"}</Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/70 bg-card/90 shadow-[0_18px_50px_rgba(11,42,85,0.08)]">
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-primary"><ClipboardCheck className="size-4" />Manual</div>
            <form onSubmit={submitManual} className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2 flex flex-col gap-1.5">
                <Label htmlFor="inscripcion_id">Inscripción</Label>
                <Input id="inscripcion_id" name="inscripcion_id" type="number" min="1" required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="sesion_id_manual">Sesión ID</Label>
                <Input id="sesion_id_manual" name="sesion_id_manual" type="number" min="1" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="sala_id_manual">Sala ID</Label>
                <Input id="sala_id_manual" name="sala_id_manual" type="number" min="1" />
              </div>
              <Button type="submit" className="md:col-span-2" disabled={manualCheckin.isPending}>{manualCheckin.isPending ? "Guardando…" : "Registrar manual"}</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/90 shadow-[0_18px_50px_rgba(11,42,85,0.08)]">
          <CardContent className="space-y-4 p-6">
            <div className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Estadísticas</div>
            {stats ? (
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-border/70 bg-muted/30 p-3">
                    <div className="text-xs uppercase text-muted-foreground">Inscritos</div>
                    <div className="text-lg font-semibold">{stats.total_inscritos}</div>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-muted/30 p-3">
                    <div className="text-xs uppercase text-muted-foreground">Acreditaciones</div>
                    <div className="text-lg font-semibold">{stats.total_checkins}</div>
                  </div>
                </div>
                <div className="space-y-2">
                  {stats.por_sesion.map((item) => (
                    <div key={item.sesion_id} className="flex items-center justify-between rounded-xl border border-border/70 px-3 py-2">
                      <span>Sesión {item.sesion_id}</span>
                      <span className="text-muted-foreground">{item.asistentes_unicos} únicos · {item.total_checkins} total</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Ingresa un curso ID para ver estadísticas.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/70 bg-card/90 shadow-[0_18px_50px_rgba(11,42,85,0.08)]">
        <CardContent className="p-2 sm:p-4">
          <DataTable
            columns={columns}
            data={checkins}
            isLoading={checkinsLoading}
            emptyMessage="No hay acreditaciones para esa sesión"
          />
        </CardContent>
      </Card>
    </div>
  )
}
