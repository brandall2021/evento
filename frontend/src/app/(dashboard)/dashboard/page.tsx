"use client"

import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Shield, Users, Sparkles, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const { user } = useAuth()

  const tenants = user?.tenants?.length ?? 0
  const roles = user?.tenants?.flatMap((t) => t.roles).length ?? 0

  return (
    <div className="space-y-8">
      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[2rem] border border-border/70 bg-[linear-gradient(160deg,rgba(11,42,85,0.95),rgba(17,29,55,0.88))] p-7 text-primary-foreground shadow-[0_24px_80px_rgba(11,42,85,0.18)] lg:p-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-primary-foreground/70">
            <Sparkles className="size-3.5 text-accent" />
            LACDI
          </div>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Bienvenido{user ? `, ${user.firstName}` : ""}
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-primary-foreground/80">
            Este es el centro operativo de la marca. Acá se ve el estado del acceso, las instituciones y la
            identidad visual aplicada a toda la plataforma.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <Link href="/dashboard/usuarios" className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 font-semibold text-accent-foreground transition-transform hover:-translate-y-0.5">
              Ver usuarios
              <ArrowRight className="size-4" />
            </Link>
            <Link href="/dashboard/roles" className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 font-semibold text-primary-foreground transition-colors hover:bg-white/10">
              Revisar roles
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
          <Card className="border-border/70 bg-card/90 shadow-[0_18px_50px_rgba(11,42,85,0.08)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm tracking-tight">
                <Building2 className="size-4 text-primary" />
                Instituciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold tracking-tight">{tenants}</div>
              <p className="text-xs text-muted-foreground">asociadas a tu cuenta</p>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/90 shadow-[0_18px_50px_rgba(11,42,85,0.08)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm tracking-tight">
                <Shield className="size-4 text-primary" />
                Roles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold tracking-tight">{roles}</div>
              <p className="text-xs text-muted-foreground">roles asignados</p>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/90 shadow-[0_18px_50px_rgba(11,42,85,0.08)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm tracking-tight">
                <Users className="size-4 text-primary" />
                Perfil
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-semibold text-foreground">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{user?.email}</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/70 bg-card/90 shadow-[0_18px_50px_rgba(11,42,85,0.08)]">
          <CardHeader>
            <CardTitle className="text-sm tracking-tight">Estado de marca</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Paleta navy + amber aplicada al layout, navegación y CTA.</p>
            <p>Logo LACDI en home, auth y dashboard con favicon propio.</p>
            <p>Fondos con gradientes suaves para evitar la UI plana.</p>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/90 shadow-[0_18px_50px_rgba(11,42,85,0.08)]">
          <CardHeader>
            <CardTitle className="text-sm tracking-tight">Próximo paso</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Seguir con integración end-to-end para validar este skin sobre flujos reales.</p>
            <p>El branding ya quedó consistente en portada, auth y shell operativo.</p>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
