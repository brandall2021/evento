import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PerfilPonente } from './perfil-ponente.entity.js'
import { PonentesService } from './ponentes.service.js'
import { PonentesController } from './ponentes.controller.js'

@Module({
  imports: [TypeOrmModule.forFeature([PerfilPonente])],
  controllers: [PonentesController],
  providers: [PonentesService],
  exports: [PonentesService],
})
export class PonentesModule {}
