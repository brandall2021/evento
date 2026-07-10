import { User, Inscripcion } from '../models/index.js'
import bcrypt from 'bcryptjs'

export async function listar(req, res) {
  try {
    const where = {}
    if (req.query.rol) where.rol = req.query.rol
    if (req.query.activo !== undefined) where.activo = req.query.activo === 'true'

    if (req.query.page) {
      const page = parseInt(req.query.page)
      const pageSize = parseInt(req.query.pageSize) || 20
      const offset = (page - 1) * pageSize
      const { count, rows } = await User.findAndCountAll({
        where,
        attributes: { exclude: ['password'] },
        order: [['createdAt', 'DESC']],
        limit: pageSize,
        offset,
      })
      return res.json({ data: rows, total: count, page, pageSize })
    }

    const users = await User.findAll({
      where,
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
    })
    res.json(users)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export async function obtener(req, res) {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
    })
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' })
    res.json(user)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export async function crear(req, res) {
  try {
    const { nombre, email, password, rol, telefono } = req.body
    const exists = await User.findOne({ where: { email } })
    if (exists) return res.status(400).json({ error: 'Email ya registrado' })

    const user = await User.create({
      nombre,
      email,
      password,
      rol: rol || 'estudiante',
      telefono: telefono || null,
    })
    res.status(201).json(user)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export async function actualizar(req, res) {
  try {
    const user = await User.findByPk(req.params.id)
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' })

    const { nombre, email, rol, telefono, activo, password } = req.body

    if (email && email !== user.email) {
      const exists = await User.findOne({ where: { email } })
      if (exists) return res.status(400).json({ error: 'Email ya registrado' })
    }

    if (password) {
      user.password = await bcrypt.hash(password, 10)
    }

    await user.update({
      nombre: nombre || user.nombre,
      email: email || user.email,
      rol: rol || user.rol,
      telefono: telefono !== undefined ? telefono : user.telefono,
      activo: activo !== undefined ? activo : user.activo,
    })

    res.json(user)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export async function eliminar(req, res) {
  try {
    const user = await User.findByPk(req.params.id)
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' })

    const inscripciones = await Inscripcion.count({ where: { estudiante_id: user.id } })
    if (inscripciones > 0) {
      return res.status(400).json({ error: 'No se puede eliminar un usuario con inscripciones' })
    }

    await user.destroy()
    res.json({ mensaje: 'Usuario eliminado' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export async function toggleActivo(req, res) {
  try {
    const user = await User.findByPk(req.params.id)
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' })

    if (user.rol === 'admin') {
      const admins = await User.count({ where: { rol: 'admin', activo: true } })
      if (admins <= 1 && user.activo) {
        return res.status(400).json({ error: 'No se puede desactivar el único admin' })
      }
    }

    await user.update({ activo: !user.activo })
    res.json(user)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export async function estadisticas(req, res) {
  try {
    const total = await User.count()
    const porRol = await User.findAll({
      attributes: ['rol', [User.sequelize.fn('COUNT', '*'), 'cantidad']],
      group: ['rol'],
    })
    const activos = await User.count({ where: { activo: true } })
    const inactivos = total - activos

    res.json({
      total,
      activos,
      inactivos,
      porRol: porRol.map(r => ({ rol: r.rol, cantidad: parseInt(r.get('cantidad')) })),
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
