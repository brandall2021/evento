"use client"

import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Building2, Users } from "lucide-react"

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Bienvenido{user ? `, ${user.firstName}` : ""}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Panel de control de la plataforma Evento.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Building2 className="size-4 text-muted-foreground" />
              Instituciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {user?.tenants?.length ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">asociadas a tu cuenta</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Shield className="size-4 text-muted-foreground" />
              Roles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {user?.tenants?.flatMap((t) => t.roles).length ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">roles asignados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Users className="size-4 text-muted-foreground" />
              Perfil
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
