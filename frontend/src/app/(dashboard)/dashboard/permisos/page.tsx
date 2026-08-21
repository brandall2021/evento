"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAssignPermissions, useRoles } from "@/hooks/use-roles"
import { usePermissions } from "@/hooks/use-permissions"
import type { Permission } from "@/types/permission"
import { Shield, Sparkles } from "lucide-react"

export default function PermisosPage() {
  const { data: roles } = useRoles()
  const { data: permissions } = usePermissions()
  const assignPermissions = useAssignPermissions()
  const [roleId, setRoleId] = useState<string>("")
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([])

  const activeRoleId = roleId || roles?.[0]?.id || ""

  const currentRole = roles?.find((role) => role.id === activeRoleId)

  useEffect(() => {
    if (!roleId && roles?.length) {
      const firstRole = roles[0]
      queueMicrotask(() => {
        setRoleId(firstRole.id)
        setSelectedPermissionIds(firstRole.permissions.map((permission) => permission.id))
      })
    }
  }, [roles, roleId])

  const grouped = useMemo(() => {
    const map = new Map<string, Permission[]>()
    for (const permission of permissions ?? []) {
      const current = map.get(permission.module) ?? []
      current.push(permission)
      map.set(permission.module, current)
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b))
  }, [permissions])

  async function save() {
    if (!roleId) return
    try {
      await assignPermissions.mutateAsync({ roleId, permissionIds: selectedPermissionIds })
      toast.success("Permisos actualizados")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al actualizar permisos")
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/70 bg-card/90 shadow-[0_18px_50px_rgba(11,42,85,0.08)]">
        <CardContent className="flex flex-col gap-5 p-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
              <Shield className="size-3.5" />
              LACDI
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-balance">Permisos</h1>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Asigna permisos por módulo a cada rol y mantén el RBAC visible en una sola pantalla.
              </p>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background px-3 py-2 text-sm text-muted-foreground">
            <Sparkles className="size-4 text-accent" />
            {permissions?.length ?? 0} permisos cargados
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/90 shadow-[0_18px_50px_rgba(11,42,85,0.08)]">
        <CardContent className="space-y-6 p-6">
          <div className="grid gap-2 max-w-sm">
            <Label htmlFor="role">Rol</Label>
              <Select
                value={activeRoleId}
                onValueChange={(value) => {
                  const nextRoleId = value ?? ""
                  setRoleId(nextRoleId)
                  const nextRole = roles?.find((role) => role.id === nextRoleId)
                  setSelectedPermissionIds(nextRole?.permissions.map((permission) => permission.id) ?? [])
                }}
              >
                <SelectTrigger id="role" className="w-full">
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                  {roles?.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            {currentRole && (
              <p className="text-xs text-muted-foreground">
                Editando permisos de {currentRole.name}
              </p>
            )}
          </div>

          <div className="space-y-5">
            {grouped.map(([module, modulePermissions]) => (
              <section key={module} className="space-y-3 rounded-2xl border border-border/70 bg-muted/30 p-4">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground">{module}</h2>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {modulePermissions.map((permission) => (
                    <label key={permission.id} className="flex items-start gap-2 rounded-xl border border-border/70 bg-background px-3 py-2 text-sm">
                      <input
                        type="checkbox"
                        checked={selectedPermissionIds.includes(permission.id)}
                        onChange={(event) => {
                          setSelectedPermissionIds((current) =>
                            event.target.checked
                              ? [...current, permission.id]
                              : current.filter((id) => id !== permission.id),
                          )
                        }}
                        className="mt-1"
                      />
                      <span>
                        <span className="block font-medium text-foreground">{permission.code}</span>
                        <span className="block text-xs text-muted-foreground">{permission.description || permission.action}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="flex justify-end">
            <Button onClick={save} disabled={assignPermissions.isPending || !roleId}>
              {assignPermissions.isPending ? "Guardando…" : "Guardar permisos"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
