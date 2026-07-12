import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Curso } from './curso.entity.js'
import { User } from '../users/user.entity.js'
import { CursosService } from './cursos.service.js'
import { CursosController } from './cursos.controller.js'

@Module({
  imports: [TypeOrmModule.forFeature([Curso, User])],
  controllers: [CursosController],
  providers: [CursosService],
  exports: [CursosService],
})
export class CursosModule {}
