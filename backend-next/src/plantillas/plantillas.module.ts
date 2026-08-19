import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PlantillaCertificado } from './plantilla.entity'
import { PlantillasService } from './plantillas.service'
import { PlantillasController } from './plantillas.controller'

@Module({
  imports: [TypeOrmModule.forFeature([PlantillaCertificado])],
  controllers: [PlantillasController],
  providers: [PlantillasService],
  exports: [PlantillasService],
})
export class PlantillasModule {}
