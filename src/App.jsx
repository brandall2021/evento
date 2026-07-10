import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import { ThemeProvider } from './context/ThemeContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'
import './App.css'

const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Landing = lazy(() => import('./pages/Landing'))
const CursosList = lazy(() => import('./pages/CursosList'))
const CursoDetail = lazy(() => import('./pages/CursoDetail'))
const MisInscripciones = lazy(() => import('./pages/MisInscripciones'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const AdminCursos = lazy(() => import('./pages/AdminCursos'))
const AdminInscripciones = lazy(() => import('./pages/AdminInscripciones'))
const AdminCertificados = lazy(() => import('./pages/AdminCertificados'))
const AdminPlantillas = lazy(() => import('./pages/AdminPlantillas'))
const AdminUsuarios = lazy(() => import('./pages/AdminUsuarios'))

function Loading() {
  return <div className="loading">Cargando...</div>
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <ErrorBoundary>
              <Suspense fallback={<Loading />}>
                <Routes>
                  <Route element={<Layout />}>
                    <Route path="/" element={<Landing />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/cursos" element={<ProtectedRoute><CursosList /></ProtectedRoute>} />
                    <Route path="/cursos/:id" element={<ProtectedRoute><CursoDetail /></ProtectedRoute>} />
                    <Route path="/mis-inscripciones" element={<ProtectedRoute><MisInscripciones /></ProtectedRoute>} />
                    <Route path="/admin" element={<ProtectedRoute roles={['admin']}><Dashboard /></ProtectedRoute>} />
                    <Route path="/admin/cursos" element={<ProtectedRoute roles={['admin', 'docente']}><AdminCursos /></ProtectedRoute>} />
                    <Route path="/admin/inscripciones" element={<ProtectedRoute roles={['admin']}><AdminInscripciones /></ProtectedRoute>} />
                    <Route path="/admin/certificados" element={<ProtectedRoute roles={['admin']}><AdminCertificados /></ProtectedRoute>} />
                    <Route path="/admin/plantillas" element={<ProtectedRoute roles={['admin']}><AdminPlantillas /></ProtectedRoute>} />
                  </Route>
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
