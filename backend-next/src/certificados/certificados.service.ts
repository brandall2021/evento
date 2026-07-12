import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Certificado } from './certificado.entity.js'
import { Inscripcion, EstadoInscripcion } from '../inscripciones/inscripcion.entity.js'
import { Asistencia } from '../asistencias/asistencia.entity.js'
import { PlantillaCertificado } from '../plantillas/plantilla.entity.js'
import { User, UserRole } from '../users/user.entity.js'
import * as QRCode from 'qrcode'
import PDFDocument from 'pdfkit'

@Injectable()
export class CertificadosService {
  constructor(
    @InjectRepository(Certificado)
    private readonly certRepo: Repository<Certificado>,
    @InjectRepository(Inscripcion)
    private readonly inscRepo: Repository<Inscripcion>,
    @InjectRepository(Asistencia)
    private readonly asistenciaRepo: Repository<Asistencia>,
    @InjectRepository(PlantillaCertificado)
    private readonly plantillaRepo: Repository<PlantillaCertificado>,
  ) {}

  private generarCodigo(inscripcionId: number): string {
    const year = new Date().getFullYear()
    const pad = String(inscripcionId).padStart(6, '0')
    return `${year}-${pad}`
  }

  async emitir(inscripcionId: number, nota?: number) {
    const insc = await this.inscRepo.findOne({
      where: { id: inscripcionId },
      relations: ['curso', 'estudiante'],
    })
    if (!insc) throw new NotFoundException('Inscripción no encontrada')
    if (insc.estado !== EstadoInscripcion.FINALIZADO) {
      throw new BadRequestException('Curso no finalizado')
    }

    const existing = await this.certRepo.findOne({ where: { inscripcion_id: inscripcionId } })
    if (existing) throw new BadRequestException('Certificado ya emitido')

    const total = await this.asistenciaRepo.count({ where: { inscripcion_id: inscripcionId } })
    const presentes = await this.asistenciaRepo.count({ where: { inscripcion_id: inscripcionId, presente: true } })
    const pct = total > 0 ? (presentes / total) * 100 : 0
    if (pct < 80) throw new BadRequestException('Asistencia menor al 80%')

    const codigo = this.generarCodigo(inscripcionId)
    const apiUrl = process.env.API_URL || 'http://localhost:3001'
    const qrData = `${apiUrl}/api/certificados/validar/${codigo}`
    const qrPath = `uploads/qr-${codigo}.png`
    await QRCode.toFile(qrPath, qrData)

    const cert = this.certRepo.create({
      inscripcion_id: inscripcionId,
      codigo,
      horas: insc.curso.duracion_horas,
      nota: nota || null,
      qr_url: `/${qrPath}`,
      fecha_emision: new Date(),
    })

    await this.certRepo.save(cert)

    insc.estado = EstadoInscripcion.FINALIZADO
    await this.inscRepo.save(insc)

    return cert
  }

  async descargar(id: number): Promise<{ stream: NodeJS.ReadableStream; filename: string }> {
    const cert = await this.certRepo.findOne({
      where: { id },
      relations: ['inscripcion', 'inscripcion.curso', 'inscripcion.estudiante'],
    })
    if (!cert) throw new NotFoundException('Certificado no encontrado')

    const plantilla = await this.plantillaRepo.findOne({ where: { is_default: true } })
    const config = (plantilla?.config || {}) as Record<string, any>

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

    const pageW = doc.page.width
    const pageH = doc.page.height

    doc.rect(0, 0, pageW, pageH).fill(bgColor)
    doc.rect(30, 30, pageW - 60, pageH - 60).lineWidth(borderWidth).stroke(borderColor)

    if (plantilla?.logo_url) {
      try { doc.image(`.${plantilla.logo_url}`, logoX, logoY, { width: logoW, height: logoH }) } catch {}
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
      } catch {}
    }

    if (cert.qr_url) {
      try {
        let qx: number, qy: number
        if (qrCorner === 'bottom-left') { qx = 60; qy = pageH - 60 - qrSize }
        else if (qrCorner === 'top-right') { qx = pageW - 60 - qrSize; qy = 60 }
        else if (qrCorner === 'top-left') { qx = 60; qy = 60 }
        else { qx = qrX || pageW - 150; qy = qrY || pageH - 150 }
        doc.image(`.${cert.qr_url}`, qx, qy, { width: qrSize, height: qrSize })
      } catch {}
    }

    const apiUrl = process.env.API_URL || 'http://localhost:3001'
    const validY = validacionY || pageH - 70
    doc.fontSize(8).fillColor('#999').font('Helvetica')
      .text(`Validar en: ${apiUrl}/api/certificados/validar/${cert.codigo}`, 60, validY, { align: 'center' })

    doc.end()

    return { stream: doc as any, filename: `certificado-${cert.codigo}.pdf` }
  }

  async validar(codigo: string) {
    const cert = await this.certRepo.findOne({
      where: { codigo, valido: true },
      relations: ['inscripcion', 'inscripcion.curso', 'inscripcion.estudiante'],
    })
    if (!cert) throw new NotFoundException('Certificado no válido')

    return {
      valido: true,
      codigo: cert.codigo,
      estudiante: cert.inscripcion.estudiante.nombre,
      curso: cert.inscripcion.curso.nombre,
      horas: cert.horas,
      fecha_emision: cert.fecha_emision,
    }
  }

  async findAll(user: any, filters?: { page?: number; pageSize?: number }) {
    const where: any = {}

    if (user.rol === UserRole.ESTUDIANTE) {
      const inscr = await this.inscRepo.find({ where: { estudiante_id: user.id }, select: ['id'] })
      where.inscripcion_id = inscr.map(i => i.id)
    }

    if (filters?.page) {
      const page = filters.page
      const pageSize = filters.pageSize || 20
      const [data, total] = await this.certRepo.findAndCount({
        where,
        relations: ['inscripcion', 'inscripcion.curso', 'inscripcion.estudiante'],
        order: { createdAt: 'DESC' },
        take: pageSize,
        skip: (page - 1) * pageSize,
      })
      return { data, total, page, pageSize }
    }

    return this.certRepo.find({
      where,
      relations: ['inscripcion', 'inscripcion.curso', 'inscripcion.estudiante'],
      order: { createdAt: 'DESC' },
    })
  }
}
