import { Router } from 'express'
import {
  solicitar, misInscripciones, listar, aprobar, rechazar,
} from '../controllers/inscripcionController.js'
import { authenticate, authorize } from '../middleware/auth.js'
import { inscripcionRules, paginationRules } from '../middleware/validate.js'

const router = Router()
router.post('/', authenticate, inscripcionRules, solicitar)
router.get('/mis', authenticate, misInscripciones)
router.get('/', authenticate, authorize('admin', 'docente'), paginationRules, listar)
router.put('/:id/aprobar', authenticate, authorize('admin'), aprobar)
router.put('/:id/rechazar', authenticate, authorize('admin'), rechazar)

export default router
