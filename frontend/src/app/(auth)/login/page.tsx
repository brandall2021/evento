"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { BrandMark } from "@/components/brand/brand-mark"

const loginSchema = z.object({
  email: z.string().min(1, "El email es requerido").email("Email inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  async function onSubmit(data: LoginForm) {
    setServerError(null)
    login.mutate(data, {
      onSuccess: () => {
        toast.success("Sesión iniciada correctamente")
        router.push("/dashboard")
      },
      onError: (error: Error & { response?: { data?: { message?: string } } }) => {
        const msg = error.response?.data?.message || "Credenciales incorrectas"
        setServerError(msg)
      },
    })
  }

  return (
    <Card className="border-0 bg-transparent shadow-none ring-0">
      <CardHeader>
        <div className="mb-2 lg:hidden">
          <BrandMark compact />
        </div>
        <CardTitle>Iniciar sesión</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {serverError && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {serverError}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              autoComplete="email"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            className="w-full"
            disabled={login.isPending}
          >
            {login.isPending ? "Ingresando…" : "Iniciar sesión"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            ¿No tenés cuenta?{" "}
            <Link href="/register" className="font-medium text-foreground underline underline-offset-4 hover:no-underline">
              Registrarse
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
