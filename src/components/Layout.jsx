import { useState, useEffect } from 'react'
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export default function Layout() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const navLinkClass = ({ isActive }) =>
    isActive ? 'app-nav-link app-nav-link-active' : 'app-nav-link'

  const navItems = user
    ? [
        ...(user.rol === 'admin' ? [{ to: '/admin', label: 'Panel' }] : []),
        ...(user.rol === 'admin' || user.rol === 'docente'
          ? [{ to: '/admin/cursos', label: 'Cursos' }]
          : []),
        ...(user.rol === 'admin' ? [{ to: '/admin/certificados', label: 'Certificados' }] : []),
        ...(user.rol === 'admin' ? [{ to: '/admin/plantillas', label: 'Plantillas' }] : []),
        { to: '/cursos', label: 'Explorar' },
        { to: '/mis-inscripciones', label: 'Mis Inscripciones' },
      ]
    : []

  return (
    <div className="app-layout">
      <a href="#main-content" className="skip-link">Saltar al contenido</a>
      <header className="app-header">
        <div className="app-header-inner">
          <Link to="/" className="app-logo">Nexus<span> Summit</span></Link>

          <nav className="app-nav" aria-label="Navegación principal">
            {navItems.map(item => (
              <NavLink key={item.to} to={item.to} className={navLinkClass}>
                {item.label}
              </NavLink>
            ))}
            <button onClick={toggleTheme} className="theme-toggle" aria-label="Cambiar tema">
              {theme === 'dark' ? '\u2600\uFE0F' : '\uD83C\uDF19'}
            </button>
            {user ? (
              <>
                <span className="nav-user">{user.nombre}</span>
                <button onClick={handleLogout} className="btn-logout">Salir</button>
              </>
            ) : (
              <>
                <Link to="/login" className="app-nav-link">Ingresar</Link>
                <Link to="/register" className="btn-register">Registrarse</Link>
              </>
            )}
          </nav>

          <button
            className="menu-toggle"
            onClick={() => setMenuOpen(prev => !prev)}
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </header>

      {menuOpen && (
        <nav id="mobile-menu" className="mobile-menu" aria-label="Navegación móvil">
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} className={navLinkClass} onClick={() => setMenuOpen(false)}>
              {item.label}
            </NavLink>
          ))}
          <div className="mobile-menu-actions">
            {user ? (
              <>
                <span className="nav-user">{user.nombre}</span>
                <button
                  onClick={handleLogout}
                  className="btn-logout"
                >
                  Salir
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-outline">Ingresar</Link>
                <Link to="/register" className="btn-primary">Registrarse</Link>
              </>
            )}
          </div>
        </nav>
      )}

      <main id="main-content" className="app-main" tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  )
}