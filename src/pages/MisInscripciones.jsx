import { useState, useEffect } from 'react'
import { api } from '../services/api'

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

  useEffect(() => {
    api.inscripciones.mis()
      .then(setInscripciones)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

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
                <th>Acción</th>
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
                    {insc.estado === 'finalizado' && (
                      <a
                        href={api.certificados.descargar(insc.certificado?.id)}
                        className="btn-small"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Descargar certificado
                      </a>
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
