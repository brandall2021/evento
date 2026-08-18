import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../services/api'

export default function ValidarCertificado() {
  const { codigo: codigoParam } = useParams()
  const [codigo, setCodigo] = useState(codigoParam || '')
  const [resultado, setResultado] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function validar(code) {
    if (!code) return
    setLoading(true)
    setResultado(null)
    setError('')
    try {
      const data = await api.certificados.validar(code)
      setResultado(data)
    } catch (err) {
      setError(err.message || 'Certificado no válido')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (codigoParam) validar(codigoParam)
  }, [codigoParam])

  return (
    <div className="validar-page">
      <div className="validar-card">
        <h1 className="validar-title">Validación de certificados</h1>
        <p className="validar-subtitle">
          Ingresá el código que figura en el certificado o escaneá el código QR para verificar su autenticidad.
        </p>

        <form
          className="validar-form"
          onSubmit={e => { e.preventDefault(); validar(codigo) }}
        >
          <input
            type="text"
            value={codigo}
            onChange={e => setCodigo(e.target.value)}
            placeholder="Ej: 2026-000123"
            className="validar-input"
          />
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Verificando...' : 'Validar'}
          </button>
        </form>

        {error && (
          <div className="validar-resultado validar-invalido">
            <div className="validar-icono">✕</div>
            <strong>Certificado no válido</strong>
            <p>No se encontró un certificado válido con el código ingresado.</p>
          </div>
        )}

        {resultado && (
          <div className="validar-resultado validar-valido">
            <div className="validar-icono">✓</div>
            <strong>Certificado válido</strong>
            <dl className="validar-detalle">
              <div>
                <dt>Estudiante</dt>
                <dd>{resultado.estudiante}</dd>
              </div>
              <div>
                <dt>Curso</dt>
                <dd>{resultado.curso}</dd>
              </div>
              <div>
                <dt>Horas académicas</dt>
                <dd>{resultado.horas}</dd>
              </div>
              <div>
                <dt>Fecha de emisión</dt>
                <dd>{new Date(resultado.fecha_emision).toLocaleDateString()}</dd>
              </div>
              <div>
                <dt>Código</dt>
                <dd>{resultado.codigo}</dd>
              </div>
            </dl>
          </div>
        )}
      </div>
    </div>
  )
}