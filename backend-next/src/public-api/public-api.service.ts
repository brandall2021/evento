import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Curso, EstadoCurso } from '../cursos/curso.entity.js'
import { BlogPost } from '../cms/blog-post.entity.js'
import { FAQ } from '../cms/faq.entity.js'
import { Galeria } from '../cms/galeria.entity.js'
import { PerfilPonente } from '../ponentes/perfil-ponente.entity.js'
import { PlantillaCertificado } from '../plantillas/plantilla.entity.js'

@Injectable()
export class PublicApiService {
  constructor(
    @InjectRepository(Curso) private cursoRepo: Repository<Curso>,
    @InjectRepository(BlogPost) private blogRepo: Repository<BlogPost>,
    @InjectRepository(FAQ) private faqRepo: Repository<FAQ>,
    @InjectRepository(Galeria) private galeriaRepo: Repository<Galeria>,
    @InjectRepository(PerfilPonente) private ponenteRepo: Repository<PerfilPonente>,
    @InjectRepository(PlantillaCertificado) private plantillaRepo: Repository<PlantillaCertificado>,
  ) {}

  async cursos(page = 1, limit = 12) {
    const [items, total] = await this.cursoRepo.findAndCount({
      where: { estado: EstadoCurso.PUBLICADO },
      order: { fecha_inicio: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    })
    return { items, total, page, pageSize: limit, totalPages: Math.ceil(total / limit) }
  }

  async cursoById(id: number) {
    return this.cursoRepo.findOne({ where: { id } })
  }

  async blogPosts(page = 1, limit = 10) {
    const [items, total] = await this.blogRepo.findAndCount({
      where: { publicado: true },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    })
    return { items, total, page, pageSize: limit, totalPages: Math.ceil(total / limit) }
  }

  async blogPostBySlug(slug: string) {
    return this.blogRepo.findOne({ where: { slug } })
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
    return this.ponenteRepo.find({ order: { createdAt: 'DESC' } })
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
}
