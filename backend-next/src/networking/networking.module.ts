import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { MatchNetworking } from './match.entity'
import { PerfilAsistente } from '../perfil/perfil.entity'
import { NetworkingService } from './networking.service'
import { NetworkingController } from './networking.controller'

@Module({
  imports: [TypeOrmModule.forFeature([MatchNetworking, PerfilAsistente])],
  controllers: [NetworkingController],
  providers: [NetworkingService],
  exports: [NetworkingService],
})
export class NetworkingModule {}
