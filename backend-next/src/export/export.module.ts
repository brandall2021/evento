import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Curso } from '../cursos/curso.entity.js'
import { Inscripcion } from '../inscripciones/inscripcion.entity.js'
import { Pago } from '../pagos/pago.entity.js'
import { Asistencia } from '../asistencias/asistencia.entity.js'
import { Certificado } from '../certificados/certificado.entity.js'
import { ExportService } from './export.service.js'
import { ExportController } from './export.controller.js'

@Module({
  imports: [TypeOrmModule.forFeature([Curso, Inscripcion, Pago, Asistencia, Certificado])],
  controllers: [ExportController],
  providers: [ExportService],
  exports: [ExportService],
})
export class ExportModule {}
