import PDFDocument from 'pdfkit'
import QRCode from 'qrcode'
import { Certificado, Inscripcion, Curso, User, Asistencia } from '../models/index.js'

function generarCodigo(inscripcionId) {
  const year = new Date().getFullYear()
  const pad = String(inscripcionId).padStart(6, '0')
  return `${year}-${pad}`
}

export async function emitir(req, res) {
  try {
    const { inscripcion_id, nota } = req.body
    const insc = await Inscripcion.findByPk(inscripcion_id, {
      include: [
        { model: Curso, as: 'curso' },
        { model: User, as: 'estudiante' },
        { model: Certificado, as: 'certificado' },
      ],
    })
    if (!insc) return res.status(404).json({ error: 'Inscripción no encontrada' })
    if (insc.estado !== 'finalizado') return res.status(400).json({ error: 'Curso no finalizado' })
    if (insc.certificado) return res.status(400).json({ error: 'Certificado ya emitido' })

    const total = await Asistencia.count({ where: { inscripcion_id } })
    const presentes = await Asistencia.count({ where: { inscripcion_id, presente: true } })
    const pct = total > 0 ? (presentes / total) * 100 : 0
    if (pct < 80) return res.status(400).json({ error: 'Asistencia menor al 80%' })

    const codigo = generarCodigo(insc.id)
    const qrData = `${process.env.API_URL || 'http://localhost:3001'}/api/certificados/validar/${codigo}`
    const qrPath = `uploads/qr-${codigo}.png`
    await QRCode.toFile(qrPath, qrData)

    const cert = await Certificado.create({
      inscripcion_id,
      codigo,
      horas: insc.curso.duracion_horas,
      nota: nota || null,
      qr_url: `/${qrPath}`,
      fecha_emision: new Date(),
    })

    await insc.update({ estado: 'finalizado' })
    res.status(201).json(cert)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export async function descargar(req, res) {
  try {
    const cert = await Certificado.findByPk(req.params.id, {
      include: {
        model: Inscripcion,
        as: 'inscripcion',
        include: [
          { model: Curso, as: 'curso' },
          { model: User, as: 'estudiante' },
        ],
      },
    })
    if (!cert) return res.status(404).json({ error: 'Certificado no encontrado' })

    const doc = new PDFDocument({ layout: 'landscape', size: 'A4' })
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename=certificado-${cert.codigo}.pdf`)
    doc.pipe(res)

    const pageW = doc.page.width
    const pageH = doc.page.height

    doc.rect(0, 0, pageW, pageH).fill('#faf8f5')
    doc.rect(30, 30, pageW - 60, pageH - 60).lineWidth(2).stroke('#c9a84c')

    doc.fontSize(14).fillColor('#666').font('Helvetica')
      .text('CERTIFICADO N°', 60, 80, { align: 'center' })
    doc.fontSize(28).fillColor('#c9a84c').font('Helvetica-Bold')
      .text(cert.codigo, 60, 100, { align: 'center' })

    doc.moveDown(2)
    doc.fontSize(12).fillColor('#666').font('Helvetica')
      .text('Se certifica que', { align: 'center' })

    doc.fontSize(32).fillColor('#1a1a1a').font('Helvetica-Bold')
      .text(cert.inscripcion.estudiante.nombre, { align: 'center' })

    doc.moveDown(0.5)
    doc.fontSize(14).fillColor('#666').font('Helvetica')
      .text('ha completado el curso', { align: 'center' })

    doc.fontSize(20).fillColor('#1a1a1a').font('Helvetica-Bold')
      .text(cert.inscripcion.curso.nombre, { align: 'center' })

    doc.moveDown(1)
    doc.fontSize(13).fillColor('#666').font('Helvetica')
      .text(`${cert.horas} horas académicas`, { align: 'center' })

    const fecha = new Date(cert.fecha_emision).toLocaleDateString('es-AR')
    doc.fontSize(12).fillColor('#666')
      .text(`Fecha de emisión: ${fecha}`, { align: 'center' })

    if (cert.nota) {
      doc.text(`Nota: ${cert.nota}`, { align: 'center' })
    }

    if (cert.qr_url) {
      try {
        doc.image(`.${cert.qr_url}`, pageW - 150, pageH - 150, { width: 80, height: 80 })
      } catch { }
    }

    doc.fontSize(8).fillColor('#999').font('Helvetica')
      .text(`Validar en: ${process.env.API_URL || 'http://localhost:3001'}/api/certificados/validar/${cert.codigo}`,
        60, pageH - 70, { align: 'center' })

    doc.end()
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export async function validar(req, res) {
  try {
    const cert = await Certificado.findOne({
      where: { codigo: req.params.codigo, valido: true },
      include: {
        model: Inscripcion,
        as: 'inscripcion',
        include: [
          { model: Curso, as: 'curso' },
          { model: User, as: 'estudiante' },
        ],
      },
    })
    if (!cert) return res.status(404).json({ error: 'Certificado no válido', valido: false })
    res.json({
      valido: true,
      codigo: cert.codigo,
      estudiante: cert.inscripcion.estudiante.nombre,
      curso: cert.inscripcion.curso.nombre,
      horas: cert.horas,
      fecha_emision: cert.fecha_emision,
    })
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
    const certs = await Certificado.findAll({
      where,
      include: {
        model: Inscripcion,
        as: 'inscripcion',
        include: [
          { model: Curso, as: 'curso' },
          { model: User, as: 'estudiante' },
        ],
      },
      order: [['createdAt', 'DESC']],
    })
    res.json(certs)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
