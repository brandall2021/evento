import { Router } from 'express'
import { listar, obtener, crear, actualizar, eliminar, toggleActivo, estadisticas } from '../controllers/usuarioController.js'
import { authenticate, authorize } from '../middleware/auth.js'
import { paginationRules } from '../middleware/validate.js'

const router = Router()
router.get('/estadisticas', authenticate, authorize('admin'), estadisticas)
router.get('/', authenticate, authorize('admin'), paginationRules, listar)
router.get('/:id', authenticate, authorize('admin'), obtener)
router.post('/', authenticate, authorize('admin'), crear)
router.put('/:id', authenticate, authorize('admin'), actualizar)
router.delete('/:id', authenticate, authorize('admin'), eliminar)
router.put('/:id/toggle', authenticate, authorize('admin'), toggleActivo)

export default router
