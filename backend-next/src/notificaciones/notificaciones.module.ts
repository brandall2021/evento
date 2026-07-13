import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Notificacion } from './notificacion.entity.js'
import { PlantillaNotificacion } from './plantilla-notificacion.entity.js'
import { NotificacionesService } from './notificaciones.service.js'
import { NotificacionesController } from './notificaciones.controller.js'

@Module({
  imports: [TypeOrmModule.forFeature([Notificacion, PlantillaNotificacion])],
  controllers: [NotificacionesController],
  providers: [NotificacionesService],
  exports: [NotificacionesService],
})
export class NotificacionesModule {}
