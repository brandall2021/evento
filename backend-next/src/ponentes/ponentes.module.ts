import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PerfilPonente } from './perfil-ponente.entity'
import { PonentesService } from './ponentes.service'
import { PonentesController } from './ponentes.controller'

@Module({
  imports: [TypeOrmModule.forFeature([PerfilPonente])],
  controllers: [PonentesController],
  providers: [PonentesService],
  exports: [PonentesService],
})
export class PonentesModule {}
