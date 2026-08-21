const currencyFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const dateFormatter = new Intl.DateTimeFormat('es-AR', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

function normalizeCollectionResponse(payload) {
  if (Array.isArray(payload)) {
    return { items: payload, meta: undefined }
  }

  if (payload && Array.isArray(payload.data)) {
    const pageSize = payload.pageSize || payload.limit || payload.meta?.limit || payload.data.length || 1
    const total = payload.total ?? payload.meta?.total ?? payload.data.length
    const page = payload.page ?? payload.meta?.page ?? 1

    return {
      items: payload.data,
      meta: {
        total,
        page,
        limit: pageSize,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    }
  }

  return { items: [], meta: undefined }
}

function formatCurrency(value) {
  const amount = typeof value === 'string' ? Number(value) : value
  return currencyFormatter.format(Number.isFinite(amount) ? amount : 0)
}

function formatDateTime(value) {
  if (!value) return '—'
  return dateFormatter.format(new Date(value))
}

module.exports = {
  normalizeCollectionResponse,
  formatCurrency,
  formatDateTime,
}
