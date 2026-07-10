import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import { listar, obtener, crear, actualizar, eliminar, cambiarEstado } from '../controllers/cursoController.js'
import { authenticate, authorize } from '../middleware/auth.js'
import { cursoRules, paginationRules } from '../middleware/validate.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const storage = multer.diskStorage({
  destination: path.resolve(__dirname, '../uploads/cursos'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/
    const ext = allowed.test(path.extname(file.originalname).toLowerCase())
    const mime = allowed.test(file.mimetype)
    if (ext && mime) cb(null, true)
    else cb(new Error('Solo se permiten imágenes (jpg, png, webp)'))
  },
})

const router = Router()
router.get('/', authenticate, paginationRules, listar)
router.get('/:id', authenticate, obtener)
router.post('/', authenticate, authorize('admin', 'docente'), upload.single('imagen'), cursoRules, crear)
router.put('/:id', authenticate, authorize('admin', 'docente'), upload.single('imagen'), cursoRules, actualizar)
router.delete('/:id', authenticate, authorize('admin'), eliminar)
router.put('/:id/estado', authenticate, authorize('admin', 'docente'), cambiarEstado)

export default router
