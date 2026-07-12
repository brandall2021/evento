import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Expositor } from './expositor.entity.js'
import { ProductoExpositor } from './producto.entity.js'
import { ExpositoresService } from './expositores.service.js'
import { ExpositoresController, ExpositorController } from './expositores.controller.js'

@Module({
  imports: [TypeOrmModule.forFeature([Expositor, ProductoExpositor])],
  controllers: [ExpositoresController, ExpositorController],
  providers: [ExpositoresService],
  exports: [ExpositoresService],
})
export class ExpositoresModule {}
