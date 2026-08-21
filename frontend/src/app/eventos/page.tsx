"use client"

import Link from "next/link"
import { useState } from "react"
import { ArrowRight, CalendarDays, Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatPublicEventDateRange, getEventTypeLabel, normalizePublicEventCollection } from "@/lib/public-events"
import { usePublicEvents } from "@/hooks/use-public-events"

const eventTypes = ["presencial", "virtual", "hibrido"] as const

export default function EventosPublicosPage() {
  const [tipo, setTipo] = useState<(typeof eventTypes)[number] | "all">("all")
  const { data, isLoading } = usePublicEvents({ page: 1, limit: 24 })

  const { items: events } = normalizePublicEventCollection(data)
  const visibleEvents = tipo === "all" ? events : events.filter((event) => event.modalidad === tipo)

  return (
    <main className="min-h-dvh bg-background">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <div className="flex flex-col gap-4 rounded-[2rem] border border-border/70 bg-card/90 p-6 shadow-[0_20px_60px_rgba(11,42,85,0.08)] lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
              <Sparkles className="size-3.5" />
              Eventos públicos
            </div>
            <div>
              <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">Explorá la agenda publicada y sus tipos de evento.</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
                Listado público de cursos/eventos publicados, con filtros simples por modalidad y acceso directo al detalle.
              </p>
            </div>
          </div>
          <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
            Volver al inicio
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant={tipo === "all" ? "default" : "outline"} onClick={() => setTipo("all")}>Todos</Button>
          {eventTypes.map((eventType) => (
            <Button key={eventType} variant={tipo === eventType ? "default" : "outline"} onClick={() => setTipo(eventType)}>
              {getEventTypeLabel(eventType)}
            </Button>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {eventTypes.map((eventType) => (
            <Card key={eventType} className="border-border/70 bg-card/90 shadow-[0_18px_50px_rgba(11,42,85,0.08)]">
              <CardContent className="p-5">
                <div className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Tipo</div>
                <div className="mt-3 text-xl font-semibold">{getEventTypeLabel(eventType)}</div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Modalidad pensada para la agenda pública de eventos.
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="border-border/70 bg-card/90 shadow-[0_18px_50px_rgba(11,42,85,0.08)]">
                <CardContent className="h-56 animate-pulse p-5" />
              </Card>
            ))
          ) : visibleEvents.length > 0 ? (
            visibleEvents.map((event) => (
              <Card key={event.id} className="border-border/70 bg-card/90 shadow-[0_18px_50px_rgba(11,42,85,0.08)] transition-transform hover:-translate-y-1">
                <CardContent className="flex h-full flex-col gap-4 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">{getEventTypeLabel(event.modalidad)}</div>
                      <h2 className="mt-2 text-xl font-semibold tracking-tight text-balance">{event.nombre}</h2>
                    </div>
                    <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      {event.cupos} cupos
                    </div>
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground line-clamp-3">{event.descripcion || "Evento publicado sin descripción detallada."}</p>
                  <div className="mt-auto space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground"><CalendarDays className="size-4" />{formatPublicEventDateRange(event.fecha_inicio, event.fecha_fin)}</div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold text-foreground">{typeof event.precio === "number" ? `$${event.precio.toFixed(2)}` : event.precio}</span>
                      <Link href={`/eventos/${event.id}`} className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5">
                        Ver detalle
                        <ArrowRight className="size-4" />
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="border-border/70 bg-card/90 shadow-[0_18px_50px_rgba(11,42,85,0.08)] md:col-span-2 xl:col-span-3">
              <CardContent className="p-8 text-center text-sm text-muted-foreground">
                No hay eventos publicados para ese tipo.
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </main>
  )
}
