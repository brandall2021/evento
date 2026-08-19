"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

export interface Column<T> {
  key: string
  header: string
  render?: (item: T) => React.ReactNode
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  meta?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
  onPageChange?: (page: number) => void
  isLoading?: boolean
  emptyMessage?: string
  actions?: (item: T) => React.ReactNode
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  meta,
  onPageChange,
  isLoading,
  emptyMessage = "Sin resultados",
  actions,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.key}>{col.header}</TableHead>
              ))}
              {actions && <TableHead className="w-[60px]" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 3 }).map((_, i) => (
              <TableRow key={i}>
                {columns.map((col) => (
                  <TableCell key={col.key}>
                    <div className="h-4 animate-pulse rounded bg-muted" />
                  </TableCell>
                ))}
                {actions && (
                  <TableCell>
                    <div className="h-4 animate-pulse rounded bg-muted" />
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="rounded-md border p-8 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col.key}>{col.header}</TableHead>
            ))}
            {actions && <TableHead className="w-[60px]" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.id}>
              {columns.map((col) => (
                <TableCell key={col.key}>
                  {col.render
                    ? col.render(item)
                    : (item as Record<string, unknown>)[col.key] as React.ReactNode}
                </TableCell>
              ))}
              {actions && <TableCell>{actions(item)}</TableCell>}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between border-t px-4 py-3">
          <span className="text-sm text-muted-foreground">
            Página {meta.page} de {meta.totalPages} ({meta.total} total)
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(meta.page - 1)}
              disabled={meta.page <= 1}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(meta.page + 1)}
              disabled={meta.page >= meta.totalPages}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
