import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Expositor } from './expositor.entity.js'
import { ProductoExpositor } from './producto.entity.js'

@Injectable()
export class ExpositoresService {
  constructor(
    @InjectRepository(Expositor)
    private readonly expositorRepo: Repository<Expositor>,
    @InjectRepository(ProductoExpositor)
    private readonly productoRepo: Repository<ProductoExpositor>,
  ) {}

  async crear(data: {
    user_id: number
    curso_id: number
    nombre_empresa: string
    descripcion?: string
    logo_url?: string
    stand_numero?: string
    stand_ubicacion?: string
  }) {
    const expositor = this.expositorRepo.create(data)
    return this.expositorRepo.save(expositor)
  }

  async findByCurso(cursoId: number) {
    return this.expositorRepo.find({
      where: { curso_id: cursoId },
      relations: ['user'],
      order: { nombre_empresa: 'ASC' },
    })
  }

  async findById(id: number) {
    const expositor = await this.expositorRepo.findOne({
      where: { id },
      relations: ['user'],
    })
    if (!expositor) throw new NotFoundException('Expositor no encontrado')
    return expositor
  }

  async actualizar(id: number, data: Partial<Expositor>) {
    const expositor = await this.findById(id)
    Object.assign(expositor, data)
    return this.expositorRepo.save(expositor)
  }

  async eliminar(id: number) {
    const expositor = await this.findById(id)
    await this.expositorRepo.remove(expositor)
    return { mensaje: 'Expositor eliminado' }
  }

  // --- Productos ---
  async crearProducto(expositorId: number, data: {
    nombre: string
    descripcion?: string
    imagen_url?: string
    precio?: number
    url_externa?: string
  }) {
    const expositor = await this.findById(expositorId)
    const producto = this.productoRepo.create({ expositor_id: expositorId, ...data })
    return this.productoRepo.save(producto)
  }

  async productosByExpositor(expositorId: number) {
    return this.productoRepo.find({
      where: { expositor_id: expositorId },
      order: { nombre: 'ASC' },
    })
  }

  async actualizarProducto(id: number, data: Partial<ProductoExpositor>) {
    const producto = await this.productoRepo.findOneBy({ id })
    if (!producto) throw new NotFoundException('Producto no encontrado')
    Object.assign(producto, data)
    return this.productoRepo.save(producto)
  }

  async eliminarProducto(id: number) {
    const producto = await this.productoRepo.findOneBy({ id })
    if (!producto) throw new NotFoundException('Producto no encontrado')
    await this.productoRepo.remove(producto)
    return { mensaje: 'Producto eliminado' }
  }
}
