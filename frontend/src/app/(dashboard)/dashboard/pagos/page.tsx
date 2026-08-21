"use client"

import { useState, type FormEvent } from "react"
import { toast } from "sonner"
import { DataTable, type Column } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatCurrency, formatDateTime, normalizeCollectionResponse } from "@/lib/event-dashboard"
import { useConfirmPayment, useCreatePayment, usePayments } from "@/hooks/use-pagos"
import type { Payment, PaymentMethod } from "@/types/payment"
import { Check, DollarSign, PlusIcon } from "lucide-react"

const paymentMethods: PaymentMethod[] = ["mercado_pago", "transferencia", "tarjeta", "paypal"]

export default function PagosPage() {
  const [page, setPage] = useState(1)
  const [createOpen, setCreateOpen] = useState(false)

  const { data, isLoading } = usePayments({ page, pageSize: 10 })
  const createPayment = useCreatePayment()
  const confirmPayment = useConfirmPayment()

  const { items: payments, meta } = normalizeCollectionResponse(data)

  const columns: Column<Payment>[] = [
    { key: "id", header: "ID" },
    {
      key: "inscripcion_id",
      header: "Inscripción",
      render: (payment) => payment.inscripcion?.curso?.nombre ?? `#${payment.inscripcion_id}`,
    },
    { key: "monto", header: "Monto", render: (payment) => formatCurrency(payment.monto) },
    { key: "metodo", header: "Método" },
    { key: "estado", header: "Estado" },
    { key: "fecha_pago", header: "Pago", render: (payment) => formatDateTime(payment.fecha_pago) },
  ]

  async function submitCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    try {
      await createPayment.mutateAsync({
        inscripcion_id: Number(formData.get("inscripcion_id") || 0),
        monto: Number(formData.get("monto") || 0),
        metodo: String(formData.get("metodo") || "transferencia") as PaymentMethod,
        cuota_numero: Number(formData.get("cuota_numero") || 1),
        cuota_total: Number(formData.get("cuota_total") || 1),
        descuento: Number(formData.get("descuento") || 0),
      })
      toast.success("Pago creado")
      event.currentTarget.reset()
      setCreateOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo crear el pago")
    }
  }

  async function confirm(id: number) {
    try {
      await confirmPayment.mutateAsync(id)
      toast.success("Pago confirmado")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo confirmar")
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/70 bg-card/90 shadow-[0_18px_50px_rgba(11,42,85,0.08)]">
        <CardContent className="flex flex-col gap-5 p-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
              <DollarSign className="size-3.5" />
              LACDI
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-balance">Pagos</h1>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Registra pagos manuales y confirma cobros del backend de eventos.
              </p>
            </div>
          </div>
          <Button onClick={() => setCreateOpen(true)} className="shrink-0">
            <PlusIcon className="size-4" />
            Nuevo pago
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/90 shadow-[0_18px_50px_rgba(11,42,85,0.08)]">
        <CardContent className="p-2 sm:p-4">
          <DataTable
            columns={columns}
            data={payments}
            meta={meta}
            onPageChange={setPage}
            isLoading={isLoading}
            emptyMessage="No hay pagos cargados"
            actions={(payment) => (
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => confirm(payment.id)}
                  disabled={confirmPayment.isPending || payment.estado === "pagado"}
                >
                  <Check className="size-4" />
                </Button>
              </div>
            )}
          />
        </CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo pago</DialogTitle>
            <DialogDescription>Registra un pago para una inscripción existente.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submitCreate} className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="inscripcion_id">Inscripción</Label>
              <Input id="inscripcion_id" name="inscripcion_id" type="number" min="1" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="monto">Monto</Label>
              <Input id="monto" name="monto" type="number" min="0" step="0.01" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="metodo">Método</Label>
              <select id="metodo" name="metodo" className="h-10 rounded-xl border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring">
                {paymentMethods.map((method) => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="descuento">Descuento</Label>
              <Input id="descuento" name="descuento" type="number" min="0" step="0.01" defaultValue="0" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cuota_numero">Cuota</Label>
              <Input id="cuota_numero" name="cuota_numero" type="number" min="1" defaultValue="1" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cuota_total">Total cuotas</Label>
              <Input id="cuota_total" name="cuota_total" type="number" min="1" defaultValue="1" />
            </div>
            <DialogFooter className="md:col-span-2">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={createPayment.isPending}>{createPayment.isPending ? "Creando…" : "Crear pago"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
