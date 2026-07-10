import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'

const modalidadColors = {
  virtual: '#4f8cff',
  presencial: '#ff6b6b',
  hibrido: '#c9a84c',
}

function SkeletonGrid() {
  return (
    <div className="cursos-grid">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="curso-card skeleton-card">
          <div className="skeleton-line w-40" />
          <div className="skeleton-line w-80" style={{ height: 20, marginTop: 12 }} />
          <div className="skeleton-line w-100" />
          <div className="skeleton-line w-60" />
          <div className="skeleton-line w-90" style={{ marginTop: 16 }} />
        </div>
      ))}
    </div>
  )
}

export default function CursosList() {
  const [cursos, setCursos] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoria, setCategoria] = useState('')

  useEffect(() => {
    api.cursos.listar()
      .then(setCursos)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const categorias = useMemo(() => {
    const cats = new Set(cursos.map(c => c.categoria).filter(Boolean))
    return ['', ...cats]
  }, [cursos])

  const filtered = cursos.filter(c => {
    const matchNombre = c.nombre.toLowerCase().includes(search.toLowerCase())
    const matchCategoria = !categoria || c.categoria === categoria
    return matchNombre && matchCategoria
  })

  if (loading) return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Cursos disponibles</h1>
      </div>
      <SkeletonGrid />
    </div>
  )

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Cursos disponibles</h1>
        <div style={{ display: 'flex', gap: 12 }}>
          <div className="filter-group">
            <select value={categoria} onChange={e => setCategoria(e.target.value)}>
              <option value="">Todas las categorías</option>
              {categorias.filter(Boolean).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <input
            type="text"
            className="search-input"
            placeholder="Buscar cursos..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>
      {filtered.length === 0 ? (
        <div className="empty-state">No se encontraron cursos</div>
      ) : (
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
                <span>{curso.fecha_inicio}</span>
                <span>{curso.duracion_horas}h</span>
                <span>{curso.cupos} cupos</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
