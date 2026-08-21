export type PaymentMethod = "mercado_pago" | "transferencia" | "tarjeta" | "paypal"
export type PaymentStatus = "pendiente" | "pagado" | "rechazado" | "vencido"

export interface Payment {
  id: number
  inscripcion_id: number
  monto: string | number
  metodo: PaymentMethod
  estado: PaymentStatus
  fecha_pago: string | null
  codigo_transaccion: string | null
  comprobante: string | null
  cuota_numero: number
  cuota_total: number
  descuento: string | number
  tipo_beca: string | null
  createdAt: string
  inscripcion?: {
    id: number
    estado: string
    curso?: {
      id: number
      nombre: string
    }
  }
}

export interface CreatePaymentPayload {
  inscripcion_id: number
  monto: number
  metodo: PaymentMethod
  cuota_numero?: number
  cuota_total?: number
  descuento?: number
}
