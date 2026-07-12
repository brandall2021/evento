import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Pago } from './pago.entity.js'
import { Inscripcion } from '../inscripciones/inscripcion.entity.js'
import { Curso } from '../cursos/curso.entity.js'
import { PagosService } from './pagos.service.js'
import { PagosController } from './pagos.controller.js'

@Module({
  imports: [TypeOrmModule.forFeature([Pago, Inscripcion, Curso])],
  controllers: [PagosController],
  providers: [PagosService],
  exports: [PagosService],
})
export class PagosModule {}
