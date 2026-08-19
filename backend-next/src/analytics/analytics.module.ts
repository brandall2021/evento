import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from '../users/user.entity'
import { Curso } from '../cursos/curso.entity'
import { Inscripcion } from '../inscripciones/inscripcion.entity'
import { Pago } from '../pagos/pago.entity'
import { Asistencia } from '../asistencias/asistencia.entity'
import { Certificado } from '../certificados/certificado.entity'
import { AnalyticsService } from './analytics.service'
import { AnalyticsController } from './analytics.controller'

@Module({
  imports: [TypeOrmModule.forFeature([User, Curso, Inscripcion, Pago, Asistencia, Certificado])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
