import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Organizacion, OrganizacionMiembro } from './organizacion.entity.js'
import { OrganizacionesService } from './organizaciones.service.js'
import { OrganizacionesController } from './organizaciones.controller.js'

@Module({
  imports: [TypeOrmModule.forFeature([Organizacion, OrganizacionMiembro])],
  controllers: [OrganizacionesController],
  providers: [OrganizacionesService],
  exports: [OrganizacionesService],
})
export class OrganizacionesModule {}
