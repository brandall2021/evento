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

  const sidebarLinkClass = ({ isActive }) =>
    isActive ? 'sidebar-link sidebar-link-active' : 'sidebar-link'

  return (
    <div className="app-layout">
      <a href="#main-content" className="skip-link">Saltar al contenido</a>

      {user ? (
        <div className="app-shell">
          <aside id="mobile-menu" className={`sidebar${menuOpen ? ' sidebar-open' : ''}`}>
            <div className="sidebar-header">
              <Link to="/" className="app-logo">Nexus<span> Summit</span></Link>
              <button
                className="menu-close"
                onClick={() => setMenuOpen(false)}
                aria-label="Cerrar menú"
              >
                ✕
              </button>
            </div>

            <nav className="sidebar-nav" aria-label="Navegación principal">
              <span className="sidebar-group">General</span>
              <NavLink to="/cursos" className={sidebarLinkClass}>Explorar cursos</NavLink>
              <NavLink to="/mis-inscripciones" className={sidebarLinkClass}>Mis inscripciones</NavLink>
              <NavLink to="/perfil" className={sidebarLinkClass}>Mi perfil</NavLink>
              {user.rol === 'docente' && (
                <NavLink to="/admin/cursos" className={sidebarLinkClass}>Mis cursos</NavLink>
              )}
              {user.rol === 'admin' && (
                <>
                  <span className="sidebar-group">Administración</span>
                  <NavLink to="/admin" end className={sidebarLinkClass}>Panel</NavLink>
                  <NavLink to="/admin/cursos" className={sidebarLinkClass}>Cursos</NavLink>
                  <NavLink to="/admin/inscripciones" className={sidebarLinkClass}>Inscripciones</NavLink>
                  <NavLink to="/admin/pagos" className={sidebarLinkClass}>Pagos</NavLink>
                  <NavLink to="/admin/certificados" className={sidebarLinkClass}>Certificados</NavLink>
                  <NavLink to="/admin/plantillas" className={sidebarLinkClass}>Plantillas</NavLink>
                  <NavLink to="/admin/usuarios" className={sidebarLinkClass}>Usuarios</NavLink>
                </>
              )}
            </nav>

            <div className="sidebar-footer">
              <button onClick={toggleTheme} className="theme-toggle" aria-label="Cambiar tema">
                {theme === 'dark' ? '\u2600\uFE0F' : '\uD83C\uDF19'}
              </button>
              <span className="nav-user">{user.nombre}</span>
              <button onClick={handleLogout} className="btn-logout">Salir</button>
            </div>
          </aside>

          {menuOpen && <div className="sidebar-overlay" onClick={() => setMenuOpen(false)} />}

          <div className="sidebar-main">
            <header className="app-header app-header-mobile">
              <button
                className="menu-toggle"
                onClick={() => setMenuOpen(true)}
                aria-label="Abrir menú"
                aria-expanded={menuOpen}
                aria-controls="mobile-menu"
              >
                ☰
              </button>
              <Link to="/" className="app-logo">Nexus<span> Summit</span></Link>
              <button onClick={toggleTheme} className="theme-toggle" aria-label="Cambiar tema">
                {theme === 'dark' ? '\u2600\uFE0F' : '\uD83C\uDF19'}
              </button>
            </header>
            <main id="main-content" className="app-main" tabIndex={-1}>
              <Outlet />
            </main>
          </div>
        </div>
      ) : (
        <>
          <header className="app-header">
            <div className="app-header-inner">
              <Link to="/" className="app-logo">Nexus<span> Summit</span></Link>
              <nav className="app-nav" aria-label="Navegación principal">
                <button onClick={toggleTheme} className="theme-toggle" aria-label="Cambiar tema">
                  {theme === 'dark' ? '\u2600\uFE0F' : '\uD83C\uDF19'}
                </button>
                <Link to="/login" className="app-nav-link">Ingresar</Link>
                <Link to="/register" className="btn-register">Registrarse</Link>
              </nav>
            </div>
          </header>
          <main id="main-content" className="app-main" tabIndex={-1}>
            <Outlet />
          </main>
        </>
      )}
    </div>
  )
}