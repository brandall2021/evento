import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Pagina } from './pagina.entity.js'
import { BlogPost } from './blog-post.entity.js'
import { Galeria } from './galeria.entity.js'
import { FAQ } from './faq.entity.js'

@Injectable()
export class CmsService {
  constructor(
    @InjectRepository(Pagina)
    private readonly paginaRepo: Repository<Pagina>,
    @InjectRepository(BlogPost)
    private readonly blogRepo: Repository<BlogPost>,
    @InjectRepository(Galeria)
    private readonly galeriaRepo: Repository<Galeria>,
    @InjectRepository(FAQ)
    private readonly faqRepo: Repository<FAQ>,
  ) {}

  // --- Paginas ---
  async crearPagina(data: {
    slug: string; titulo: string; contenido?: string; tipo?: string;
    meta_title?: string; meta_description?: string; publica?: boolean; orden?: number
  }) {
    const pagina = this.paginaRepo.create({ ...data, tipo: data.tipo as any })
    return this.paginaRepo.save(pagina)
  }

  async paginas() {
    return this.paginaRepo.find({ order: { orden: 'ASC', createdAt: 'DESC' } })
  }

  async paginaBySlug(slug: string) {
    const p = await this.paginaRepo.findOne({ where: { slug, publica: true } })
    if (!p) throw new NotFoundException('Página no encontrada')
    return p
  }

  async actualizarPagina(id: number, data: Partial<Pagina>) {
    const p = await this.paginaRepo.findOneBy({ id })
    if (!p) throw new NotFoundException('Página no encontrada')
    Object.assign(p, data)
    return this.paginaRepo.save(p)
  }

  async eliminarPagina(id: number) {
    const p = await this.paginaRepo.findOneBy({ id })
    if (!p) throw new NotFoundException('Página no encontrada')
    await this.paginaRepo.remove(p)
    return { mensaje: 'Página eliminada' }
  }

  // --- Blog ---
  async crearPost(data: {
    titulo: string; slug: string; resumen?: string; contenido: string;
    imagen_portada?: string; autor_id?: number; meta_title?: string; meta_description?: string
  }) {
    const post = this.blogRepo.create(data)
    return this.blogRepo.save(post)
  }

  async posts(publicados?: boolean) {
    const where: any = {}
    if (publicados !== undefined) where.publicado = publicados
    return this.blogRepo.find({ where, relations: ['autor'], order: { createdAt: 'DESC' } })
  }

  async postBySlug(slug: string) {
    const post = await this.blogRepo.findOne({ where: { slug, publicado: true }, relations: ['autor'] })
    if (!post) throw new NotFoundException('Post no encontrado')
    post.vistas += 1
    await this.blogRepo.save(post)
    return post
  }

  async actualizarPost(id: number, data: Partial<BlogPost>) {
    const post = await this.blogRepo.findOneBy({ id })
    if (!post) throw new NotFoundException('Post no encontrado')
    Object.assign(post, data)
    return this.blogRepo.save(post)
  }

  async eliminarPost(id: number) {
    const post = await this.blogRepo.findOneBy({ id })
    if (!post) throw new NotFoundException('Post no encontrado')
    await this.blogRepo.remove(post)
    return { mensaje: 'Post eliminado' }
  }

  // --- Galeria ---
  async agregarMedia(data: {
    curso_id?: number; titulo: string; descripcion?: string;
    url: string; thumbnail_url?: string; tipo?: string; orden?: number
  }) {
    const media = this.galeriaRepo.create({ ...data, tipo: data.tipo as any })
    return this.galeriaRepo.save(media)
  }

  async galeriaByCurso(cursoId: number) {
    return this.galeriaRepo.find({
      where: { curso_id: cursoId },
      order: { orden: 'ASC', createdAt: 'DESC' },
    })
  }

  async eliminarMedia(id: number) {
    const m = await this.galeriaRepo.findOneBy({ id })
    if (!m) throw new NotFoundException('Media no encontrada')
    await this.galeriaRepo.remove(m)
    return { mensaje: 'Media eliminada' }
  }

  // --- FAQs ---
  async crearFAQ(data: { curso_id?: number; pregunta: string; respuesta: string; orden?: number }) {
    const faq = this.faqRepo.create(data)
    return this.faqRepo.save(faq)
  }

  async faqsByCurso(cursoId: number) {
    return this.faqRepo.find({
      where: { curso_id: cursoId, activo: true },
      order: { orden: 'ASC' },
    })
  }

  async actualizarFAQ(id: number, data: Partial<FAQ>) {
    const faq = await this.faqRepo.findOneBy({ id })
    if (!faq) throw new NotFoundException('FAQ no encontrada')
    Object.assign(faq, data)
    return this.faqRepo.save(faq)
  }

  async eliminarFAQ(id: number) {
    const faq = await this.faqRepo.findOneBy({ id })
    if (!faq) throw new NotFoundException('FAQ no encontrada')
    await this.faqRepo.remove(faq)
    return { mensaje: 'FAQ eliminada' }
  }
}
