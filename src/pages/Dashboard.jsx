import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'

export default function Dashboard() {
  const [stats, setStats] = useState({})

  useEffect(() => {
    Promise.all([
      api.cursos.listar(),
      api.inscripciones.listar(),
      api.pagos.listar(),
      api.certificados.listar(),
    ]).then(([cursos, inscripciones, pagos, certificados]) => {
      setStats({
        cursosActivos: cursos.filter(c => c.estado === 'publicado').length,
        alumnosInscritos: new Set(inscripciones.map(i => i.estudiante_id)).size,
        pagosPendientes: pagos.filter(p => p.estado === 'pendiente').length,
        certificadosEmitidos: certificados.length,
        inscripcionesPendientes: inscripciones.filter(i => i.estado === 'pendiente').length,
        ingresos: pagos.filter(p => p.estado === 'pagado').reduce((s, p) => s + Number(p.monto), 0),
      })
    }).catch(console.error)
  }, [])

  const cards = [
    { label: 'Cursos activos', value: stats.cursosActivos || 0, color: '#4f8cff' },
    { label: 'Alumnos inscriptos', value: stats.alumnosInscritos || 0, color: '#4caf50' },
    { label: 'Pagos pendientes', value: stats.pagosPendientes || 0, color: '#f0a500' },
    { label: 'Certificados emitidos', value: stats.certificadosEmitidos || 0, color: '#9c27b0' },
    { label: 'Inscripciones pendientes', value: stats.inscripcionesPendientes || 0, color: '#ff6b6b' },
    { label: 'Ingresos totales', value: `$${(stats.ingresos || 0).toLocaleString()}`, color: '#c9a84c' },
  ]

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Panel de Administración</h1>
        <div className="admin-nav-links">
          <Link to="/admin/cursos" className="btn-outline">Gestionar Cursos</Link>
          <Link to="/admin/inscripciones" className="btn-outline">Inscripciones</Link>
          <Link to="/admin/certificados" className="btn-outline">Certificados</Link>
        </div>
      </div>
      <div className="stats-grid">
        {cards.map((card, i) => (
          <div key={i} className="stat-card-lg" style={{ borderTop: `3px solid ${card.color}` }}>
            <span className="stat-card-value">{card.value}</span>
            <span className="stat-card-label">{card.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
