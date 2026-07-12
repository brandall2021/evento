import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PlantillaCertificado } from './plantilla.entity.js'
import { PlantillasService } from './plantillas.service.js'
import { PlantillasController } from './plantillas.controller.js'

@Module({
  imports: [TypeOrmModule.forFeature([PlantillaCertificado])],
  controllers: [PlantillasController],
  providers: [PlantillasService],
  exports: [PlantillasService],
})
export class PlantillasModule {}
