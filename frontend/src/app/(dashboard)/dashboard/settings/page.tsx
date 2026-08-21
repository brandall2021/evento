"use client"

import { useMemo, useState, type FormEvent } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTenants, useTenant, useUpdateTenant } from "@/hooks/use-tenants"
import { Settings2, Sparkles } from "lucide-react"

export default function SettingsPage() {
  const { data: tenants } = useTenants()
  const [tenantId, setTenantId] = useState<string>("")
  const tenant = useTenant(tenantId)
  const updateTenant = useUpdateTenant()

  const tenantLabel = useMemo(() => tenant.data?.name ?? "Selecciona una institución", [tenant.data])
  const activeTenantId = tenantId || tenants?.[0]?.id || ""
  const activeTenant = tenant.data
  const settingsText = useMemo(() => JSON.stringify(activeTenant?.settings ?? {}, null, 2), [activeTenant])

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!activeTenant) return

    const formData = new FormData(event.currentTarget)
    const rawSettings = formData.get("settings")?.toString() || "{}"

    try {
      const parsedSettings = rawSettings.trim() ? JSON.parse(rawSettings) : {}
      await updateTenant.mutateAsync({
        id: activeTenant.id,
        payload: {
          name: formData.get("name")?.toString() || activeTenant.name,
          slug: formData.get("slug")?.toString() || activeTenant.slug,
          domain: formData.get("domain")?.toString() || null,
          logoUrl: formData.get("logoUrl")?.toString() || null,
          bannerUrl: formData.get("bannerUrl")?.toString() || null,
          settings: parsedSettings,
          isActive: formData.get("isActive") === "on",
        },
      })
      toast.success("Configuración guardada")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al guardar settings")
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/70 bg-card/90 shadow-[0_18px_50px_rgba(11,42,85,0.08)]">
        <CardContent className="flex flex-col gap-5 p-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
              <Settings2 className="size-3.5" />
              LACDI
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-balance">Settings</h1>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Centraliza la configuración del tenant activo y prepara la personalización de la instalación.
              </p>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background px-3 py-2 text-sm text-muted-foreground">
            <Sparkles className="size-4 text-accent" />
            {tenantLabel}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/90 shadow-[0_18px_50px_rgba(11,42,85,0.08)]">
        <CardContent className="space-y-6 p-6">
          <div className="grid gap-2 max-w-sm">
            <Label htmlFor="tenant">Institución</Label>
            <Select value={activeTenantId} onValueChange={(value) => setTenantId(value ?? "") }>
              <SelectTrigger id="tenant" className="w-full">
                <SelectValue placeholder="Selecciona una institución" />
              </SelectTrigger>
              <SelectContent>
                {tenants?.map((tenant) => (
                  <SelectItem key={tenant.id} value={tenant.id}>
                    {tenant.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {activeTenant ? (
            <form onSubmit={save} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="name">Nombre</Label>
                  <Input id="name" name="name" defaultValue={activeTenant.name} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="slug">Slug</Label>
                  <Input id="slug" name="slug" defaultValue={activeTenant.slug} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="domain">Dominio</Label>
                  <Input id="domain" name="domain" defaultValue={activeTenant.domain ?? ""} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="logoUrl">Logo URL</Label>
                  <Input id="logoUrl" name="logoUrl" defaultValue={activeTenant.logoUrl ?? ""} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="bannerUrl">Banner URL</Label>
                  <Input id="bannerUrl" name="bannerUrl" defaultValue={activeTenant.bannerUrl ?? ""} />
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <input id="isActive" name="isActive" type="checkbox" defaultChecked={activeTenant.isActive} />
                <Label htmlFor="isActive" className="font-normal">
                  Institución activa
                </Label>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="settings">JSON de settings</Label>
                <textarea
                  id="settings"
                  name="settings"
                  rows={10}
                  className="min-h-64 rounded-xl border border-input bg-background px-3 py-2 text-sm font-mono text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  defaultValue={settingsText}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="submit" disabled={updateTenant.isPending}>
                  {updateTenant.isPending ? "Guardando…" : "Guardar cambios"}
                </Button>
              </div>
            </form>
          ) : (
            <div className="rounded-2xl border border-border/70 bg-muted/30 p-6 text-sm text-muted-foreground">
              No hay institución seleccionada.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
