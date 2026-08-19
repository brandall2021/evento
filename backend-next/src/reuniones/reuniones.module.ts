import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Reunion } from './reunion.entity'
import { ParticipanteReunion } from './participante.entity'
import { ReunionesService } from './reuniones.service'
import { ReunionesController } from './reuniones.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Reunion, ParticipanteReunion])],
  controllers: [ReunionesController],
  providers: [ReunionesService],
  exports: [ReunionesService],
})
export class ReunionesModule {}
