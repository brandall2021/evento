import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { useNotify } from '../context/NotificationContext'

export default function AdminCursos() {
  const [cursos, setCursos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    nombre: '', descripcion: '', categoria: '', fecha_inicio: '', fecha_fin: '',
    duracion_horas: '', modalidad: 'virtual', cupos: '', precio: '', requisitos: '',
    aceptacion_auto: false, estado: 'borrador',
  })
  const [editing, setEditing] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const { success, error } = useNotify()

  useEffect(() => { load() }, [])

  async function load() {
    try {
      const data = await api.cursos.listar()
      setCursos(data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  function resetForm() {
    setForm({
      nombre: '', descripcion: '', categoria: '', fecha_inicio: '', fecha_fin: '',
      duracion_horas: '', modalidad: 'virtual', cupos: '', precio: '', requisitos: '',
      aceptacion_auto: false, estado: 'borrador',
    })
    setEditing(null)
    setShowForm(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (editing) {
        await api.cursos.actualizar(editing, form)
        success('Curso actualizado')
      } else {
        await api.cursos.crear(form)
        success('Curso creado')
      }
      resetForm()
      await load()
    } catch (err) { error(err.message) }
    finally { setSubmitting(false) }
  }

  function editCurso(curso) {
    setForm({
      nombre: curso.nombre, descripcion: curso.descripcion || '', categoria: curso.categoria || '',
      fecha_inicio: curso.fecha_inicio, fecha_fin: curso.fecha_fin,
      duracion_horas: curso.duracion_horas, modalidad: curso.modalidad,
      cupos: curso.cupos, precio: curso.precio, requisitos: curso.requisitos || '',
      aceptacion_auto: curso.aceptacion_auto, estado: curso.estado,
    })
    setEditing(curso.id)
    setShowForm(true)
  }

  async function deleteCurso(id) {
    if (!confirm('¿Eliminar curso?')) return
    try {
      await api.cursos.eliminar(id)
      success('Curso eliminado')
      await load()
    } catch (err) { error(err.message) }
  }

  if (loading) return <div className="loading">Cargando...</div>

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Gestión de Cursos</h1>
        <button onClick={() => { resetForm(); setShowForm(!showForm) }} className="btn-primary">
          {showForm ? 'Cancelar' : 'Nuevo curso'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-row">
            <div className="form-group">
              <label>Nombre del curso</label>
              <input type="text" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Categoría</label>
              <input type="text" value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label>Descripción</label>
            <textarea rows={3} value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Fecha inicio</label>
              <input type="date" value={form.fecha_inicio} onChange={e => setForm({ ...form, fecha_inicio: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Fecha fin</label>
              <input type="date" value={form.fecha_fin} onChange={e => setForm({ ...form, fecha_fin: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Duración (horas)</label>
              <input type="number" value={form.duracion_horas} onChange={e => setForm({ ...form, duracion_horas: e.target.value })} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Modalidad</label>
              <select value={form.modalidad} onChange={e => setForm({ ...form, modalidad: e.target.value })}>
                <option value="virtual">Virtual</option>
                <option value="presencial">Presencial</option>
                <option value="hibrido">Híbrido</option>
              </select>
            </div>
            <div className="form-group">
              <label>Cupos</label>
              <input type="number" value={form.cupos} onChange={e => setForm({ ...form, cupos: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Precio ($)</label>
              <input type="number" value={form.precio} onChange={e => setForm({ ...form, precio: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label>Requisitos</label>
            <textarea rows={2} value={form.requisitos} onChange={e => setForm({ ...form, requisitos: e.target.value })} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Estado</label>
              <select value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })}>
                <option value="borrador">Borrador</option>
                <option value="publicado">Publicado</option>
                <option value="finalizado">Finalizado</option>
              </select>
            </div>
            <div className="form-group checkbox-group">
              <label>
                <input type="checkbox" checked={form.aceptacion_auto} onChange={e => setForm({ ...form, aceptacion_auto: e.target.checked })} />
                Aceptación automática
              </label>
            </div>
          </div>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Guardando...' : (editing ? 'Actualizar curso' : 'Crear curso')}
          </button>
        </form>
      )}

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Modalidad</th>
              <th>Inicio</th>
              <th>Precio</th>
              <th>Cupos</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cursos.map(curso => (
              <tr key={curso.id}>
                <td><strong>{curso.nombre}</strong></td>
                <td><span className="tag">{curso.modalidad}</span></td>
                <td>{curso.fecha_inicio}</td>
                <td>${Number(curso.precio).toLocaleString()}</td>
                <td>{curso.cupos}</td>
                <td><span className={`status-dot estado-${curso.estado}`}>{curso.estado}</span></td>
                <td>
                  <button onClick={() => editCurso(curso)} className="btn-small">Editar</button>
                  <button onClick={() => deleteCurso(curso.id)} className="btn-small btn-danger">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
