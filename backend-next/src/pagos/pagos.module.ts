import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Pago } from './pago.entity'
import { Inscripcion } from '../inscripciones/inscripcion.entity'
import { Curso } from '../cursos/curso.entity'
import { PagosService } from './pagos.service'
import { PagosController } from './pagos.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Pago, Inscripcion, Curso])],
  controllers: [PagosController],
  providers: [PagosService],
  exports: [PagosService],
})
export class PagosModule {}
