import { Router } from 'express'
import { listar, obtener, crear, actualizar, eliminar } from '../controllers/cursoController.js'
import { authenticate, authorize } from '../middleware/auth.js'
import { cursoRules, paginationRules } from '../middleware/validate.js'

const router = Router()
router.get('/', authenticate, paginationRules, listar)
router.get('/:id', authenticate, obtener)
router.post('/', authenticate, authorize('admin', 'docente'), cursoRules, crear)
router.put('/:id', authenticate, authorize('admin', 'docente'), cursoRules, actualizar)
router.delete('/:id', authenticate, authorize('admin'), eliminar)

export default router
