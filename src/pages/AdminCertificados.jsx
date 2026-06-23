import { useState, useEffect } from 'react'
import { api } from '../services/api'

export default function AdminCertificados() {
  const [certificados, setCertificados] = useState([])
  const [inscripciones, setInscripciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedInsc, setSelectedInsc] = useState('')
  const [nota, setNota] = useState('')
  const [msg, setMsg] = useState('')

  useEffect(() => {
    Promise.all([
      api.certificados.listar(),
      api.inscripciones.listar('?estado=finalizado'),
    ]).then(([certs, inscr]) => {
      setCertificados(certs)
      setInscripciones(inscr)
    }).catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  async function handleEmitir(e) {
    e.preventDefault()
    setMsg('')
    try {
      const cert = await api.certificados.emitir({
        inscripcion_id: Number(selectedInsc),
        nota: nota || null,
      })
      setMsg(`Certificado ${cert.codigo} emitido correctamente.`)
      setSelectedInsc('')
      setNota('')
      const certs = await api.certificados.listar()
      setCertificados(certs)
    } catch (err) {
      setMsg(`Error: ${err.message}`)
    }
  }

  if (loading) return <div className="loading">Cargando...</div>

  return (
    <div className="page-container">
      <h1 className="page-title">Certificados</h1>

      <div className="admin-card">
        <h3>Emitir nuevo certificado</h3>
        {msg && <div className="alert alert-info">{msg}</div>}
        <form onSubmit={handleEmitir} className="admin-form">
          <div className="form-group">
            <label>Inscripción (curso finalizado)</label>
            <select value={selectedInsc} onChange={e => setSelectedInsc(e.target.value)} required>
              <option value="">Seleccionar...</option>
              {inscripciones.filter(i => !i.certificado).map(insc => (
                <option key={insc.id} value={insc.id}>
                  {insc.estudiante?.nombre} — {insc.curso?.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Nota (opcional)</label>
              <input type="number" step="0.01" min="0" max="10" value={nota} onChange={e => setNota(e.target.value)} />
            </div>
            <div className="form-group" style={{ justifyContent: 'flex-end', display: 'flex' }}>
              <button type="submit" className="btn-primary">Emitir certificado</button>
            </div>
          </div>
        </form>
      </div>

      <div className="table-container" style={{ marginTop: 32 }}>
        <table className="table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Estudiante</th>
              <th>Curso</th>
              <th>Horas</th>
              <th>Emisión</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {certificados.map(cert => (
              <tr key={cert.id}>
                <td><strong>{cert.codigo}</strong></td>
                <td>{cert.inscripcion?.estudiante?.nombre}</td>
                <td>{cert.inscripcion?.curso?.nombre}</td>
                <td>{cert.horas}h</td>
                <td>{new Date(cert.fecha_emision).toLocaleDateString()}</td>
                <td>
                  <a
                    href={api.certificados.descargar(cert.id)}
                    className="btn-small"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Descargar PDF
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
