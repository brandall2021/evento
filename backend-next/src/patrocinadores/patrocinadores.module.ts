import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Patrocinador } from './patrocinador.entity'
import { BeneficioPatrocinio } from './beneficio.entity'
import { PatrocinadoresService } from './patrocinadores.service'
import { PatrocinadoresController, PatrocinadorController } from './patrocinadores.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Patrocinador, BeneficioPatrocinio])],
  controllers: [PatrocinadoresController, PatrocinadorController],
  providers: [PatrocinadoresService],
  exports: [PatrocinadoresService],
})
export class PatrocinadoresModule {}
