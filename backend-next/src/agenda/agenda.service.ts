import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { DiaAgenda } from './dia.entity.js'
import { Sala } from './sala.entity.js'
import { Bloque } from './bloque.entity.js'
import { Sesion } from './sesion.entity.js'

@Injectable()
export class AgendaService {
  constructor(
    @InjectRepository(DiaAgenda)
    private readonly diaRepo: Repository<DiaAgenda>,
    @InjectRepository(Sala)
    private readonly salaRepo: Repository<Sala>,
    @InjectRepository(Bloque)
    private readonly bloqueRepo: Repository<Bloque>,
    @InjectRepository(Sesion)
    private readonly sesionRepo: Repository<Sesion>,
  ) {}

  // --- Dias ---
  async crearDia(cursoId: number, data: { fecha: string; titulo: string; orden?: number }) {
    const dia = this.diaRepo.create({ curso_id: cursoId, ...data })
    return this.diaRepo.save(dia)
  }

  async diasByCurso(cursoId: number) {
    return this.diaRepo.find({ where: { curso_id: cursoId }, order: { orden: 'ASC', fecha: 'ASC' } })
  }

  async actualizarDia(id: number, data: Partial<DiaAgenda>) {
    const dia = await this.diaRepo.findOneBy({ id })
    if (!dia) throw new NotFoundException('Día no encontrado')
    Object.assign(dia, data)
    return this.diaRepo.save(dia)
  }

  async eliminarDia(id: number) {
    const dia = await this.diaRepo.findOneBy({ id })
    if (!dia) throw new NotFoundException('Día no encontrado')
    await this.diaRepo.remove(dia)
    return { mensaje: 'Día eliminado' }
  }

  // --- Salas ---
  async crearSala(cursoId: number, data: { nombre: string; capacidad?: number; ubicacion?: string }) {
    const sala = this.salaRepo.create({ curso_id: cursoId, ...data })
    return this.salaRepo.save(sala)
  }

  async salasByCurso(cursoId: number) {
    return this.salaRepo.find({ where: { curso_id: cursoId }, order: { nombre: 'ASC' } })
  }

  async actualizarSala(id: number, data: Partial<Sala>) {
    const sala = await this.salaRepo.findOneBy({ id })
    if (!sala) throw new NotFoundException('Sala no encontrada')
    Object.assign(sala, data)
    return this.salaRepo.save(sala)
  }

  async eliminarSala(id: number) {
    const sala = await this.salaRepo.findOneBy({ id })
    if (!sala) throw new NotFoundException('Sala no encontrada')
    await this.salaRepo.remove(sala)
    return { mensaje: 'Sala eliminada' }
  }

  // --- Bloques ---
  async crearBloque(diaId: number, data: { titulo: string; hora_inicio: string; hora_fin: string }) {
    const dia = await this.diaRepo.findOneBy({ id: diaId })
    if (!dia) throw new NotFoundException('Día no encontrado')
    const bloque = this.bloqueRepo.create({ dia_id: diaId, ...data })
    return this.bloqueRepo.save(bloque)
  }

  async bloquesByDia(diaId: number) {
    return this.bloqueRepo.find({ where: { dia_id: diaId }, order: { hora_inicio: 'ASC' } })
  }

  async actualizarBloque(id: number, data: Partial<Bloque>) {
    const bloque = await this.bloqueRepo.findOneBy({ id })
    if (!bloque) throw new NotFoundException('Bloque no encontrado')
    Object.assign(bloque, data)
    return this.bloqueRepo.save(bloque)
  }

  async eliminarBloque(id: number) {
    const bloque = await this.bloqueRepo.findOneBy({ id })
    if (!bloque) throw new NotFoundException('Bloque no encontrado')
    await this.bloqueRepo.remove(bloque)
    return { mensaje: 'Bloque eliminado' }
  }

  // --- Sesiones ---
  async crearSesion(bloqueId: number, data: {
    titulo: string
    descripcion?: string
    sala_id?: number
    ponente_id?: number
    tipo?: string
    cupos?: number
  }) {
    const bloque = await this.bloqueRepo.findOneBy({ id: bloqueId })
    if (!bloque) throw new NotFoundException('Bloque no encontrado')
    const sesion = this.sesionRepo.create({ bloque_id: bloqueId, ...data } as any)
    return this.sesionRepo.save(sesion)
  }

  async sesionesByBloque(bloqueId: number) {
    return this.sesionRepo.find({
      where: { bloque_id: bloqueId },
      relations: ['sala', 'ponente'],
      order: { createdAt: 'ASC' },
    })
  }

  async actualizarSesion(id: number, data: Partial<Sesion>) {
    const sesion = await this.sesionRepo.findOneBy({ id })
    if (!sesion) throw new NotFoundException('Sesión no encontrada')
    Object.assign(sesion, data)
    return this.sesionRepo.save(sesion)
  }

  async eliminarSesion(id: number) {
    const sesion = await this.sesionRepo.findOneBy({ id })
    if (!sesion) throw new NotFoundException('Sesión no encontrada')
    await this.sesionRepo.remove(sesion)
    return { mensaje: 'Sesión eliminada' }
  }

  // --- Full agenda ---
  async agendaCompleta(cursoId: number) {
    const dias = await this.diaRepo.find({
      where: { curso_id: cursoId },
      order: { orden: 'ASC', fecha: 'ASC' },
    })

    const resultado: any[] = []
    for (const dia of dias) {
      const bloques = await this.bloqueRepo.find({
        where: { dia_id: dia.id },
        order: { hora_inicio: 'ASC' },
      })

      const bloquesConSesiones: any[] = []
      for (const bloque of bloques) {
        const sesiones = await this.sesionRepo.find({
          where: { bloque_id: bloque.id },
          relations: ['sala', 'ponente'],
        })
        bloquesConSesiones.push({ ...bloque, sesiones })
      }

      resultado.push({ ...dia, bloques: bloquesConSesiones })
    }

    return resultado
  }
}
