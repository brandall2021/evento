import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { sequelize } from './models/index.js'
import authRoutes from './routes/auth.js'
import cursoRoutes from './routes/cursos.js'
import inscripcionRoutes from './routes/inscripciones.js'
import pagoRoutes from './routes/pagos.js'
import certificadoRoutes from './routes/certificados.js'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())
app.use('/uploads', express.static('uploads'))

app.use('/api/auth', authRoutes)
app.use('/api/cursos', cursoRoutes)
app.use('/api/inscripciones', inscripcionRoutes)
app.use('/api/pagos', pagoRoutes)
app.use('/api/certificados', certificadoRoutes)

app.get('/api/health', (req, res) => res.json({ ok: true }))

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
