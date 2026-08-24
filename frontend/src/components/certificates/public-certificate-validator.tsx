"use client"

import { useEffect, useState, type FormEvent } from "react"
import api from "@/lib/api"
import { normalizePublicCertificateValidation } from "@/lib/public-certificados"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

type PublicCertificateValidationResult = {
  valido: boolean
  mensaje?: string | null
  certificado?: {
    codigo: string
    horas: number
    fecha_emision: string
  } | null
  estudiante?: {
    first_name: string
    last_name: string
  } | null
  curso?: {
    nombre: string
  } | null
  horas?: number | null
  fecha_emision?: string | null
}

type Props = {
  initialCode?: string
}

export function PublicCertificateValidator({ initialCode = "" }: Props) {
  const [inputCode, setInputCode] = useState(initialCode)
  const [submittedCode, setSubmittedCode] = useState(initialCode.trim())
  const [result, setResult] = useState<ReturnType<typeof normalizePublicCertificateValidation> | null>(null)
  const [loading, setLoading] = useState(Boolean(initialCode.trim()))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const code = initialCode.trim()
    if (!code) {
      return
    }

    let cancelled = false

    async function loadCertificate() {
      try {
        const { data } = await api.get<PublicCertificateValidationResult>(`/public/certificados/validar/${encodeURIComponent(code)}`)
        if (!cancelled) {
          setSubmittedCode(code)
          setResult(normalizePublicCertificateValidation(data))
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(requestError instanceof Error ? requestError.message : "No se pudo validar el certificado")
          setResult(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadCertificate()

    return () => {
      cancelled = true
    }
  }, [initialCode])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const code = inputCode.trim()
    if (!code) {
      setError("Ingresá un código")
      setResult(null)
      return
    }

    setSubmittedCode(code)
    setLoading(true)
    setError(null)

    try {
      const { data } = await api.get<PublicCertificateValidationResult>(`/public/certificados/validar/${encodeURIComponent(code)}`)
      setResult(normalizePublicCertificateValidation(data))
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "No se pudo validar el certificado")
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  const isValid = result?.valido && result.certificado

  return (
    <div className="space-y-6">
      <Card className="border-border/70 bg-card/95 shadow-[0_18px_50px_rgba(11,42,85,0.08)]">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl tracking-tight">Validación pública de certificado</CardTitle>
          <p className="text-sm text-muted-foreground">
            Pegá el código del certificado para ver si es válido y recuperar los datos básicos.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
            <Input
              value={inputCode}
              onChange={(event) => setInputCode(event.target.value)}
              placeholder="Ej: 2026-000001"
              className="sm:flex-1"
            />
            <Button type="submit" disabled={loading}>
              {loading ? "Validando…" : "Validar"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {loading ? (
        <Card className="border-border/70 bg-card/95 shadow-[0_18px_50px_rgba(11,42,85,0.08)]">
          <CardContent className="p-6 text-sm text-muted-foreground">Buscando certificado…</CardContent>
        </Card>
      ) : error ? (
        <Card className="border-border/70 bg-card/95 shadow-[0_18px_50px_rgba(11,42,85,0.08)]">
          <CardContent className="p-6 text-sm text-destructive">{error}</CardContent>
        </Card>
      ) : result ? (
        <Card className="border-border/70 bg-card/95 shadow-[0_18px_50px_rgba(11,42,85,0.08)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl tracking-tight">
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isValid ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "bg-destructive/10 text-destructive"}`}>
                {isValid ? "Válido" : "No válido"}
              </span>
              {submittedCode || inputCode.trim()}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
              <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Certificado</div>
              <div className="mt-1 font-semibold">{result.certificado?.codigo || "Sin datos"}</div>
            </div>
            <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
              <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Horas</div>
              <div className="mt-1 font-semibold">{result.horas ?? "—"}</div>
            </div>
            <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
              <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Estudiante</div>
              <div className="mt-1 font-semibold">
                {result.estudiante ? `${result.estudiante.first_name} ${result.estudiante.last_name}` : "Sin datos"}
              </div>
            </div>
            <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
              <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Curso</div>
              <div className="mt-1 font-semibold">{result.curso?.nombre || "Sin datos"}</div>
            </div>
            <div className="rounded-2xl border border-border/70 bg-muted/20 p-4 sm:col-span-2">
              <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Fecha de emisión</div>
              <div className="mt-1 font-semibold">{result.fecha_emision ? new Date(result.fecha_emision).toLocaleDateString("es-AR") : "Sin datos"}</div>
            </div>
            {!isValid && result.mensaje ? (
              <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive sm:col-span-2">
                {result.mensaje}
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
