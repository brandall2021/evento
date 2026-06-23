import { Pago, Inscripcion } from '../models/index.js'

export async function crear(req, res) {
  try {
    const { inscripcion_id, monto, metodo, cuota_numero, cuota_total, descuento } = req.body
    const insc = await Inscripcion.findByPk(inscripcion_id)
    if (!insc) return res.status(404).json({ error: 'Inscripción no encontrada' })
    if (insc.estudiante_id !== req.user.id && req.user.rol !== 'admin') {
      return res.status(403).json({ error: 'No autorizado' })
    }
    const pago = await Pago.create({
      inscripcion_id, monto, metodo,
      cuota_numero: cuota_numero || 1,
      cuota_total: cuota_total || 1,
      descuento: descuento || 0,
    })
    res.status(201).json(pago)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export async function confirmar(req, res) {
  try {
    const pago = await Pago.findByPk(req.params.id, {
      include: [{ model: Inscripcion, as: 'inscripcion' }],
    })
    if (!pago) return res.status(404).json({ error: 'Pago no encontrado' })
    await pago.update({ estado: 'pagado', fecha_pago: new Date() })

    const insc = pago.inscripcion
    const curso = await insc.getCurso()
    if (curso.aceptacion_auto && insc.estado === 'pendiente') {
      const totalPagado = await Pago.sum('monto', {
        where: { inscripcion_id: insc.id, estado: 'pagado' },
      })
      if (Number(totalPagado) >= Number(curso.precio)) {
        await insc.update({ estado: 'aceptado', fecha_aceptacion: new Date() })
      }
    }
    res.json(pago)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export async function listar(req, res) {
  try {
    const where = {}
    if (req.user.rol === 'estudiante') {
      const inscr = await Inscripcion.findAll({
        where: { estudiante_id: req.user.id },
        attributes: ['id'],
      })
      where.inscripcion_id = inscr.map(i => i.id)
    }
    const pagos = await Pago.findAll({
      where,
      include: [{ model: Inscripcion, as: 'inscripcion', include: ['curso'] }],
      order: [['createdAt', 'DESC']],
    })
    res.json(pagos)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
