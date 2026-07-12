import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Credencial } from './credencial.entity.js'
import { Inscripcion } from '../inscripciones/inscripcion.entity.js'
import { CredencialesService } from './credenciales.service.js'
import { CredencialesController } from './credenciales.controller.js'

@Module({
  imports: [TypeOrmModule.forFeature([Credencial, Inscripcion])],
  controllers: [CredencialesController],
  providers: [CredencialesService],
  exports: [CredencialesService],
})
export class CredencialesModule {}
