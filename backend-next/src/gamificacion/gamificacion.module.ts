import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PuntosHistorial } from './puntos-historial.entity'
import { Badge } from './badge.entity'
import { UsuarioBadge } from './usuario-badge.entity'
import { GamificacionService } from './gamificacion.service'
import { GamificacionController } from './gamificacion.controller'

@Module({
  imports: [TypeOrmModule.forFeature([PuntosHistorial, Badge, UsuarioBadge])],
  controllers: [GamificacionController],
  providers: [GamificacionService],
  exports: [GamificacionService],
})
export class GamificacionModule {}
