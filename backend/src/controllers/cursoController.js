import { Curso, User } from '../models/index.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export async function listar(req, res) {
  try {
    const where = { estado: 'publicado' }
    if (req.user?.rol === 'admin') delete where.estado
    if (req.user?.rol === 'docente') {
      delete where.estado
      where.docente_id = req.user.id
    }

    if (req.query.page) {
      const page = parseInt(req.query.page)
      const pageSize = parseInt(req.query.pageSize) || 20
      const offset = (page - 1) * pageSize
      const { count, rows } = await Curso.findAndCountAll({
        where,
        include: [{ model: User, as: 'docente', attributes: ['id', 'nombre', 'email'] }],
        order: [['createdAt', 'DESC']],
        limit: pageSize,
        offset,
      })
      return res.json({ data: rows, total: count, page, pageSize })
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
    const data = { ...req.body, docente_id: req.user.id }
    if (req.file) data.imagen = req.file.filename
    const curso = await Curso.create(data)
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
    const data = { ...req.body }
    if (req.file) {
      if (curso.imagen) {
        const oldPath = path.resolve(__dirname, '../uploads/cursos', curso.imagen)
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath)
      }
      data.imagen = req.file.filename
    }
    await curso.update(data)
    res.json(curso)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export async function eliminar(req, res) {
  try {
    const curso = await Curso.findByPk(req.params.id)
    if (!curso) return res.status(404).json({ error: 'Curso no encontrado' })
    if (curso.imagen) {
      const imgPath = path.resolve(__dirname, '../uploads/cursos', curso.imagen)
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath)
    }
    await curso.destroy()
    res.json({ mensaje: 'Curso eliminado' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
