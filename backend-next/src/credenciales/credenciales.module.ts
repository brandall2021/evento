import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Credencial } from './credencial.entity'
import { Inscripcion } from '../inscripciones/inscripcion.entity'
import { CredencialesService } from './credenciales.service'
import { CredencialesController } from './credenciales.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Credencial, Inscripcion])],
  controllers: [CredencialesController],
  providers: [CredencialesService],
  exports: [CredencialesService],
})
export class CredencialesModule {}
