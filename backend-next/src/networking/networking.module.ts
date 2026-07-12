import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { MatchNetworking } from './match.entity.js'
import { PerfilAsistente } from '../perfil/perfil.entity.js'
import { NetworkingService } from './networking.service.js'
import { NetworkingController } from './networking.controller.js'

@Module({
  imports: [TypeOrmModule.forFeature([MatchNetworking, PerfilAsistente])],
  controllers: [NetworkingController],
  providers: [NetworkingService],
  exports: [NetworkingService],
})
export class NetworkingModule {}
