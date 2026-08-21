import Link from "next/link"
import { ArrowRight, CalendarDays, ShieldCheck, Sparkles, Workflow } from "lucide-react"
import { BrandMark } from "@/components/brand/brand-mark"

const highlights = [
  {
    title: "Agenda y asistentes",
    text: "Inscripciones, cupos, aprobaciones, control de acceso y seguimiento por sesión.",
    icon: CalendarDays,
  },
  {
    title: "Documentos y validación",
    text: "Certificados, credenciales y QR con una salida consistente para operaciones y soporte.",
    icon: ShieldCheck,
  },
  {
    title: "Operación multi-tenant",
    text: "Tenants, roles y permisos granulares para separar equipos, sedes y clientes.",
    icon: Workflow,
  },
]

const stats = [
  { label: "Módulos NestJS", value: "30+" },
  { label: "Capas de infraestructura", value: "3" },
  { label: "Servicios externos", value: "Redis + MinIO" },
]

export default function Home() {
  return (
    <main className="min-h-dvh">
      <section className="relative overflow-hidden px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 rounded-[1.75rem] border border-border/70 bg-background/70 px-5 py-4 shadow-[0_20px_60px_rgba(11,42,85,0.08)] backdrop-blur-xl">
          <BrandMark />
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Link href="/login" className="rounded-full px-4 py-2 transition-colors hover:bg-accent hover:text-accent-foreground">
              Ingresar
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              Ir al panel
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>

        <div className="mx-auto grid w-full max-w-7xl gap-8 py-10 lg:grid-cols-[1.08fr_0.92fr] lg:py-16">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground shadow-sm">
              <Sparkles className="size-3.5 text-accent" />
              LACDI
            </div>

            <div className="max-w-3xl space-y-5">
              <h1 className="text-5xl font-semibold tracking-tight text-balance text-foreground sm:text-6xl lg:text-7xl">
                Una plataforma de eventos con tono serio, lectura limpia y control real.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
                LACDI organiza inscripciones, agenda, certificados, networking y acceso con una interfaz sobria,
                pensada para equipos que necesitan operar sin ruido visual.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/eventos" className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[0_18px_40px_rgba(11,42,85,0.18)] transition-transform hover:-translate-y-0.5">
              Ver eventos públicos
              <ArrowRight className="size-4" />
            </Link>
            <Link href="/register" className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[0_18px_40px_rgba(11,42,85,0.18)] transition-transform hover:-translate-y-0.5">
              Crear cuenta
              <ArrowRight className="size-4" />
            </Link>
              <Link href="/login" className="inline-flex items-center justify-center rounded-full border border-border/70 bg-card px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
                Entrar al panel
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-3xl border border-border/70 bg-card/90 p-5 shadow-[0_18px_50px_rgba(11,42,85,0.08)]">
                  <div className="text-3xl font-semibold tracking-tight text-foreground">{stat.value}</div>
                  <div className="mt-2 text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[2rem] border border-border/70 bg-card/95 p-6 shadow-[0_24px_80px_rgba(11,42,85,0.12)] lg:p-8">
              <div className="flex items-center justify-between gap-4 border-b border-border/70 pb-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.32em] text-muted-foreground">
                    Centro operativo
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                    Marca clara, UI silenciosa.
                  </h2>
                </div>
                <div className="rounded-2xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground">
                  LACDI
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {highlights.map((item) => (
                  <article key={item.title} className="flex gap-4 rounded-2xl border border-border/70 bg-background/60 p-4 transition-transform hover:-translate-y-0.5">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <item.icon className="size-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.text}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-border/70 bg-[linear-gradient(160deg,rgba(11,42,85,0.95),rgba(17,29,55,0.88))] p-5 text-primary-foreground shadow-[0_20px_50px_rgba(11,42,85,0.18)]">
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-primary-foreground/70">
                  UI
                </p>
                <p className="mt-3 text-lg font-semibold">Nav y dashboard con identidad propia.</p>
                <p className="mt-2 text-sm leading-6 text-primary-foreground/80">
                  Tipografía limpia, bloques de control y una paleta navy + amber sin ruido.
                </p>
              </div>
              <div className="rounded-3xl border border-border/70 bg-[linear-gradient(160deg,rgba(255,184,77,0.22),rgba(255,255,255,0.82))] p-5 shadow-[0_20px_50px_rgba(11,42,85,0.08)] dark:bg-[linear-gradient(160deg,rgba(255,184,77,0.18),rgba(17,29,55,0.88))]">
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-muted-foreground">
                  Infra
                </p>
                <p className="mt-3 text-lg font-semibold text-foreground">NestJS, PostgreSQL, Redis y MinIO.</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  La plataforma está lista para correr como servicios separados en Dokploy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
