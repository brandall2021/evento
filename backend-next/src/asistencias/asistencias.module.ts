import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Asistencia } from './asistencia.entity.js'
import { AsistenciasService } from './asistencias.service.js'
import { AsistenciasController } from './asistencias.controller.js'

@Module({
  imports: [TypeOrmModule.forFeature([Asistencia])],
  controllers: [AsistenciasController],
  providers: [AsistenciasService],
  exports: [AsistenciasService],
})
export class AsistenciasModule {}
