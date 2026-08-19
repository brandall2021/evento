import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DiaAgenda } from './dia.entity'
import { Sala } from './sala.entity'
import { Bloque } from './bloque.entity'
import { Sesion } from './sesion.entity'
import { AgendaService } from './agenda.service'
import { AgendaController, DiaController, BloqueController, SalaController, SesionController } from './agenda.controller'

@Module({
  imports: [TypeOrmModule.forFeature([DiaAgenda, Sala, Bloque, Sesion])],
  controllers: [AgendaController, DiaController, BloqueController, SalaController, SesionController],
  providers: [AgendaService],
  exports: [AgendaService],
})
export class AgendaModule {}
