import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DiaAgenda } from './dia.entity.js'
import { Sala } from './sala.entity.js'
import { Bloque } from './bloque.entity.js'
import { Sesion } from './sesion.entity.js'
import { AgendaService } from './agenda.service.js'
import { AgendaController, DiaController, BloqueController, SalaController, SesionController } from './agenda.controller.js'

@Module({
  imports: [TypeOrmModule.forFeature([DiaAgenda, Sala, Bloque, Sesion])],
  controllers: [AgendaController, DiaController, BloqueController, SalaController, SesionController],
  providers: [AgendaService],
  exports: [AgendaService],
})
export class AgendaModule {}
