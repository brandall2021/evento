import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Asistencia } from './asistencia.entity'
import { AsistenciasService } from './asistencias.service'
import { AsistenciasController } from './asistencias.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Asistencia])],
  controllers: [AsistenciasController],
  providers: [AsistenciasService],
  exports: [AsistenciasService],
})
export class AsistenciasModule {}
