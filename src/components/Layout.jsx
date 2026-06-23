import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="app-header-inner">
          <Link to="/" className="app-logo">Nexus<span> Summit</span></Link>
          <nav className="app-nav">
            {user ? (
              <>
                {user.rol === 'admin' && <Link to="/admin">Admin</Link>}
                {user.rol === 'admin' || user.rol === 'docente' ? <Link to="/admin/cursos">Cursos</Link> : null}
                <Link to="/cursos">Cursos</Link>
                <Link to="/mis-inscripciones">Mis Inscripciones</Link>
                <span className="nav-user">{user.nombre}</span>
                <button onClick={handleLogout} className="btn-logout">Salir</button>
              </>
            ) : (
              <>
                <Link to="/login">Ingresar</Link>
                <Link to="/register" className="btn-register">Registrarse</Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}
