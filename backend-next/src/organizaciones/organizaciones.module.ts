import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Organizacion, OrganizacionMiembro } from './organizacion.entity'
import { OrganizacionesService } from './organizaciones.service'
import { OrganizacionesController } from './organizaciones.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Organizacion, OrganizacionMiembro])],
  controllers: [OrganizacionesController],
  providers: [OrganizacionesService],
  exports: [OrganizacionesService],
})
export class OrganizacionesModule {}
