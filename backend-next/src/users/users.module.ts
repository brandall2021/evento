import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from './entities/user.entity'
import { UserTenant } from './entities/user-tenant.entity'
import { UserRole } from './entities/user-role.entity'
import { RefreshToken } from './entities/refresh-token.entity'
import { UsersService } from './users.service'
import { UsersController } from './users.controller'
import { UsuariosAliasController } from './usuarios-alias.controller'

@Module({
  imports: [TypeOrmModule.forFeature([User, UserTenant, UserRole, RefreshToken])],
  controllers: [UsersController, UsuariosAliasController],
  providers: [UsersService],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
