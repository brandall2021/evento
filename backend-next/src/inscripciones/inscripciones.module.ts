import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Inscripcion } from './inscripcion.entity'
import { Curso } from '../cursos/curso.entity'
import { User } from '../users/user.entity'
import { InscripcionesService } from './inscripciones.service'
import { InscripcionesController } from './inscripciones.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Inscripcion, Curso, User])],
  controllers: [InscripcionesController],
  providers: [InscripcionesService],
  exports: [InscripcionesService],
})
export class InscripcionesModule {}
