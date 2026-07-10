export function errorHandler(err, req, res, _next) {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err)

  if (err.name === 'ValidationError' || err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: err.message })
  }

  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({ error: err.errors.map(e => e.message).join(', ') })
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({ error: 'El registro ya existe' })
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'JSON inválido' })
  }

  res.status(err.status || 500).json({ error: err.message || 'Error interno del servidor' })
}
