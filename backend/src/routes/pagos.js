import { Router } from 'express'
import { crear, confirmar, listar } from '../controllers/pagoController.js'
import { authenticate, authorize } from '../middleware/auth.js'

const router = Router()
router.post('/', authenticate, crear)
router.get('/', authenticate, listar)
router.put('/:id/confirmar', authenticate, authorize('admin'), confirmar)

export default router
