import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import * as bcrypt from 'bcryptjs'
import { User, UserRole } from './user.entity.js'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async findAll(filters?: { rol?: string; activo?: string; page?: number; pageSize?: number }) {
    const where: any = {}
    if (filters?.rol) where.rol = filters.rol
    if (filters?.activo !== undefined) where.activo = filters.activo === 'true'

    if (filters?.page) {
      const page = filters.page
      const pageSize = filters.pageSize || 20
      const offset = (page - 1) * pageSize
      const [data, total] = await this.userRepo.findAndCount({
        where,
        order: { createdAt: 'DESC' },
        take: pageSize,
        skip: offset,
      })
      return { data, total, page, pageSize }
    }

    return this.userRepo.find({ where, order: { createdAt: 'DESC' } })
  }

  async findById(id: number) {
    const user = await this.userRepo.findOneBy({ id })
    if (!user) throw new NotFoundException('Usuario no encontrado')
    return user
  }

  async findByEmail(email: string) {
    return this.userRepo.findOne({ where: { email }, select: ['id', 'nombre', 'email', 'password', 'rol', 'telefono', 'avatar', 'activo', 'createdAt'] })
  }

  async create(data: { nombre: string; email: string; password: string; rol?: UserRole; telefono?: string }) {
    const exists = await this.userRepo.findOneBy({ email: data.email })
    if (exists) throw new ConflictException('Email ya registrado')

    const hashed = await bcrypt.hash(data.password, 10)
    const user = this.userRepo.create({ ...data, password: hashed })
    return this.userRepo.save(user)
  }

  async update(id: number, data: Partial<User> & { password?: string }) {
    const user = await this.findById(id)

    if (data.email && data.email !== user.email) {
      const exists = await this.userRepo.findOneBy({ email: data.email })
      if (exists) throw new ConflictException('Email ya registrado')
    }

    if (data.password) {
      user.password = await bcrypt.hash(data.password, 10)
    }

    Object.assign(user, {
      nombre: data.nombre || user.nombre,
      email: data.email || user.email,
      rol: data.rol || user.rol,
      telefono: data.telefono !== undefined ? data.telefono : user.telefono,
      activo: data.activo !== undefined ? data.activo : user.activo,
    })

    return this.userRepo.save(user)
  }

  async remove(id: number) {
    const user = await this.findById(id)
    await this.userRepo.remove(user)
    return { mensaje: 'Usuario eliminado' }
  }

  async toggleActivo(id: number) {
    const user = await this.findById(id)

    if (user.rol === UserRole.ADMIN) {
      const adminCount = await this.userRepo.count({ where: { rol: UserRole.ADMIN, activo: true } })
      if (adminCount <= 1 && user.activo) {
        throw new BadRequestException('No se puede desactivar el único admin')
      }
    }

    user.activo = !user.activo
    return this.userRepo.save(user)
  }

  async estadisticas() {
    const total = await this.userRepo.count()
    const activos = await this.userRepo.count({ where: { activo: true } })
    const inactivos = total - activos

    const porRol = await this.userRepo
      .createQueryBuilder('user')
      .select('user.rol', 'rol')
      .addSelect('COUNT(*)', 'cantidad')
      .groupBy('user.rol')
      .getRawMany()

    return {
      total,
      activos,
      inactivos,
      porRol: porRol.map(r => ({ rol: r.rol, cantidad: parseInt(r.cantidad) })),
    }
  }
}
