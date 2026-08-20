import { BrandMark } from "@/components/brand/brand-mark"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100dvh-3rem)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-[2rem] border border-border/70 bg-[linear-gradient(160deg,rgba(11,42,85,0.96),rgba(14,32,64,0.88))] p-8 text-primary-foreground shadow-[0_30px_90px_rgba(11,42,85,0.28)] lg:p-10">
          <BrandMark />
          <div className="mt-16 max-w-xl space-y-6">
            <p className="text-xs font-semibold uppercase tracking-[0.42em] text-primary-foreground/70">
              LACDI
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              Eventos con una operación clara desde la primera sesión.
            </h1>
            <p className="max-w-lg text-base leading-7 text-primary-foreground/78">
              Inscripciones, agenda, certificados, networking y acceso en una sola
              interfaz. La marca se mantiene sobria, con foco en lectura y control.
            </p>
          </div>

          <div className="mt-12 grid gap-3 sm:grid-cols-3">
            {[
              "Agenda y asistentes",
              "Documentos y QR",
              "Tenants y permisos",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-primary-foreground/82 backdrop-blur-sm">
                {item}
              </div>
            ))}
          </div>
        </section>

        <div className="mx-auto w-full max-w-sm space-y-6 lg:max-w-none">
          <div className="text-center lg:text-left">
            <BrandMark compact className="justify-center lg:justify-start" />
            <p className="mt-4 text-sm text-muted-foreground">
              Acceso al panel operativo de LACDI
            </p>
          </div>
          <div className="rounded-[2rem] border border-border/70 bg-card/95 p-1 shadow-[0_30px_80px_rgba(11,42,85,0.14)] backdrop-blur">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
