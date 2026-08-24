import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Acreditacion } from './checkin.entity'
import { Inscripcion } from '../inscripciones/inscripcion.entity'
import { Sesion } from '../agenda/sesion.entity'
import { Sala } from '../agenda/sala.entity'
import { AcreditacionService } from './checkin.service'
import { CheckinController } from './checkin.controller'
import { AcreditacionController } from './acreditacion.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Acreditacion, Inscripcion, Sesion, Sala])],
  controllers: [AcreditacionController, CheckinController],
  providers: [AcreditacionService],
  exports: [AcreditacionService],
})
export class AcreditacionModule {}

export { AcreditacionModule as CheckinModule }
