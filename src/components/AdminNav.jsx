import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AdminNav() {
  const { user } = useAuth()

  if (!user || user.rol !== 'admin') return null

  const links = [
    { to: '/admin', label: 'Panel', end: true },
    { to: '/admin/cursos', label: 'Cursos' },
    { to: '/admin/inscripciones', label: 'Inscripciones' },
    { to: '/admin/pagos', label: 'Pagos' },
    { to: '/admin/certificados', label: 'Certificados' },
    { to: '/admin/plantillas', label: 'Plantillas' },
    { to: '/admin/usuarios', label: 'Usuarios' },
  ]

  return (
    <nav className="admin-nav" aria-label="Secciones de administración">
      {links.map(link => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.end}
          className={({ isActive }) =>
            isActive ? 'admin-nav-link admin-nav-link-active' : 'admin-nav-link'
          }
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  )
}