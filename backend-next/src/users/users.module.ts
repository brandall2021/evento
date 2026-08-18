import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from './entities/user.entity.js'
import { UserTenant } from './entities/user-tenant.entity.js'
import { UserRole } from './entities/user-role.entity.js'
import { RefreshToken } from './entities/refresh-token.entity.js'
import { UsersService } from './users.service.js'
import { UsersController } from './users.controller.js'
import { UsuariosAliasController } from './usuarios-alias.controller.js'

@Module({
  imports: [TypeOrmModule.forFeature([User, UserTenant, UserRole, RefreshToken])],
  controllers: [UsersController, UsuariosAliasController],
  providers: [UsersService],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
