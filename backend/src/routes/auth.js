import { Router } from 'express'
import { register, login, me, updateProfile } from '../controllers/authController.js'
import { authenticate } from '../middleware/auth.js'
import { registerRules, loginRules } from '../middleware/validate.js'

const router = Router()
router.post('/register', registerRules, register)
router.post('/login', loginRules, login)
router.get('/me', authenticate, me)
router.put('/profile', authenticate, updateProfile)

export default router
