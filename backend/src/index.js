import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import rateLimit from 'express-rate-limit'
import { sequelize } from './models/index.js'
import { errorHandler } from './middleware/errorHandler.js'
import authRoutes from './routes/auth.js'
import cursoRoutes from './routes/cursos.js'
import inscripcionRoutes from './routes/inscripciones.js'
import pagoRoutes from './routes/pagos.js'
import certificadoRoutes from './routes/certificados.js'
import plantillaRoutes from './routes/plantillas.js'
import usuarioRoutes from './routes/usuarios.js'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()

const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(s => s.trim())
  : ['http://localhost:5173', 'http://localhost:3001']

app.set('trust proxy', 1)
app.use(cors({ origin: corsOrigins, credentials: true }))
app.use(express.json({ limit: '10mb' }))

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
})
app.use(limiter)

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Demasiados intentos, intente más tarde' },
})
app.use('/api/auth/login', authLimiter)
app.use('/api/auth/register', authLimiter)

app.use('/uploads', express.static('uploads'))

app.use('/api/auth', authRoutes)
app.use('/api/cursos', cursoRoutes)
app.use('/api/inscripciones', inscripcionRoutes)
app.use('/api/pagos', pagoRoutes)
app.use('/api/certificados', certificadoRoutes)
app.use('/api/plantillas', plantillaRoutes)
app.use('/api/usuarios', usuarioRoutes)

app.get('/api/health', (req, res) => res.json({ ok: true }))

app.use(errorHandler)

const frontendDist = path.resolve(__dirname, '../../dist')
app.use(express.static(frontendDist, { index: false, maxAge: '1y', etag: true }))
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
    res.setHeader('Pragma', 'no-cache')
    res.setHeader('Expires', '0')
    res.sendFile(path.join(frontendDist, 'index.html'))
  }
})

const PORT = process.env.PORT || 3001

async function start() {
  try {
    await sequelize.authenticate()
    console.log('DB connected')
    await sequelize.sync({ alter: false })
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`)
    })
  } catch (err) {
    console.error('Startup error:', err)
  }
}

start()
