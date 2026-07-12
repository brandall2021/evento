import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Checkin } from './checkin.entity.js'
import { Inscripcion } from '../inscripciones/inscripcion.entity.js'
import { Sesion } from '../agenda/sesion.entity.js'
import { Sala } from '../agenda/sala.entity.js'
import { CheckinService } from './checkin.service.js'
import { CheckinController } from './checkin.controller.js'

@Module({
  imports: [TypeOrmModule.forFeature([Checkin, Inscripcion, Sesion, Sala])],
  controllers: [CheckinController],
  providers: [CheckinService],
  exports: [CheckinService],
})
export class CheckinModule {}
