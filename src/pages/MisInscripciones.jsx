import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { useNotify } from '../context/NotificationContext'

const estadoColors = {
  pendiente: '#f0a500',
  aceptado: '#4caf50',
  rechazado: '#f44336',
  en_curso: '#2196f3',
  finalizado: '#9c27b0',
}

export default function MisInscripciones() {
  const [inscripciones, setInscripciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [descargando, setDescargando] = useState(null)
  const [pagoPara, setPagoPara] = useState(null)
  const [pagoForm, setPagoForm] = useState({ monto: '', metodo: 'transferencia' })
  const [enviando, setEnviando] = useState(false)
  const { success, error } = useNotify()

  useEffect(() => {
    api.inscripciones.mis()
      .then(setInscripciones)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  async function handleDescargar(id) {
    setDescargando(id)
    try {
      await api.certificados.descargar(id)
    } catch (err) {
      error(err.message)
    } finally {
      setDescargando(null)
    }
  }

  function abrirPago(insc) {
    setPagoPara(insc)
    setPagoForm({ monto: String(insc.curso?.precio ?? ''), metodo: 'transferencia' })
  }

  async function registrarPago(e) {
    e.preventDefault()
    setEnviando(true)
    try {
      await api.pagos.crear({
        inscripcion_id: pagoPara.id,
        monto: Number(pagoForm.monto),
        metodo: pagoForm.metodo,
      })
      success('Pago registrado correctamente')
      setPagoPara(null)
      const updated = await api.inscripciones.mis()
      setInscripciones(updated)
    } catch (err) {
      error(err.message)
    } finally {
      setEnviando(false)
    }
  }

  if (loading) return <div className="loading">Cargando...</div>

  return (
    <div className="page-container">
      <h1 className="page-title">Mis Inscripciones</h1>
      {inscripciones.length === 0 ? (
        <div className="empty-state">No te inscribiste a ningún curso todavía.</div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Curso</th>
                <th>Estado</th>
                <th>Fecha solicitud</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {inscripciones.map(insc => (
                <tr key={insc.id}>
                  <td><strong>{insc.curso?.nombre}</strong></td>
                  <td>
                    <span className="status-badge" style={{ background: estadoColors[insc.estado] }}>
                      {insc.estado}
                    </span>
                  </td>
                  <td>{new Date(insc.fecha_solicitud).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {(insc.estado === 'pendiente' || insc.estado === 'aceptado') && (
                        <button onClick={() => abrirPago(insc)} className="btn-small">
                          Registrar pago
                        </button>
                      )}
                      {insc.estado === 'finalizado' && (
                        <button
                          onClick={() => handleDescargar(insc.certificado?.id)}
                          className="btn-small"
                          disabled={descargando === insc.certificado?.id}
                        >
                          {descargando === insc.certificado?.id ? 'Descargando...' : 'Descargar certificado'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {pagoPara && (
            <div className="admin-form" style={{ marginTop: 24, padding: 20 }}>
              <h3 style={{ marginBottom: 12 }}>Registrar pago — {pagoPara.curso?.nombre}</h3>
              <form onSubmit={registrarPago} className="form-row">
                <div className="form-group">
                  <label>Monto ($)</label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={pagoForm.monto}
                    onChange={e => setPagoForm({ ...pagoForm, monto: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Método de pago</label>
                  <select
                    value={pagoForm.metodo}
                    onChange={e => setPagoForm({ ...pagoForm, metodo: e.target.value })}
                    className="font-select"
                  >
                    <option value="transferencia">Transferencia</option>
                    <option value="mercado_pago">Mercado Pago</option>
                    <option value="tarjeta">Tarjeta</option>
                    <option value="paypal">PayPal</option>
                  </select>
                </div>
                <div className="form-group" style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                  <button type="submit" className="btn-primary" disabled={enviando}>
                    {enviando ? 'Registrando...' : 'Confirmar'}
                  </button>
                  <button type="button" className="btn-outline" onClick={() => setPagoPara(null)}>
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  )
}