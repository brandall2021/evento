export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-muted/40 px-4 py-10">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-xl font-semibold tracking-tight">Evento</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Plataforma de gestión de eventos
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}
