import { Inscripcion, Curso, User } from '../models/index.js'

async function verificarCupos(cursoId) {
  const curso = await Curso.findByPk(cursoId, { attributes: ['cupos'] })
  if (!curso) throw Object.assign(new Error('Curso no encontrado'), { status: 404 })
  const count = await Inscripcion.count({
    where: { curso_id: cursoId, estado: ['aceptado', 'en_curso'] },
  })
  return count < curso.cupos
}

export async function solicitar(req, res) {
  try {
    const { curso_id } = req.body
    const curso = await Curso.findByPk(curso_id)
    if (!curso) return res.status(404).json({ error: 'Curso no encontrado' })
    if (curso.estado !== 'publicado') return res.status(400).json({ error: 'Curso no disponible' })

    const existente = await Inscripcion.findOne({
      where: { estudiante_id: req.user.id, curso_id },
    })
    if (existente) return res.status(400).json({ error: 'Ya solicitaste este curso' })

    const hayCupos = await verificarCupos(curso_id)
    if (!hayCupos) return res.status(400).json({ error: 'Cupos agotados' })

    let estado = 'pendiente'
    if (curso.aceptacion_auto && Number(curso.precio) === 0) {
      estado = 'aceptado'
    }

    const insc = await Inscripcion.create({
      estudiante_id: req.user.id,
      curso_id,
      estado,
      fecha_solicitud: new Date(),
      fecha_aceptacion: estado === 'aceptado' ? new Date() : null,
    })

    res.status(201).json(insc)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export async function misInscripciones(req, res) {
  try {
    const insc = await Inscripcion.findAll({
      where: { estudiante_id: req.user.id },
      include: [{ model: Curso, as: 'curso' }],
      order: [['createdAt', 'DESC']],
    })
    res.json(insc)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export async function listar(req, res) {
  try {
    const where = {}
    if (req.query.curso_id) where.curso_id = req.query.curso_id
    if (req.query.estado) where.estado = req.query.estado

    if (req.user.rol === 'docente') {
      const cursos = await Curso.findAll({ where: { docente_id: req.user.id }, attributes: ['id'] })
      where.curso_id = cursos.map(c => c.id)
    }

    if (req.query.page) {
      const page = parseInt(req.query.page)
      const pageSize = parseInt(req.query.pageSize) || 20
      const offset = (page - 1) * pageSize
      const { count, rows } = await Inscripcion.findAndCountAll({
        where,
        include: [
          { model: User, as: 'estudiante', attributes: ['id', 'nombre', 'email', 'telefono'] },
          { model: Curso, as: 'curso' },
        ],
        order: [['createdAt', 'DESC']],
        limit: pageSize,
        offset,
      })
      return res.json({ data: rows, total: count, page, pageSize })
    }

    const insc = await Inscripcion.findAll({
      where,
      include: [
        { model: User, as: 'estudiante', attributes: ['id', 'nombre', 'email', 'telefono'] },
        { model: Curso, as: 'curso' },
      ],
      order: [['createdAt', 'DESC']],
    })
    res.json(insc)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export async function aprobar(req, res) {
  try {
    const insc = await Inscripcion.findByPk(req.params.id, { include: [{ model: Curso, as: 'curso' }] })
    if (!insc) return res.status(404).json({ error: 'Inscripción no encontrada' })
    if (insc.estado !== 'pendiente') return res.status(400).json({ error: 'Inscripción no está pendiente' })

    const hayCupos = await verificarCupos(insc.curso_id)
    if (!hayCupos) return res.status(400).json({ error: 'Cupos agotados' })

    await insc.update({ estado: 'aceptado', fecha_aceptacion: new Date() })
    res.json(insc)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export async function rechazar(req, res) {
  try {
    const insc = await Inscripcion.findByPk(req.params.id)
    if (!insc) return res.status(404).json({ error: 'Inscripción no encontrada' })
    await insc.update({
      estado: 'rechazado',
      fecha_rechazo: new Date(),
      motivo_rechazo: req.body.motivo || '',
    })
    res.json(insc)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
