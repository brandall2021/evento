"use client"

import { useState, type FormEvent } from "react"
import { toast } from "sonner"
import { DataTable, type Column } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatDateTime } from "@/lib/event-dashboard"
import { useIssueCredential, useMyCredentials, useValidateCredential } from "@/hooks/use-credenciales"
import type { Credential } from "@/types/credential"
import { BadgeCheck, Search, ShieldCheck } from "lucide-react"

export default function CredencialesPage() {
  const [validationCode, setValidationCode] = useState("")
  const [inscripcionId, setInscripcionId] = useState("")

  const { data, isLoading } = useMyCredentials()
  const validation = useValidateCredential(validationCode || undefined)
  const issueCredential = useIssueCredential()

  const credentials = data ?? []

  const columns: Column<Credential>[] = [
    { key: "codigo", header: "Código" },
    { key: "curso_id", header: "Curso", render: (credential) => credential.curso?.nombre ?? `#${credential.curso_id}` },
    { key: "emitida", header: "Estado", render: (credential) => (credential.emitida ? "Emitida" : "Pendiente") },
    { key: "fecha_emision", header: "Emisión", render: (credential) => formatDateTime(credential.fecha_emision) },
  ]

  async function submitIssue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    try {
      await issueCredential.mutateAsync(Number(inscripcionId || 0))
      toast.success("Credencial emitida")
      setInscripcionId("")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo emitir la credencial")
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
              <h1 className="text-3xl font-semibold tracking-tight text-balance">Credenciales</h1>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Emite credenciales, valida códigos y revisa las credenciales del usuario.
              </p>
            </div>
          </div>
          <form onSubmit={submitIssue} className="flex items-end gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="inscripcionId">Inscripción ID</Label>
              <Input id="inscripcionId" value={inscripcionId} onChange={(event) => setInscripcionId(event.target.value)} type="number" min="1" className="w-44" />
            </div>
            <Button type="submit" disabled={issueCredential.isPending}>{issueCredential.isPending ? "Emitiendo…" : "Emitir"}</Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/70 bg-card/90 shadow-[0_18px_50px_rgba(11,42,85,0.08)]">
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-primary"><Search className="size-4" />Validar</div>
            <div className="flex gap-3">
              <Input value={validationCode} onChange={(event) => setValidationCode(event.target.value)} placeholder="Código de credencial" />
            </div>
            {validation.data ? (
              <div className="rounded-2xl border border-border/70 bg-muted/30 p-4 text-sm">
                <div className="font-semibold text-foreground">{validation.data.asistente}</div>
                <div className="text-muted-foreground">{validation.data.curso}</div>
                <div className="text-muted-foreground">{validation.data.codigo}</div>
              </div>
            ) : validationCode ? (
              <p className="text-sm text-muted-foreground">Buscando credencial…</p>
            ) : null}
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/90 shadow-[0_18px_50px_rgba(11,42,85,0.08)]">
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-primary"><BadgeCheck className="size-4" />Resumen</div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl border border-border/70 bg-muted/30 p-3">
                <div className="text-xs uppercase text-muted-foreground">Total</div>
                <div className="text-lg font-semibold">{credentials.length}</div>
              </div>
              <div className="rounded-2xl border border-border/70 bg-muted/30 p-3">
                <div className="text-xs uppercase text-muted-foreground">Emitidas</div>
                <div className="text-lg font-semibold">{credentials.filter((credential) => credential.emitida).length}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/70 bg-card/90 shadow-[0_18px_50px_rgba(11,42,85,0.08)]">
        <CardContent className="p-2 sm:p-4">
          <DataTable columns={columns} data={credentials} isLoading={isLoading} emptyMessage="No hay credenciales" />
        </CardContent>
      </Card>
    </div>
  )
}
