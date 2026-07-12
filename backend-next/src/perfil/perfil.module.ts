import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PerfilAsistente } from './perfil.entity.js'
import { PerfilService } from './perfil.service.js'
import { PerfilController } from './perfil.controller.js'

@Module({
  imports: [TypeOrmModule.forFeature([PerfilAsistente])],
  controllers: [PerfilController],
  providers: [PerfilService],
  exports: [PerfilService],
})
export class PerfilModule {}
