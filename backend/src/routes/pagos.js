import { Router } from 'express'
import { crear, confirmar, listar } from '../controllers/pagoController.js'
import { authenticate, authorize } from '../middleware/auth.js'
import { pagoRules, paginationRules } from '../middleware/validate.js'

const router = Router()
router.post('/', authenticate, pagoRules, crear)
router.get('/', authenticate, paginationRules, listar)
router.put('/:id/confirmar', authenticate, authorize('admin'), confirmar)

export default router
