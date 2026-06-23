import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import CursosList from './pages/CursosList'
import CursoDetail from './pages/CursoDetail'
import MisInscripciones from './pages/MisInscripciones'
import Dashboard from './pages/Dashboard'
import AdminCursos from './pages/AdminCursos'
import AdminInscripciones from './pages/AdminInscripciones'
import AdminCertificados from './pages/AdminCertificados'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/cursos" element={<ProtectedRoute><CursosList /></ProtectedRoute>} />
            <Route path="/cursos/:id" element={<ProtectedRoute><CursoDetail /></ProtectedRoute>} />
            <Route path="/mis-inscripciones" element={<ProtectedRoute><MisInscripciones /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute roles={['admin']}><Dashboard /></ProtectedRoute>} />
            <Route path="/admin/cursos" element={<ProtectedRoute roles={['admin', 'docente']}><AdminCursos /></ProtectedRoute>} />
            <Route path="/admin/inscripciones" element={<ProtectedRoute roles={['admin']}><AdminInscripciones /></ProtectedRoute>} />
            <Route path="/admin/certificados" element={<ProtectedRoute roles={['admin']}><AdminCertificados /></ProtectedRoute>} />
            <Route path="/" element={<Navigate to="/cursos" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
