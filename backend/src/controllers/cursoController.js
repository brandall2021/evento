import { Curso, User } from '../models/index.js'

export async function listar(req, res) {
  try {
    const where = { estado: 'publicado' }
    if (req.user?.rol === 'admin') delete where.estado
    if (req.user?.rol === 'docente') {
      delete where.estado
      where.docente_id = req.user.id
    }
    const cursos = await Curso.findAll({
      where,
      include: [{ model: User, as: 'docente', attributes: ['id', 'nombre', 'email'] }],
      order: [['createdAt', 'DESC']],
    })
    res.json(cursos)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export async function obtener(req, res) {
  try {
    const curso = await Curso.findByPk(req.params.id, {
      include: [{ model: User, as: 'docente', attributes: ['id', 'nombre', 'email'] }],
    })
    if (!curso) return res.status(404).json({ error: 'Curso no encontrado' })
    res.json(curso)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export async function crear(req, res) {
  try {
    const curso = await Curso.create({ ...req.body, docente_id: req.user.id })
    res.status(201).json(curso)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export async function actualizar(req, res) {
  try {
    const curso = await Curso.findByPk(req.params.id)
    if (!curso) return res.status(404).json({ error: 'Curso no encontrado' })
    if (req.user.rol !== 'admin' && curso.docente_id !== req.user.id) {
      return res.status(403).json({ error: 'No autorizado' })
    }
    await curso.update(req.body)
    res.json(curso)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export async function eliminar(req, res) {
  try {
    const curso = await Curso.findByPk(req.params.id)
    if (!curso) return res.status(404).json({ error: 'Curso no encontrado' })
    await curso.destroy()
    res.json({ mensaje: 'Curso eliminado' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
