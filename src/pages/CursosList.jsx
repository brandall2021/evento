import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'

const modalidadColors = {
  virtual: '#4f8cff',
  presencial: '#ff6b6b',
  hibrido: '#c9a84c',
}

export default function CursosList() {
  const [cursos, setCursos] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.cursos.listar()
      .then(setCursos)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = cursos.filter(c =>
    c.nombre.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="loading">Cargando cursos...</div>

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Cursos disponibles</h1>
        <input
          type="text"
          className="search-input"
          placeholder="Buscar cursos..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      <div className="cursos-grid">
        {filtered.map(curso => (
          <Link to={`/cursos/${curso.id}`} key={curso.id} className="curso-card">
            <div className="curso-card-header">
              <span className="curso-modalidad" style={{ background: modalidadColors[curso.modalidad] }}>
                {curso.modalidad}
              </span>
              <span className="curso-precio">${Number(curso.precio).toLocaleString()}</span>
            </div>
            <h2 className="curso-card-title">{curso.nombre}</h2>
            <p className="curso-card-desc">{curso.descripcion?.slice(0, 120)}...</p>
            <div className="curso-card-footer">
              <span>🗓 {curso.fecha_inicio}</span>
              <span>⏱ {curso.duracion_horas}h</span>
              <span>👥 {curso.cupos} cupos</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
