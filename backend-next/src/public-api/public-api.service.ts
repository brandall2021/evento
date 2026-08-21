import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Curso, EstadoCurso } from '../cursos/curso.entity'
import { Inscripcion, EstadoInscripcion } from '../inscripciones/inscripcion.entity'
import { BlogPost } from '../cms/blog-post.entity'
import { FAQ } from '../cms/faq.entity'
import { Galeria } from '../cms/galeria.entity'
import { PerfilPonente } from '../ponentes/perfil-ponente.entity'
import { PlantillaCertificado } from '../plantillas/plantilla.entity'
import { CacheService } from '../cache/cache.service'
import { FormsService } from '../forms/forms.service'

@Injectable()
export class PublicApiService {
  constructor(
    @InjectRepository(Curso) private cursoRepo: Repository<Curso>,
    @InjectRepository(BlogPost) private blogRepo: Repository<BlogPost>,
    @InjectRepository(FAQ) private faqRepo: Repository<FAQ>,
    @InjectRepository(Galeria) private galeriaRepo: Repository<Galeria>,
    @InjectRepository(PerfilPonente) private ponenteRepo: Repository<PerfilPonente>,
    @InjectRepository(PlantillaCertificado) private plantillaRepo: Repository<PlantillaCertificado>,
    @InjectRepository(Inscripcion) private inscripcionRepo: Repository<Inscripcion>,
    private readonly cache: CacheService,
    private readonly formsService: FormsService,
  ) {}

  private async attachAvailability<T extends Curso>(curso: T) {
    const acceptedCount = await this.inscripcionRepo.count({
      where: { curso_id: curso.id, estado: EstadoInscripcion.ACEPTADO },
    })
    const availableSpots = Math.max(0, Number(curso.cupos || 0) - acceptedCount)
    return {
      ...curso,
      available_spots: availableSpots,
      is_full: availableSpots <= 0,
    }
  }

  async cursos(page = 1, limit = 12) {
    const key = `pub:cursos:${page}:${limit}`
    const cached = await this.cache.get<any>(key)
    if (cached) return cached
    const [items, total] = await this.cursoRepo.findAndCount({
      where: { estado: EstadoCurso.PUBLICADO },
      order: { fecha_inicio: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    })
    const enriched = await Promise.all(items.map((curso) => this.attachAvailability(curso)))
    const result = { items: enriched, total, page, pageSize: limit, totalPages: Math.ceil(total / limit) }
    await this.cache.set(key, result, 600)
    return result
  }

  async cursoById(id: number) {
    const key = `pub:curso:${id}`
    const cached = await this.cache.get<any>(key)
    if (cached) return cached
    const curso = await this.cursoRepo.findOne({ where: { id } })
    if (!curso) return curso
    const result = await this.attachAvailability(curso)
    await this.cache.set(key, result, 600)
    return result
  }

  async blogPosts(page = 1, limit = 10) {
    const key = `pub:blog:${page}:${limit}`
    const cached = await this.cache.get<any>(key)
    if (cached) return cached
    const [items, total] = await this.blogRepo.findAndCount({
      where: { publicado: true },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    })
    const result = { items, total, page, pageSize: limit, totalPages: Math.ceil(total / limit) }
    await this.cache.set(key, result, 600)
    return result
  }

  async blogPostBySlug(slug: string) {
    const key = `pub:blog:slug:${slug}`
    const cached = await this.cache.get<any>(key)
    if (cached) return cached
    const post = await this.blogRepo.findOne({ where: { slug } })
    if (post) await this.cache.set(key, post, 600)
    return post
  }

  async faqsByCurso(cursoId: number) {
    return this.faqRepo.find({ where: { curso_id: cursoId }, order: { orden: 'ASC' } })
  }

  async faqsGlobales() {
    return this.faqRepo.createQueryBuilder('faq')
      .where('faq.curso_id IS NULL')
      .orderBy('faq.orden', 'ASC')
      .getMany()
  }

  async galeriaByCurso(cursoId: number) {
    return this.galeriaRepo.find({ where: { curso_id: cursoId }, order: { orden: 'ASC' } })
  }

  async ponentes() {
    const cached = await this.cache.get<any>('pub:ponentes')
    if (cached) return cached
    const result = await this.ponenteRepo.find({ order: { createdAt: 'DESC' } })
    await this.cache.set('pub:ponentes', result, 600)
    return result
  }

  async ponenteById(id: number) {
    return this.ponenteRepo.findOne({ where: { id } })
  }

  async validarCodigo(codigo: string) {
    const plantilla = await this.plantillaRepo.createQueryBuilder('p')
      .where('p.codigo = :codigo', { codigo })
      .getOne()
    return {
      valido: !!plantilla,
      mensaje: plantilla ? 'Certificado válido' : 'Certificado no encontrado',
    }
  }

  async plantillaDefault() {
    return this.plantillaRepo.findOne({ where: { is_default: true } as any })
  }

  async formBySlug(slug: string) {
    return this.formsService.publishedBySlug(slug)
  }

  async submitForm(slug: string, payload: Record<string, unknown>, userId?: string | null) {
    return this.formsService.submitBySlug(slug, payload, userId)
  }
}
