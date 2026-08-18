import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
  Req,
} from '@nestjs/common'
import { RolesService } from './roles.service.js'
import { CreateRoleDto } from './dto/create-role.dto.js'
import { UpdateRoleDto } from './dto/update-role.dto.js'
import { AssignPermissionsDto } from './dto/assign-permissions.dto.js'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js'
import { RolesGuard } from '../common/guards/roles.guard.js'
import { Roles } from '../common/decorators/roles.decorator.js'
import { UserRole } from '../users/user.entity.js'

export interface RequestWithUser {
  user: { tenantId: string }
}

@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  findAll(@Req() req: RequestWithUser) {
    return this.rolesService.findAll(req.user.tenantId)
  }

  @Get(':id')
  findOne(@Req() req: RequestWithUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.rolesService.findOne(req.user.tenantId, id)
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  create(@Req() req: RequestWithUser, @Body() dto: CreateRoleDto) {
    return this.rolesService.create(req.user.tenantId, dto)
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  update(
    @Req() req: RequestWithUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRoleDto,
  ) {
    return this.rolesService.update(req.user.tenantId, id, dto)
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  remove(@Req() req: RequestWithUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.rolesService.remove(req.user.tenantId, id)
  }

  @Post(':id/permissions')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  assignPermissions(
    @Req() req: RequestWithUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignPermissionsDto,
  ) {
    return this.rolesService.assignPermissions(req.user.tenantId, id, dto.permissionIds)
  }
}
