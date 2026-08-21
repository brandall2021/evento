import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { InscripcionesService } from './inscripciones.service'
import { Inscripcion, EstadoInscripcion } from './inscripcion.entity'
import { Curso, EstadoCurso } from '../cursos/curso.entity'
import { User } from '../users/user.entity'

describe('InscripcionesService', () => {
  let service: InscripcionesService

  const mockInscRepo = () => ({
    findOne: jest.fn(),
    find: jest.fn(),
    findAndCount: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  })

  const mockCursoRepo = () => ({
    findOneBy: jest.fn(),
  })

  const mockUserRepo = () => ({
    findOneBy: jest.fn(),
  })

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InscripcionesService,
        { provide: getRepositoryToken(Inscripcion), useFactory: mockInscRepo },
        { provide: getRepositoryToken(Curso), useFactory: mockCursoRepo },
        { provide: getRepositoryToken(User), useFactory: mockUserRepo },
      ],
    }).compile()

    service = module.get<InscripcionesService>(InscripcionesService)
  })

  it('creates a waitlist inscription when the course is full', async () => {
    const inscRepo = service['inscRepo'] as any
    const cursoRepo = service['cursoRepo'] as any

    cursoRepo.findOneBy.mockResolvedValue({
      id: 7,
      cupos: 2,
      estado: EstadoCurso.PUBLICADO,
      aceptacion_auto: false,
      precio: 100,
    })
    inscRepo.findOne.mockResolvedValue(null)
    inscRepo.count.mockResolvedValue(2)
    inscRepo.create.mockImplementation((value: any) => value)
    inscRepo.save.mockImplementation(async (value: any) => value)

    const result = await service.solicitar(7, 99)

    expect(result.estado).toBe(EstadoInscripcion.EN_ESPERA)
  })
})
