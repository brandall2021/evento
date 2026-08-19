import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Curso } from './curso.entity'
import { User } from '../users/user.entity'
import { CursosService } from './cursos.service'
import { CursosController } from './cursos.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Curso, User])],
  controllers: [CursosController],
  providers: [CursosService],
  exports: [CursosService],
})
export class CursosModule {}
