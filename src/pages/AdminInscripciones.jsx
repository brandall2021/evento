import { useState, useEffect } from 'react'
import { api } from '../services/api'

const estadoColors = {
  pendiente: '#f0a500',
  aceptado: '#4caf50',
  rechazado: '#f44336',
  en_curso: '#2196f3',
  finalizado: '#9c27b0',
}

export default function AdminInscripciones() {
  const [inscripciones, setInscripciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    try {
      const data = await api.inscripciones.listar()
      setInscripciones(data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  async function handleAprobar(id) {
    await api.inscripciones.aprobar(id)
    await load()
  }

  async function handleRechazar(id) {
    const motivo = prompt('Motivo del rechazo (opcional):')
    await api.inscripciones.rechazar(id, motivo || '')
    await load()
  }

  const filtered = filter ? inscripciones.filter(i => i.estado === filter) : inscripciones

  if (loading) return <div className="loading">Cargando...</div>

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Inscripciones</h1>
        <div className="filter-group">
          <select value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="">Todas</option>
            <option value="pendiente">Pendientes</option>
            <option value="aceptado">Aceptadas</option>
            <option value="rechazado">Rechazadas</option>
            <option value="en_curso">En curso</option>
            <option value="finalizado">Finalizadas</option>
          </select>
        </div>
      </div>
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Estudiante</th>
              <th>Curso</th>
              <th>Estado</th>
              <th>Fecha solicitud</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(insc => (
              <tr key={insc.id}>
                <td>
                  <strong>{insc.estudiante?.nombre}</strong>
                  <br /><small>{insc.estudiante?.email}</small>
                </td>
                <td>{insc.curso?.nombre}</td>
                <td>
                  <span className="status-badge" style={{ background: estadoColors[insc.estado] }}>
                    {insc.estado}
                  </span>
                </td>
                <td>{new Date(insc.fecha_solicitud).toLocaleDateString()}</td>
                <td>
                  {insc.estado === 'pendiente' && (
                    <>
                      <button onClick={() => handleAprobar(insc.id)} className="btn-small btn-success">Aprobar</button>
                      <button onClick={() => handleRechazar(insc.id)} className="btn-small btn-danger">Rechazar</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
