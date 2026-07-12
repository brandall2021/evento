import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Credencial } from './credencial.entity.js'
import { Inscripcion, EstadoInscripcion } from '../inscripciones/inscripcion.entity.js'
import * as QRCode from 'qrcode'
import PDFDocument from 'pdfkit'

@Injectable()
export class CredencialesService {
  constructor(
    @InjectRepository(Credencial)
    private readonly credRepo: Repository<Credencial>,
    @InjectRepository(Inscripcion)
    private readonly inscRepo: Repository<Inscripcion>,
  ) {}

  private generarCodigo(userId: number, cursoId: number): string {
    const year = new Date().getFullYear()
    const rand = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `CRE-${year}-${userId}-${cursoId}-${rand}`
  }

  async emitir(inscripcionId: number) {
    const insc = await this.inscRepo.findOne({
      where: { id: inscripcionId },
      relations: ['curso', 'estudiante'],
    })
    if (!insc) throw new NotFoundException('Inscripción no encontrada')
    if (insc.estado !== EstadoInscripcion.ACEPTADO && insc.estado !== EstadoInscripcion.FINALIZADO) {
      throw new BadRequestException('Inscripción no activa')
    }

    const existing = await this.credRepo.findOne({ where: { inscripcion_id: inscripcionId } })
    if (existing?.emitida) throw new BadRequestException('Credencial ya emitida')

    const codigo = this.generarCodigo(insc.estudiante_id, insc.curso_id)
    const qrData = JSON.stringify({
      tipo: 'credencial',
      codigo,
      inscripcion_id: insc.id,
      curso_id: insc.curso_id,
    })

    const qrPath = `uploads/credencial-${codigo}.png`
    await QRCode.toFile(qrPath, qrData)

    if (existing) {
      existing.codigo = codigo
      existing.qr_data = qrData
      existing.emitida = true
      existing.fecha_emision = new Date()
      return this.credRepo.save(existing)
    }

    const cred = this.credRepo.create({
      user_id: insc.estudiante_id,
      curso_id: insc.curso_id,
      inscripcion_id: inscripcionId,
      codigo,
      qr_data: qrData,
      pdf_url: `/${qrPath}`,
      emitida: true,
      fecha_emision: new Date(),
    })
    return this.credRepo.save(cred)
  }

  async descargar(id: number): Promise<{ stream: NodeJS.ReadableStream; filename: string }> {
    const cred = await this.credRepo.findOne({
      where: { id },
      relations: ['user', 'curso', 'inscripcion'],
    })
    if (!cred) throw new NotFoundException('Credencial no encontrada')
    if (!cred.emitida) throw new BadRequestException('Credencial no emitida')

    const doc = new PDFDocument({ size: 'letter', margin: 40 })
    const pageW = doc.page.width
    const pageH = doc.page.height

    doc.rect(0, 0, pageW, pageH).fill('#ffffff')
    doc.rect(20, 20, pageW - 40, pageH - 40).lineWidth(2).stroke('#1a1a1a')

    doc.fontSize(10).fillColor('#999').font('Helvetica')
      .text('CREDENCIAL DE ASISTENCIA', 40, 40, { align: 'center' })

    doc.fontSize(11).fillColor('#666').font('Helvetica')
      .text('Evento:', 40, 70)
    doc.fontSize(16).fillColor('#1a1a1a').font('Helvetica-Bold')
      .text(cred.curso.nombre, 40, 85, { width: pageW - 80 })

    doc.fontSize(11).fillColor('#666').font('Helvetica')
      .text('Asistente:', 40, 120)
    doc.fontSize(18).fillColor('#1a1a1a').font('Helvetica-Bold')
      .text(cred.user.nombre, 40, 136, { width: pageW - 80 })

    doc.fontSize(11).fillColor('#666').font('Helvetica')
      .text('Código:', 40, 170)
    doc.fontSize(14).fillColor('#c9a84c').font('Helvetica-Bold')
      .text(cred.codigo, 40, 186)

    if (cred.fecha_emision) {
      const fecha = new Date(cred.fecha_emision).toLocaleDateString('es-AR')
      doc.fontSize(10).fillColor('#999').font('Helvetica')
        .text(`Emitida: ${fecha}`, 40, 210)
    }

    if (cred.qr_data) {
      try {
        const qrPath = `uploads/credencial-${cred.codigo}.png`
        doc.image(qrPath, pageW / 2 - 60, pageH - 180, { width: 120, height: 120 })
      } catch {}
    }

    doc.fontSize(8).fillColor('#ccc').font('Helvetica')
      .text(`Validar: ${process.env.API_URL || 'http://localhost:3001'}/api/credenciales/validar/${cred.codigo}`,
        40, pageH - 45, { align: 'center' })

    doc.end()
    return { stream: doc as any, filename: `credencial-${cred.codigo}.pdf` }
  }

  async validar(codigo: string) {
    const cred = await this.credRepo.findOne({
      where: { codigo, emitida: true },
      relations: ['user', 'curso'],
    })
    if (!cred) throw new NotFoundException('Credencial no válida')

    return {
      valido: true,
      codigo: cred.codigo,
      asistente: cred.user.nombre,
      curso: cred.curso.nombre,
      fecha_emision: cred.fecha_emision,
    }
  }

  async misCredenciales(userId: number) {
    return this.credRepo.find({
      where: { user_id: userId },
      relations: ['curso'],
      order: { createdAt: 'DESC' },
    })
  }
}
