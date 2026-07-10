import jwt from 'jsonwebtoken'
import { User } from '../models/index.js'

async function resolveUser(token) {
  const decoded = jwt.verify(token, process.env.JWT_SECRET)
  const user = await User.findByPk(decoded.id)
  return user
}

export async function authenticate(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token requerido' })
  }
  try {
    const token = header.split(' ')[1]
    req.user = await resolveUser(token)
    if (!req.user) return res.status(401).json({ error: 'Usuario no encontrado' })
    if (!req.user.activo) return res.status(403).json({ error: 'Usuario desactivado' })
    next()
  } catch {
    return res.status(401).json({ error: 'Token inválido' })
  }
}

export async function authenticateQuery(req, res, next) {
  const token = req.query.token || req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'Token requerido' })
  try {
    req.user = await resolveUser(token)
    if (!req.user) return res.status(401).json({ error: 'Usuario no encontrado' })
    if (!req.user.activo) return res.status(403).json({ error: 'Usuario desactivado' })
    next()
  } catch {
    return res.status(401).json({ error: 'Token inválido' })
  }
}

export function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({ error: 'No autorizado' })
    }
    next()
  }
}
