import { Router } from 'express'
import { listar, obtener, crear, actualizar, eliminar } from '../controllers/cursoController.js'
import { authenticate, authorize } from '../middleware/auth.js'

const router = Router()
router.get('/', authenticate, listar)
router.get('/:id', authenticate, obtener)
router.post('/', authenticate, authorize('admin', 'docente'), crear)
router.put('/:id', authenticate, authorize('admin', 'docente'), actualizar)
router.delete('/:id', authenticate, authorize('admin'), eliminar)

export default router
