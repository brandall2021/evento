import { Injectable, ConflictException, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Tenant } from './entities/tenant.entity'
import { CreateTenantDto } from './dto/create-tenant.dto'
import { UpdateTenantDto } from './dto/update-tenant.dto'

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepo: Repository<Tenant>,
  ) {}

  async create(dto: CreateTenantDto): Promise<Tenant> {
    const exists = await this.tenantRepo.findOne({ where: { slug: dto.slug } })
    if (exists) {
      throw new ConflictException(`Tenant with slug "${dto.slug}" already exists`)
    }
    const tenant = this.tenantRepo.create(dto)
    return this.tenantRepo.save(tenant)
  }

  async findAll(): Promise<Tenant[]> {
    return this.tenantRepo.find()
  }

  async findOne(id: string): Promise<Tenant> {
    const tenant = await this.tenantRepo.findOne({ where: { id } })
    if (!tenant) {
      throw new NotFoundException(`Tenant ${id} not found`)
    }
    return tenant
  }

  async findBySlug(slug: string): Promise<Tenant> {
    const tenant = await this.tenantRepo.findOne({ where: { slug } })
    if (!tenant) {
      throw new NotFoundException(`Tenant with slug "${slug}" not found`)
    }
    return tenant
  }

  async update(id: string, dto: UpdateTenantDto): Promise<Tenant> {
    const tenant = await this.findOne(id)
    if (dto.slug && dto.slug !== tenant.slug) {
      const exists = await this.tenantRepo.findOne({ where: { slug: dto.slug } })
      if (exists && exists.id !== id) {
        throw new ConflictException(`Tenant with slug "${dto.slug}" already exists`)
      }
    }
    Object.assign(tenant, dto)
    return this.tenantRepo.save(tenant)
  }

  async remove(id: string): Promise<{ message: string }> {
    await this.findOne(id)
    await this.tenantRepo.softDelete(id)
    return { message: 'Tenant deleted' }
  }
}
