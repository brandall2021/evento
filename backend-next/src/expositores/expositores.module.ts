import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Expositor } from './expositor.entity'
import { ProductoExpositor } from './producto.entity'
import { ExpositoresService } from './expositores.service'
import { ExpositoresController, ExpositorController } from './expositores.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Expositor, ProductoExpositor])],
  controllers: [ExpositoresController, ExpositorController],
  providers: [ExpositoresService],
  exports: [ExpositoresService],
})
export class ExpositoresModule {}
