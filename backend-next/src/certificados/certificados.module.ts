import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Certificado } from './certificado.entity'
import { Inscripcion } from '../inscripciones/inscripcion.entity'
import { Asistencia } from '../asistencias/asistencia.entity'
import { PlantillaCertificado } from '../plantillas/plantilla.entity'
import { CertificadosService } from './certificados.service'
import { CertificadosController } from './certificados.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Certificado, Inscripcion, Asistencia, PlantillaCertificado])],
  controllers: [CertificadosController],
  providers: [CertificadosService],
  exports: [CertificadosService],
})
export class CertificadosModule {}
