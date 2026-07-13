import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PuntosHistorial } from './puntos-historial.entity.js'
import { Badge } from './badge.entity.js'
import { UsuarioBadge } from './usuario-badge.entity.js'
import { GamificacionService } from './gamificacion.service.js'
import { GamificacionController } from './gamificacion.controller.js'

@Module({
  imports: [TypeOrmModule.forFeature([PuntosHistorial, Badge, UsuarioBadge])],
  controllers: [GamificacionController],
  providers: [GamificacionService],
  exports: [GamificacionService],
})
export class GamificacionModule {}
