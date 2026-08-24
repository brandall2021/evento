import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Checkin } from './checkin.entity'
import { Inscripcion } from '../inscripciones/inscripcion.entity'
import { Sesion } from '../agenda/sesion.entity'
import { Sala } from '../agenda/sala.entity'
import { CheckinService } from './checkin.service'
import { CheckinController } from './checkin.controller'
import { AcreditacionController } from './acreditacion.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Checkin, Inscripcion, Sesion, Sala])],
  controllers: [AcreditacionController, CheckinController],
  providers: [CheckinService],
  exports: [CheckinService],
})
export class CheckinModule {}
