import { useState } from 'react'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useNotify } from '../context/NotificationContext'

export default function Perfil() {
  const { user, refreshUser } = useAuth()
  const { success, error } = useNotify()
  const [form, setForm] = useState({
    nombre: user?.nombre || '',
    telefono: user?.telefono || '',
    password: '',
  })
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const data = { ...form }
      if (!data.password) delete data.password
      await api.auth.updateProfile(data)
      await refreshUser()
      success('Perfil actualizado correctamente')
      setForm(prev => ({ ...prev, password: '' }))
    } catch (err) {
      error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page-container">
      <h1 className="page-title">Mi Perfil</h1>
      <div className="admin-card" style={{ maxWidth: 480 }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre</label>
            <input
              type="text"
              value={form.nombre}
              onChange={e => setForm({ ...form, nombre: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={user?.email || ''} disabled />
          </div>
          <div className="form-group">
            <label>Teléfono</label>
            <input
              type="tel"
              value={form.telefono}
              onChange={e => setForm({ ...form, telefono: e.target.value })}
              placeholder="Opcional"
            />
          </div>
          <div className="form-group">
            <label>Nueva contraseña (dejar vacío para no cambiar)</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              minLength={6}
              placeholder="••••••"
            />
          </div>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      </div>
    </div>
  )
}