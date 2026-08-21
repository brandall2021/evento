import type { CollectionMeta } from "./event-dashboard"
import type { CourseMode, CourseStatus } from "@/types/course"

export interface PublicEvent {
  id: number
  nombre: string
  descripcion: string | null
  imagen: string | null
  categoria: string | null
  fecha_inicio: string
  fecha_fin: string
  modalidad: CourseMode
  precio: string | number
  estado: CourseStatus
  cupos: number
  available_spots?: number
  is_full?: boolean
  docente?: {
    id: number
    first_name: string
    last_name: string
  }
}

export interface PublicEventCollection {
  items: PublicEvent[]
  meta?: CollectionMeta
}

export function normalizePublicEventCollection(payload: PublicEvent[] | { items: PublicEvent[]; total?: number; page?: number; pageSize?: number; limit?: number } | undefined): PublicEventCollection
export function getEventTypeLabel(mode: CourseMode | string): string
export function getAvailabilityLabel(event: Pick<PublicEvent, 'cupos'> & Partial<Pick<PublicEvent, 'available_spots' | 'is_full'>>): string
export function getEnrollmentActionLabel(event: Pick<PublicEvent, 'cupos'> & Partial<Pick<PublicEvent, 'available_spots' | 'is_full'>>): string
export function formatPublicEventDateRange(start: string | null | undefined, end: string | null | undefined): string
