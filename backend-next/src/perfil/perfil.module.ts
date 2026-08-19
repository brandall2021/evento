import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PerfilAsistente } from './perfil.entity'
import { PerfilService } from './perfil.service'
import { PerfilController } from './perfil.controller'

@Module({
  imports: [TypeOrmModule.forFeature([PerfilAsistente])],
  controllers: [PerfilController],
  providers: [PerfilService],
  exports: [PerfilService],
})
export class PerfilModule {}
