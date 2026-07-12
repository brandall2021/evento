import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Inscripcion } from './inscripcion.entity.js'
import { Curso } from '../cursos/curso.entity.js'
import { User } from '../users/user.entity.js'
import { InscripcionesService } from './inscripciones.service.js'
import { InscripcionesController } from './inscripciones.controller.js'

@Module({
  imports: [TypeOrmModule.forFeature([Inscripcion, Curso, User])],
  controllers: [InscripcionesController],
  providers: [InscripcionesService],
  exports: [InscripcionesService],
})
export class InscripcionesModule {}
