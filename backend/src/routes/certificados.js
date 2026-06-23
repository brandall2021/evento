import { Router } from 'express'
import { emitir, descargar, validar, listar } from '../controllers/certificadoController.js'
import { authenticate, authorize } from '../middleware/auth.js'

const router = Router()
router.get('/', authenticate, listar)
router.post('/emitir', authenticate, authorize('admin'), emitir)
router.get('/:id/descargar', authenticate, descargar)
router.get('/validar/:codigo', validar)

export default router
