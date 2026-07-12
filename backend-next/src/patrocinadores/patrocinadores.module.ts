import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Patrocinador } from './patrocinador.entity.js'
import { BeneficioPatrocinio } from './beneficio.entity.js'
import { PatrocinadoresService } from './patrocinadores.service.js'
import { PatrocinadoresController, PatrocinadorController } from './patrocinadores.controller.js'

@Module({
  imports: [TypeOrmModule.forFeature([Patrocinador, BeneficioPatrocinio])],
  controllers: [PatrocinadoresController, PatrocinadorController],
  providers: [PatrocinadoresService],
  exports: [PatrocinadoresService],
})
export class PatrocinadoresModule {}
