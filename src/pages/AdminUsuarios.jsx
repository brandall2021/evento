import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { useNotify } from '../context/NotificationContext'

const roles = [
  { value: 'estudiante', label: 'Estudiante' },
  { value: 'docente', label: 'Docente' },
  { value: 'admin', label: 'Admin' },
]

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ nombre: '', email: '', password: '', rol: 'estudiante', telefono: '' })
  const [submitting, setSubmitting] = useState(false)
  const [filtroRol, setFiltroRol] = useState('')
  const [filtroActivo, setFiltroActivo] = useState('')
  const { success, error } = useNotify()

  useEffect(() => {
    loadData()
  }, [filtroRol, filtroActivo])

  async function loadData() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filtroRol) params.set('rol', filtroRol)
      if (filtroActivo) params.set('activo', filtroActivo)
      const query = params.toString() ? `?${params.toString()}` : ''

      const [users, statsData] = await Promise.all([
        api.usuarios.listar(query),
        api.usuarios.estadisticas(),
      ])
      setUsuarios(users)
      setStats(statsData)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function handleNew() {
    setEditing(null)
    setForm({ nombre: '', email: '', password: '', rol: 'estudiante', telefono: '' })
    setShowForm(true)
  }

  function handleEdit(user) {
    setEditing(user)
    setForm({
      nombre: user.nombre,
      email: user.email,
      password: '',
      rol: user.rol,
      telefono: user.telefono || '',
    })
    setShowForm(true)
  }

  function handleCancel() {
    setEditing(null)
    setShowForm(false)
    setForm({ nombre: '', email: '', password: '', rol: 'estudiante', telefono: '' })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const data = { ...form }
      if (!data.password) delete data.password
      if (!data.telefono) delete data.telefono

      if (editing) {
        await api.usuarios.actualizar(editing.id, data)
        success('Usuario actualizado correctamente')
      } else {
        if (!data.password) {
          error('La contraseña es requerida para nuevos usuarios')
          setSubmitting(false)
          return
        }
        await api.usuarios.crear(data)
        success('Usuario creado correctamente')
      }
      handleCancel()
      loadData()
    } catch (err) {
      error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleToggleActivo(id) {
    try {
      await api.usuarios.toggleActivo(id)
      success('Estado del usuario actualizado')
      loadData()
    } catch (err) {
      error(err.message)
    }
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar este usuario? Esta acción no se puede deshacer.')) return
    try {
      await api.usuarios.eliminar(id)
      success('Usuario eliminado')
      loadData()
    } catch (err) {
      error(err.message)
    }
  }

  if (loading) return <div className="loading">Cargando...</div>

  return (
    <div className="page-container">
      <h1 className="page-title">Gestión de Usuarios</h1>

      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          <div className="admin-card" style={{ padding: 20, textAlign: 'center' }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--accent)' }}>{stats.total}</div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Total</div>
          </div>
          <div className="admin-card" style={{ padding: 20, textAlign: 'center' }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#4caf50' }}>{stats.activos}</div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Activos</div>
          </div>
          <div className="admin-card" style={{ padding: 20, textAlign: 'center' }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#f44336' }}>{stats.inactivos}</div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Inactivos</div>
          </div>
          <div className="admin-card" style={{ padding: 20, textAlign: 'center' }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--text)' }}>
              {stats.porRol.find(r => r.rol === 'admin')?.cantidad || 0}
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Admins</div>
          </div>
        </div>
      )}

      <div className="admin-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <select value={filtroRol} onChange={e => setFiltroRol(e.target.value)} className="font-select" style={{ width: 'auto' }}>
              <option value="">Todos los roles</option>
              {roles.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
            <select value={filtroActivo} onChange={e => setFiltroActivo(e.target.value)} className="font-select" style={{ width: 'auto' }}>
              <option value="">Todos los estados</option>
              <option value="true">Activos</option>
              <option value="false">Inactivos</option>
            </select>
          </div>
          <button onClick={handleNew} className="btn-primary">
            + Nuevo usuario
          </button>
        </div>

        {showForm && (
          <div className="admin-form" style={{ marginBottom: 24, padding: 20, background: 'var(--bg-secondary)', borderRadius: 8 }}>
            <h3 style={{ marginBottom: 16 }}>{editing ? 'Editar usuario' : 'Nuevo usuario'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
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
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>{editing ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña'}</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    required={!editing}
                    minLength={6}
                  />
                </div>
                <div className="form-group">
                  <label>Teléfono (opcional)</label>
                  <input
                    type="tel"
                    value={form.telefono}
                    onChange={e => setForm({ ...form, telefono: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Rol</label>
                <select
                  value={form.rol}
                  onChange={e => setForm({ ...form, rol: e.target.value })}
                  className="font-select"
                >
                  {roles.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-row" style={{ justifyContent: 'flex-end', display: 'flex', gap: 8 }}>
                <button type="button" className="btn-outline" onClick={handleCancel}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Guardando...' : editing ? 'Actualizar' : 'Crear usuario'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Teléfono</th>
                <th>Estado</th>
                <th>Creado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map(user => (
                <tr key={user.id}>
                  <td><strong>{user.nombre}</strong></td>
                  <td>{user.email}</td>
                  <td>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: 4,
                      fontSize: 12,
                      fontWeight: 600,
                      background: user.rol === 'admin' ? 'rgba(201, 168, 76, 0.2)' :
                                  user.rol === 'docente' ? 'rgba(79, 140, 255, 0.2)' :
                                  'rgba(100, 100, 100, 0.2)',
                      color: user.rol === 'admin' ? '#c9a84c' :
                             user.rol === 'docente' ? '#4f8cff' :
                             'var(--text-secondary)',
                    }}>
                      {user.rol}
                    </span>
                  </td>
                  <td>{user.telefono || '—'}</td>
                  <td>
                    <span style={{
                      color: user.activo ? '#4caf50' : '#f44336',
                      fontWeight: 600,
                    }}>
                      {user.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => handleEdit(user)} className="btn-small">
                        Editar
                      </button>
                      <button
                        onClick={() => handleToggleActivo(user.id)}
                        className="btn-small"
                        style={{ color: user.activo ? '#f44336' : '#4caf50' }}
                      >
                        {user.activo ? 'Desactivar' : 'Activar'}
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="btn-small"
                        style={{ color: 'var(--error)' }}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
