import { sequelize, User, Curso } from '../models/index.js'

async function seed() {
  try {
    await sequelize.sync({ force: true })

    await User.create({
      nombre: 'Admin',
      email: 'admin@evento.com',
      password: 'admin123',
      rol: 'admin',
    })

    const docente1 = await User.create({
      nombre: 'Carlos García',
      email: 'carlos@evento.com',
      password: 'docente123',
      rol: 'docente',
    })

    const docente2 = await User.create({
      nombre: 'María López',
      email: 'maria@evento.com',
      password: 'docente123',
      rol: 'docente',
    })

    await User.create({
      nombre: 'Juan Pérez',
      email: 'juan@test.com',
      password: '123456',
      rol: 'estudiante',
    })

    await User.create({
      nombre: 'Ana Rodríguez',
      email: 'ana@test.com',
      password: '123456',
      rol: 'estudiante',
    })

    const cursosData = [
      {
        nombre: 'Introducción a Redes',
        descripcion: 'Aprendé los fundamentos de redes informáticas: protocolos, topologías, direccionamiento IP y configuración básica de equipos de red. Ideal para quienes quieren iniciarse en el mundo de las telecomunicaciones.',
        categoria: 'Tecnología',
        docente_id: docente1.id,
        fecha_inicio: '2026-08-01',
        fecha_fin: '2026-10-15',
        duracion_horas: 40,
        modalidad: 'virtual',
        cupos: 50,
        precio: 20000,
        requisitos: 'Conocimientos básicos de informática',
        aceptacion_auto: true,
        estado: 'publicado',
      },
      {
        nombre: 'Desarrollo Web Full Stack',
        descripcion: 'Dominá HTML, CSS, JavaScript, React, Node.js y bases de datos. Un programa completo para convertirte en desarrollador web de punta a punta.',
        categoria: 'Programación',
        docente_id: docente2.id,
        fecha_inicio: '2026-09-01',
        fecha_fin: '2026-12-20',
        duracion_horas: 120,
        modalidad: 'hibrido',
        cupos: 30,
        precio: 50000,
        requisitos: 'Lógica de programación básica',
        aceptacion_auto: false,
        estado: 'publicado',
      },
      {
        nombre: 'Python para Data Science',
        descripcion: 'Introducción al análisis de datos con Python, pandas, numpy, matplotlib y fundamentos de machine learning.',
        categoria: 'Datos',
        docente_id: docente1.id,
        fecha_inicio: '2026-07-15',
        fecha_fin: '2026-09-30',
        duracion_horas: 60,
        modalidad: 'virtual',
        cupos: 40,
        precio: 35000,
        requisitos: 'Conocimientos básicos de programación',
        aceptacion_auto: true,
        estado: 'publicado',
      },
      {
        nombre: 'Diseño UX/UI Avanzado',
        descripcion: 'Metodologías de investigación, arquitectura de la información, prototipado avanzado y design systems.',
        categoria: 'Diseño',
        docente_id: docente2.id,
        fecha_inicio: '2026-08-15',
        fecha_fin: '2026-11-15',
        duracion_horas: 80,
        modalidad: 'presencial',
        cupos: 20,
        precio: 45000,
        requisitos: 'Conocimientos básicos de diseño',
        aceptacion_auto: false,
        estado: 'publicado',
      },
      {
        nombre: 'Ciberseguridad Esencial',
        descripcion: 'Fundamentos de seguridad informática: análisis de vulnerabilidades, criptografía, seguridad en redes y ethical hacking.',
        categoria: 'Tecnología',
        docente_id: docente1.id,
        fecha_inicio: '2026-10-01',
        fecha_fin: '2026-12-15',
        duracion_horas: 50,
        modalidad: 'virtual',
        cupos: 35,
        precio: 28000,
        requisitos: 'Conocimientos de redes',
        aceptacion_auto: false,
        estado: 'publicado',
      },
    ]

    await Curso.bulkCreate(cursosData)
    console.log('Seed completed!')
    console.log('Admin: admin@evento.com / admin123')
    console.log('Docente: carlos@evento.com / docente123')
    console.log('Estudiante: juan@test.com / 123456')
    process.exit(0)
  } catch (err) {
    console.error('Seed error:', err)
    process.exit(1)
  }
}

seed()
