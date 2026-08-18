import { useState, useEffect, useMemo } from 'react'
import { api } from '../services/api'
import { useNotify } from '../context/NotificationContext'
import AdminNav from '../components/AdminNav'

const estadoColors = {
  pendiente: '#f0a500',
  pagado: '#4caf50',
  rechazado: '#f44336',
  vencido: '#9c27b0',
}

const metodoLabels = {
  mercado_pago: 'Mercado Pago',
  transferencia: 'Transferencia',
  tarjeta: 'Tarjeta',
  paypal: 'PayPal',
}

export default function AdminPagos() {
  const [pagos, setPagos] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [confirmando, setConfirmando] = useState(null)
  const { success, error } = useNotify()

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const data = await api.pagos.listar()
      setPagos(Array.isArray(data) ? data : data.data || [])
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  async function handleConfirmar(id) {
    setConfirmando(id)
    try {
      await api.pagos.confirmar(id)
      success('Pago confirmado')
      await load()
    } catch (err) { error(err.message) }
    finally { setConfirmando(null) }
  }

  const filtered = useMemo(() => (
    filter ? pagos.filter(p => p.estado === filter) : pagos
  ), [pagos, filter])

  const totalPagado = useMemo(
    () => pagos.filter(p => p.estado === 'pagado').reduce((s, p) => s + Number(p.monto), 0),
    [pagos],
  )
  const pendientes = useMemo(
    () => pagos.filter(p => p.estado === 'pendiente').reduce((s, p) => s + Number(p.monto), 0),
    [pagos],
  )

  if (loading) return <div className="loading">Cargando...</div>

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Pagos</h1>
        <div className="filter-group">
          <select value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="">Todos</option>
            <option value="pendiente">Pendientes</option>
            <option value="pagado">Pagados</option>
            <option value="rechazado">Rechazados</option>
            <option value="vencido">Vencidos</option>
          </select>
        </div>
      </div>
      <AdminNav />

      <div className="stats-grid" style={{ marginBottom: 32 }}>
        <div className="stat-card-lg" style={{ borderTop: '3px solid #4caf50' }}>
          <span className="stat-card-value">${totalPagado.toLocaleString()}</span>
          <span className="stat-card-label">Total cobrado</span>
        </div>
        <div className="stat-card-lg" style={{ borderTop: '3px solid #f0a500' }}>
          <span className="stat-card-value">${pendientes.toLocaleString()}</span>
          <span className="stat-card-label">Pendiente de cobro</span>
        </div>
        <div className="stat-card-lg" style={{ borderTop: '3px solid #c9a84c' }}>
          <span className="stat-card-value">{pagos.length}</span>
          <span className="stat-card-label">Pagos registrados</span>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">No se encontraron pagos</div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Estudiante</th>
                <th>Curso</th>
                <th>Monto</th>
                <th>Método</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(pago => (
                <tr key={pago.id}>
                  <td>
                    <strong>{pago.inscripcion?.estudiante?.nombre || `#${pago.inscripcion_id}`}</strong>
                    <br /><small>{pago.inscripcion?.estudiante?.email}</small>
                  </td>
                  <td>{pago.inscripcion?.curso?.nombre || '—'}</td>
                  <td>
                    <strong>${Number(pago.monto).toLocaleString()}</strong>
                    {Number(pago.descuento) > 0 && (
                      <small> (-{Number(pago.descuento).toLocaleString()})</small>
                    )}
                  </td>
                  <td>
                    <span className="tag">{metodoLabels[pago.metodo] || pago.metodo}</span>
                    {pago.cuota_total > 1 && (
                      <div><small>Cuota {pago.cuota_numero}/{pago.cuota_total}</small></div>
                    )}
                  </td>
                  <td>
                    <span className="status-badge" style={{ background: estadoColors[pago.estado] }}>
                      {pago.estado}
                    </span>
                  </td>
                  <td>
                    {new Date(pago.fecha_pago || pago.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    {pago.estado === 'pendiente' && (
                      <button
                        onClick={() => handleConfirmar(pago.id)}
                        className="btn-small btn-success"
                        disabled={confirmando === pago.id}
                      >
                        {confirmando === pago.id ? 'Confirmando...' : 'Confirmar'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}