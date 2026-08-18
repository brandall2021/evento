import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Role } from './entities/role.entity.js'
import { RolePermission } from './entities/role-permission.entity.js'
import { RolesService } from './roles.service.js'
import { RolesController } from './roles.controller.js'
import { PermissionsModule } from '../permissions/permissions.module.js'

@Module({
  imports: [TypeOrmModule.forFeature([Role, RolePermission]), PermissionsModule],
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService],
})
export class RolesModule {}
