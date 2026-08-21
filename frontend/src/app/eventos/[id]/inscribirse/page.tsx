"use client"

import { useParams, useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/use-auth"
import { usePublicEvent } from "@/hooks/use-public-events"
import { useRegisterForCourse } from "@/hooks/use-inscripciones"
import { buildGuestEnrollmentPayload } from "@/lib/event-enrollment"
import { getAvailabilityLabel } from "@/lib/public-events"

const enrollmentSchema = z.object({
  firstName: z.string().min(1, "El nombre es requerido"),
  lastName: z.string().min(1, "El apellido es requerido"),
  email: z.string().min(1, "El email es requerido").email("Email inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  confirmPassword: z.string().min(1, "Confirmá tu contraseña"),
})

type EnrollmentForm = z.infer<typeof enrollmentSchema>

export default function InscribirsePage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const courseId = Number(params.id)
  const { data: event } = usePublicEvent(Number.isFinite(courseId) ? courseId : undefined)
  const { user, isAuthenticated, register: registerMutation } = useAuth()
  const registerForCourse = useRegisterForCourse()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EnrollmentForm>({
    resolver: zodResolver(enrollmentSchema),
    defaultValues: { firstName: "", lastName: "", email: "", password: "", confirmPassword: "" },
  })

  async function onGuestEnroll(data: EnrollmentForm) {
    try {
      const payload = buildGuestEnrollmentPayload({
        courseId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
      })

      await registerMutation.mutateAsync(payload.authPayload)
      const result = await registerForCourse.mutateAsync(payload.courseId)
      toast.success(result.estado === 'en_espera' ? "Te sumamos a la lista de espera" : "Inscripción realizada")
      router.push("/dashboard")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo completar la inscripción")
    }
  }

  async function enrollAuthenticated() {
    try {
      const result = await registerForCourse.mutateAsync(courseId)
      toast.success(result.estado === 'en_espera' ? "Te sumamos a la lista de espera" : "Inscripción realizada")
      router.push("/dashboard/inscripciones")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo completar la inscripción")
    }
  }

  if (!event) {
    return <div className="px-4 py-10 text-sm text-muted-foreground">Cargando inscripción…</div>
  }

  return (
    <main className="min-h-dvh bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="border-border/70 bg-card/90 shadow-[0_18px_50px_rgba(11,42,85,0.08)]">
          <CardContent className="space-y-4 p-6">
            <div className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Evento</div>
            <h1 className="text-3xl font-semibold tracking-tight">{event.nombre}</h1>
            <p className="text-sm leading-6 text-muted-foreground">{event.descripcion || "Formulario de inscripción pública."}</p>
            <div className="rounded-2xl border border-border/70 bg-muted/30 p-4 text-sm">
              <div><span className="font-semibold">Cupos:</span> {event.cupos}</div>
              <div><span className="font-semibold">Modalidad:</span> {event.modalidad}</div>
              <div className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${event.available_spots && event.available_spots > 0 ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-destructive/10 text-destructive'}`}>
                {getAvailabilityLabel(event)}
              </div>
            </div>
            {isAuthenticated ? (
              <div className="space-y-3 rounded-2xl border border-border/70 bg-muted/20 p-4">
                <p className="text-sm text-muted-foreground">Estás logueado como {user?.email}.</p>
                <Button onClick={enrollAuthenticated} disabled={registerForCourse.isPending || event.available_spots === 0}>
                  {event.available_spots === 0 ? "En espera" : registerForCourse.isPending ? "Inscribiendo…" : "Inscribirme ahora"}
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Creá tu cuenta y te inscribimos al terminar.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/90 shadow-[0_18px_50px_rgba(11,42,85,0.08)]">
          <CardContent className="p-6">
            {!isAuthenticated && (
              <form onSubmit={handleSubmit(onGuestEnroll)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nombre</Label>
                    <Input id="firstName" {...register("firstName")} />
                    {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Apellido</Label>
                    <Input id="lastName" {...register("lastName")} />
                    {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" {...register("email")} />
                  {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input id="password" type="password" {...register("password")} />
                  {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                  <Input id="confirmPassword" type="password" {...register("confirmPassword")} />
                  {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
                </div>
                <Button type="submit" className="w-full" disabled={registerMutation.isPending || registerForCourse.isPending}>
                  {registerMutation.isPending || registerForCourse.isPending ? "Registrando…" : event.available_spots === 0 ? "Sumarme a lista de espera" : "Crear cuenta e inscribirme"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
