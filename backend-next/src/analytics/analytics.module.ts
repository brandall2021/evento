import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from '../users/user.entity.js'
import { Curso } from '../cursos/curso.entity.js'
import { Inscripcion } from '../inscripciones/inscripcion.entity.js'
import { Pago } from '../pagos/pago.entity.js'
import { Asistencia } from '../asistencias/asistencia.entity.js'
import { Certificado } from '../certificados/certificado.entity.js'
import { AnalyticsService } from './analytics.service.js'
import { AnalyticsController } from './analytics.controller.js'

@Module({
  imports: [TypeOrmModule.forFeature([User, Curso, Inscripcion, Pago, Asistencia, Certificado])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
