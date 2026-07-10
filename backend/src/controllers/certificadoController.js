import PDFDocument from 'pdfkit'
import QRCode from 'qrcode'
import { Certificado, Inscripcion, Curso, User, Asistencia, PlantillaCertificado } from '../models/index.js'

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

    let plantilla = await PlantillaCertificado.findOne({
      where: { is_default: true },
    })

    const config = plantilla?.config || {}
    const bgColor = config.bgColor || '#faf8f5'
    const borderColor = config.borderColor || '#c9a84c'
    const borderWidth = config.borderWidth || 2
    const titleColor = config.titleColor || '#666'
    const codeColor = config.codeColor || '#c9a84c'
    const nameColor = config.nameColor || '#1a1a1a'
    const textColor = config.textColor || '#666'
    const titleFont = config.titleFont || 'Helvetica'
    const nameFont = config.nameFont || 'Helvetica-Bold'

    const logoX = config.logoX ?? 60
    const logoY = config.logoY ?? 50
    const logoW = config.logoW ?? 80
    const logoH = config.logoH ?? 80
    const titleY = config.titleY ?? 80
    const codeY = config.codeY ?? 100
    const certifyTextY = config.certifyTextY ?? 145
    const nameY = config.nameY ?? 175
    const courseTextY = config.courseTextY ?? 225
    const courseNameY = config.courseNameY ?? 255
    const hoursY = config.hoursY ?? 295
    const dateY = config.dateY ?? 320
    const firmaX = config.firmaX ?? 0
    const firmaY = config.firmaY ?? 0
    const firmaW = config.firmaW ?? 120
    const firmaH = config.firmaH ?? 60
    const firmaCentered = config.firmaCentered ?? true
    const qrX = config.qrX ?? 0
    const qrY = config.qrY ?? 0
    const qrSize = config.qrSize ?? 80
    const qrCorner = config.qrCorner ?? 'bottom-right'
    const validacionY = config.validacionY ?? 0

    const doc = new PDFDocument({ layout: 'landscape', size: 'A4' })
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename=certificado-${cert.codigo}.pdf`)
    doc.pipe(res)

    const pageW = doc.page.width
    const pageH = doc.page.height

    doc.rect(0, 0, pageW, pageH).fill(bgColor)
    doc.rect(30, 30, pageW - 60, pageH - 60).lineWidth(borderWidth).stroke(borderColor)

    if (plantilla?.logo_url) {
      try {
        doc.image(`.${plantilla.logo_url}`, logoX, logoY, { width: logoW, height: logoH })
      } catch { }
    }

    doc.fontSize(14).fillColor(titleColor).font(titleFont)
      .text('CERTIFICADO N°', 60, titleY, { align: 'center' })
    doc.fontSize(28).fillColor(codeColor).font('Helvetica-Bold')
      .text(cert.codigo, 60, codeY, { align: 'center' })

    doc.fontSize(12).fillColor(textColor).font(titleFont)
      .text('Se certifica que', 60, certifyTextY, { align: 'center' })

    doc.fontSize(32).fillColor(nameColor).font(nameFont)
      .text(cert.inscripcion.estudiante.nombre, 60, nameY, { align: 'center' })

    doc.fontSize(14).fillColor(textColor).font(titleFont)
      .text('ha completado el curso', 60, courseTextY, { align: 'center' })

    doc.fontSize(20).fillColor(nameColor).font('Helvetica-Bold')
      .text(cert.inscripcion.curso.nombre, 60, courseNameY, { align: 'center' })

    doc.fontSize(13).fillColor(textColor).font(titleFont)
      .text(`${cert.horas} horas académicas`, 60, hoursY, { align: 'center' })

    const fecha = new Date(cert.fecha_emision).toLocaleDateString('es-AR')
    doc.fontSize(12).fillColor(textColor)
      .text(`Fecha de emisión: ${fecha}`, 60, dateY, { align: 'center' })

    if (cert.nota) {
      doc.text(`Nota: ${cert.nota}`, 60, dateY + 18, { align: 'center' })
    }

    if (plantilla?.firma_url) {
      try {
        const fx = firmaCentered ? pageW / 2 - firmaW / 2 : firmaX
        const fy = firmaY || pageH - 140
        doc.image(`.${plantilla.firma_url}`, fx, fy, { width: firmaW, height: firmaH })
      } catch { }
    }

    if (cert.qr_url) {
      try {
        let qx, qy
        if (qrCorner === 'bottom-left') { qx = 60; qy = pageH - 60 - qrSize }
        else if (qrCorner === 'top-right') { qx = pageW - 60 - qrSize; qy = 60 }
        else if (qrCorner === 'top-left') { qx = 60; qy = 60 }
        else { qx = qrX || pageW - 150; qy = qrY || pageH - 150 }
        doc.image(`.${cert.qr_url}`, qx, qy, { width: qrSize, height: qrSize })
      } catch { }
    }

    const validY = validacionY || pageH - 70
    doc.fontSize(8).fillColor('#999').font('Helvetica')
      .text(`Validar en: ${process.env.API_URL || 'http://localhost:3001'}/api/certificados/validar/${cert.codigo}`,
        60, validY, { align: 'center' })

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

    if (req.query.page) {
      const page = parseInt(req.query.page)
      const pageSize = parseInt(req.query.pageSize) || 20
      const offset = (page - 1) * pageSize
      const { count, rows } = await Certificado.findAndCountAll({
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
        limit: pageSize,
        offset,
      })
      return res.json({ data: rows, total: count, page, pageSize })
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
