"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowRight, CalendarDays, Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { formatPublicEventDateRange, getAvailabilityLabel, getEnrollmentActionLabel, getEventTypeLabel, normalizePublicEventCollection } from "@/lib/public-events"
import { usePublicEvent, usePublicEvents } from "@/hooks/use-public-events"

export default function EventoPublicoPage() {
  const params = useParams<{ id: string }>()
  const id = Number(params.id)
  const { data, isLoading } = usePublicEvent(Number.isFinite(id) ? id : undefined)
  const { data: listData } = usePublicEvents({ page: 1, limit: 24 })

  const { items: relatedEvents } = normalizePublicEventCollection(listData)

  if (isLoading) {
    return (
      <main className="min-h-dvh bg-background px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Card className="border-border/70 bg-card/90 shadow-[0_18px_50px_rgba(11,42,85,0.08)]">
            <CardContent className="p-8 text-sm text-muted-foreground">
              Cargando evento...
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  if (!data) {
    return (
      <main className="min-h-dvh bg-background px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Card className="border-border/70 bg-card/90 shadow-[0_18px_50px_rgba(11,42,85,0.08)]">
            <CardContent className="p-8 text-sm text-muted-foreground">
              Evento no encontrado.
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-dvh bg-background">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <div className="flex flex-col gap-4 rounded-[2rem] border border-border/70 bg-card/90 p-6 shadow-[0_20px_60px_rgba(11,42,85,0.08)] lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
              <Sparkles className="size-3.5" />
              {getEventTypeLabel(data.modalidad)}
            </div>
            <div>
              <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">{data.nombre}</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">{data.descripcion || "Detalle público del evento publicado."}</p>
            </div>
          </div>
          <Link href="/eventos" className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
            Volver al listado
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="border-border/70 bg-card/90 shadow-[0_18px_50px_rgba(11,42,85,0.08)]">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><CalendarDays className="size-4" />{formatPublicEventDateRange(data.fecha_inicio, data.fecha_fin)}</div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
                  <div className="text-xs uppercase text-muted-foreground">Modalidad</div>
                  <div className="mt-1 font-semibold">{getEventTypeLabel(data.modalidad)}</div>
                </div>
                <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
                  <div className="text-xs uppercase text-muted-foreground">Cupos</div>
                  <div className="mt-1 font-semibold">{data.cupos}</div>
                </div>
                <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
                  <div className="text-xs uppercase text-muted-foreground">Precio</div>
                  <div className="mt-1 font-semibold">{typeof data.precio === "number" ? `$${data.precio.toFixed(2)}` : data.precio}</div>
                </div>
              </div>
              <div className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${data.available_spots && data.available_spots > 0 ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-destructive/10 text-destructive'}`}>
                {getAvailabilityLabel(data)}
              </div>
              <div className="rounded-3xl border border-border/70 bg-muted/20 p-5 text-sm leading-7 text-muted-foreground">
                Este es el detalle público del evento. Desde acá se puede llevar al flujo de registro cuando el backend lo habilite.
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href={`/eventos/${data.id}/inscribirse`} className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80">
                  {getEnrollmentActionLabel(data)}
                </Link>
                <Link href="/login" className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
                  Ingresar
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/90 shadow-[0_18px_50px_rgba(11,42,85,0.08)]">
            <CardContent className="space-y-4 p-6">
              <div className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Eventos relacionados</div>
              <div className="space-y-3">
                {relatedEvents.filter((event) => event.id !== data.id).slice(0, 3).map((event) => (
                  <Link key={event.id} href={`/eventos/${event.id}`} className="block rounded-2xl border border-border/70 px-4 py-3 transition-colors hover:bg-accent hover:text-accent-foreground">
                    <div className="text-xs uppercase text-muted-foreground">{getEventTypeLabel(event.modalidad)}</div>
                    <div className="mt-1 font-semibold">{event.nombre}</div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  )
}
