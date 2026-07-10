const API_URL = import.meta.env.VITE_API_URL || '/api'

function getToken() {
  return localStorage.getItem('token')
}

async function request(path, options = {}) {
  const token = getToken()
  const isFormData = options.body instanceof FormData
  const headers = isFormData ? {} : { 'Content-Type': 'application/json', ...options.headers }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${API_URL}${path}`, { ...options, headers })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Error de servidor')
  return data
}

async function downloadBlob(path) {
  const token = getToken()
  const res = await fetch(`${API_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Error al descargar')
  }
  return res.blob()
}

export const api = {
  auth: {
    login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    me: () => request('/auth/me'),
    updateProfile: (body) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(body) }),
  },
  cursos: {
    listar: () => request('/cursos'),
    obtener: (id) => request(`/cursos/${id}`),
    crear: (body) => request('/cursos', { method: 'POST', body }),
    actualizar: (id, body) => request(`/cursos/${id}`, { method: 'PUT', body }),
    eliminar: (id) => request(`/cursos/${id}`, { method: 'DELETE' }),
  },
  inscripciones: {
    solicitar: (curso_id) => request('/inscripciones', { method: 'POST', body: JSON.stringify({ curso_id }) }),
    mis: () => request('/inscripciones/mis'),
    listar: (params = '') => request(`/inscripciones${params}`),
    aprobar: (id) => request(`/inscripciones/${id}/aprobar`, { method: 'PUT' }),
    rechazar: (id, motivo) => request(`/inscripciones/${id}/rechazar`, { method: 'PUT', body: JSON.stringify({ motivo }) }),
  },
  pagos: {
    crear: (body) => request('/pagos', { method: 'POST', body: JSON.stringify(body) }),
    listar: () => request('/pagos'),
    confirmar: (id) => request(`/pagos/${id}/confirmar`, { method: 'PUT' }),
  },
  certificados: {
    listar: () => request('/certificados'),
    emitir: (body) => request('/certificados/emitir', { method: 'POST', body: JSON.stringify(body) }),
    async descargar(id) {
      const blob = await downloadBlob(`/certificados/${id}/descargar`)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `certificado-${id}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      setTimeout(() => URL.revokeObjectURL(url), 10000)
    },
    validar: (codigo) => request(`/certificados/validar/${codigo}`),
  },
}
