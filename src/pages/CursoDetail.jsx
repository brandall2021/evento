import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function CursoDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [curso, setCurso] = useState(null)
  const [loading, setLoading] = useState(true)
  const [inscribiendo, setInscribiendo] = useState(false)
  const [msg, setMsg] = useState({ type: '', text: '' })

  useEffect(() => {
    api.cursos.obtener(id)
      .then(setCurso)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  async function handleInscribir() {
    setInscribiendo(true)
    setMsg({ type: '', text: '' })
    try {
      await api.inscripciones.solicitar(curso.id)
      setMsg({ type: 'success', text: 'Solicitud de inscripción enviada correctamente.' })
    } catch (err) {
      setMsg({ type: 'error', text: err.message })
    } finally {
      setInscribiendo(false)
    }
  }

  if (loading) return <div className="loading">Cargando...</div>
  if (!curso) return <div className="loading">Curso no encontrado</div>

  return (
    <div className="page-container">
      <button onClick={() => navigate(-1)} className="btn-back">← Volver</button>
      <div className="curso-detail">
        <div className="curso-detail-main">
          <span className="curso-modalidad" style={{
            background: curso.modalidad === 'virtual' ? '#4f8cff' : curso.modalidad === 'presencial' ? '#ff6b6b' : '#c9a84c'
          }}>{curso.modalidad}</span>
          <h1 className="curso-detail-title">{curso.nombre}</h1>
          <div className="curso-meta">
            <div className="curso-meta-item"><strong>Inicio:</strong> {curso.fecha_inicio}</div>
            <div className="curso-meta-item"><strong>Fin:</strong> {curso.fecha_fin}</div>
            <div className="curso-meta-item"><strong>Duración:</strong> {curso.duracion_horas} horas</div>
            <div className="curso-meta-item"><strong>Cupos:</strong> {curso.cupos}</div>
            <div className="curso-meta-item"><strong>Docente:</strong> {curso.docente?.nombre}</div>
          </div>
          <div className="curso-section">
            <h3>Descripción</h3>
            <p>{curso.descripcion}</p>
          </div>
          {curso.requisitos && (
            <div className="curso-section">
              <h3>Requisitos</h3>
              <p>{curso.requisitos}</p>
            </div>
          )}
          {curso.precio > 0 && (
            <div className="curso-section">
              <h3>Inversión</h3>
              <p className="curso-precio-detail">${Number(curso.precio).toLocaleString()} ARS</p>
            </div>
          )}
        </div>
        <div className="curso-detail-sidebar">
          <div className="curso-sidebar-card">
            <div className="curso-precio-large">${Number(curso.precio).toLocaleString()}</div>
            {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}
            {user && user.rol === 'estudiante' && (
              <button
                onClick={handleInscribir}
                disabled={inscribiendo}
                className="btn-primary btn-full"
              >{inscribiendo ? 'Procesando...' : 'Solicitar inscripción'}</button>
            )}
            {!user && (
              <button onClick={() => navigate('/login')} className="btn-primary btn-full">
                Ingresar para inscribirse
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
