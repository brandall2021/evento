import { body, query, validationResult } from 'express-validator'

export function handleErrors(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array().map(e => e.msg).join('. ') })
  }
  next()
}

export const registerRules = [
  body('nombre').trim().notEmpty().withMessage('Nombre es requerido'),
  body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Mínimo 6 caracteres'),
  handleErrors,
]

export const loginRules = [
  body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
  body('password').notEmpty().withMessage('Contraseña requerida'),
  handleErrors,
]

export const cursoRules = [
  body('nombre').trim().notEmpty().withMessage('Nombre del curso requerido'),
  body('fecha_inicio').isDate().withMessage('Fecha de inicio inválida'),
  body('fecha_fin').isDate().withMessage('Fecha de fin inválida'),
  body('duracion_horas').isInt({ min: 1 }).withMessage('Duración debe ser mayor a 0'),
  body('cupos').isInt({ min: 1 }).withMessage('Cupos debe ser mayor a 0'),
  body('precio').optional().isFloat({ min: 0 }).withMessage('Precio inválido'),
  body('modalidad').isIn(['presencial', 'virtual', 'hibrido']).withMessage('Modalidad inválida'),
  handleErrors,
]

export const inscripcionRules = [
  body('curso_id').isInt().withMessage('Curso requerido'),
  handleErrors,
]

export const pagoRules = [
  body('inscripcion_id').isInt().withMessage('Inscripción requerida'),
  body('monto').isFloat({ min: 0.01 }).withMessage('Monto inválido'),
  body('metodo').isIn(['mercado_pago', 'transferencia', 'tarjeta', 'paypal']).withMessage('Método inválido'),
  handleErrors,
]

export const certificadoRules = [
  body('inscripcion_id').isInt().withMessage('Inscripción requerida'),
  body('nota').optional().isFloat({ min: 0, max: 10 }).withMessage('Nota debe ser entre 0 y 10'),
  handleErrors,
]

export const paginationRules = [
  query('page').optional().isInt({ min: 1 }).withMessage('Página inválida'),
  query('pageSize').optional().isInt({ min: 1, max: 100 }).withMessage('pageSize inválido'),
  handleErrors,
]
