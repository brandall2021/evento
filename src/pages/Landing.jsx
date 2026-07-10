import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'

function stripHtml(html) {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, '').trim()
}

const modalidadColors = {
  virtual: '#4f8cff',
  presencial: '#ff6b6b',
  hibrido: '#c9a84c',
}

export default function Landing() {
  const { user } = useAuth()
  const [cursos, setCursos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.cursos.listar()
      .then(data => setCursos(data.slice(0, 6)))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="landing">
      <section className="landing-hero">
        <div className="landing-hero-inner">
          <span className="landing-badge">Plataforma de Cursos 2026</span>
          <h1 className="landing-title">
            Donde la innovación<br />
            <span className="landing-accent">encuentra su escenario</span>
          </h1>
          <p className="landing-subtitle">
            Cursos, eventos y certificaciones para profesionales que quieren
            transformar sus carreras con conocimiento de vanguardia.
          </p>
          <div className="landing-actions">
            {user ? (
              <Link to="/cursos" className="btn-primary btn-lg">Explorar cursos</Link>
            ) : (
              <>
                <Link to="/register" className="btn-primary btn-lg">Comenzar ahora</Link>
                <Link to="/login" className="btn-outline btn-lg">Ya tengo cuenta</Link>
              </>
            )}
          </div>
          <div className="landing-stats">
            <div className="landing-stat">
              <span className="landing-stat-value">{cursos.length}+</span>
              <span className="landing-stat-label">Cursos disponibles</span>
            </div>
            <div className="landing-stat">
              <span className="landing-stat-value">100%</span>
              <span className="landing-stat-label">Online</span>
            </div>
            <div className="landing-stat">
              <span className="landing-stat-value">QR</span>
              <span className="landing-stat-label">Certificados válidos</span>
            </div>
          </div>
        </div>
        <div className="landing-hero-glow" />
      </section>

      <section className="landing-features">
        <div className="landing-container">
          <h2 className="landing-section-title">¿Por qué elegirnos?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Cursos especializados</h3>
              <p>Contenido diseñado por expertos del行业 con enfoque práctico y actualizado.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📜</div>
              <h3>Certificados con QR</h3>
              <p>Certificados digitales válidos con código QR de verificación pública.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"> flexible</div>
              <h3>Modalidad flexible</h3>
              <p>Cursos virtuales, presenciales o híbridos que se adaptan a tu horario.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-cursos">
        <div className="landing-container">
          <div className="landing-section-header">
            <h2 className="landing-section-title">Cursos destacados</h2>
            <Link to="/cursos" className="btn-outline">Ver todos</Link>
          </div>
          {loading ? (
            <div className="landing-cursos-grid">
              {[1, 2, 3].map(i => (
                <div key={i} className="curso-card skeleton-card">
                  <div className="skeleton-line w-40" />
                  <div className="skeleton-line w-80" style={{ height: 20, marginTop: 12 }} />
                  <div className="skeleton-line w-100" />
                  <div className="skeleton-line w-60" />
                </div>
              ))}
            </div>
          ) : (
            <div className="landing-cursos-grid">
              {cursos.map(curso => (
                <Link to={user ? `/cursos/${curso.id}` : '/login'} key={curso.id} className="curso-card">
                  {curso.imagen && (
                    <img
                      src={`/uploads/cursos/${curso.imagen}`}
                      alt={curso.nombre}
                      className="curso-card-image"
                    />
                  )}
                  <div className="curso-card-header">
                    <span className="curso-modalidad" style={{ background: modalidadColors[curso.modalidad] }}>
                      {curso.modalidad}
                    </span>
                    <span className="curso-precio">${Number(curso.precio).toLocaleString()}</span>
                  </div>
                  <h3 className="curso-card-title">{curso.nombre}</h3>
                  <p className="curso-card-desc">{stripHtml(curso.descripcion).slice(0, 100)}...</p>
                  <div className="curso-card-footer">
                    <span>{curso.fecha_inicio}</span>
                    <span>{curso.duracion_horas}h</span>
                    <span>{curso.cupos} cupos</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="landing-cta">
        <div className="landing-container">
          <div className="cta-card">
            <h2>¿Listo para comenzar?</h2>
            <p>Unite a cientos de profesionales que ya están capacitándose con nosotros.</p>
            {user ? (
              <Link to="/cursos" className="btn-primary btn-lg">Ver cursos</Link>
            ) : (
              <Link to="/register" className="btn-primary btn-lg">Registrarse gratis</Link>
            )}
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing-container">
          <div className="landing-footer-inner">
            <span className="app-logo">Nexus<span> Summit</span></span>
            <p className="landing-footer-text">&copy; 2026 Nexus Summit. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
