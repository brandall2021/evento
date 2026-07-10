import { Router } from 'express'
import { emitir, descargar, validar, listar } from '../controllers/certificadoController.js'
import { authenticate, authenticateQuery, authorize } from '../middleware/auth.js'
import { certificadoRules, paginationRules } from '../middleware/validate.js'

const router = Router()
router.get('/', authenticate, paginationRules, listar)
router.post('/emitir', authenticate, authorize('admin'), certificadoRules, emitir)
router.get('/:id/descargar', authenticateQuery, descargar)
router.get('/validar/:codigo', validar)

export default router
