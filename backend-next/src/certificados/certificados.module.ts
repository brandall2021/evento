import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Certificado } from './certificado.entity.js'
import { Inscripcion } from '../inscripciones/inscripcion.entity.js'
import { Asistencia } from '../asistencias/asistencia.entity.js'
import { PlantillaCertificado } from '../plantillas/plantilla.entity.js'
import { CertificadosService } from './certificados.service.js'
import { CertificadosController } from './certificados.controller.js'

@Module({
  imports: [TypeOrmModule.forFeature([Certificado, Inscripcion, Asistencia, PlantillaCertificado])],
  controllers: [CertificadosController],
  providers: [CertificadosService],
  exports: [CertificadosService],
})
export class CertificadosModule {}
