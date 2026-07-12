import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Reunion } from './reunion.entity.js'
import { ParticipanteReunion } from './participante.entity.js'
import { ReunionesService } from './reuniones.service.js'
import { ReunionesController } from './reuniones.controller.js'

@Module({
  imports: [TypeOrmModule.forFeature([Reunion, ParticipanteReunion])],
  controllers: [ReunionesController],
  providers: [ReunionesService],
  exports: [ReunionesService],
})
export class ReunionesModule {}
