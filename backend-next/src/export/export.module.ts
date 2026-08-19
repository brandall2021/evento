import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Curso } from '../cursos/curso.entity'
import { Inscripcion } from '../inscripciones/inscripcion.entity'
import { Pago } from '../pagos/pago.entity'
import { Asistencia } from '../asistencias/asistencia.entity'
import { Certificado } from '../certificados/certificado.entity'
import { ExportService } from './export.service'
import { ExportController } from './export.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Curso, Inscripcion, Pago, Asistencia, Certificado])],
  controllers: [ExportController],
  providers: [ExportService],
  exports: [ExportService],
})
export class ExportModule {}
