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

@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  findAll(@Req() req: any) {
    const tenantId = req.user.tenantId
    return this.rolesService.findAll(tenantId)
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
    const tenantId = req.user.tenantId
    return this.rolesService.findOne(tenantId, id)
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  create(@Req() req: any, @Body() dto: CreateRoleDto) {
    const tenantId = req.user.tenantId
    return this.rolesService.create(tenantId, dto)
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  update(@Req() req: any, @Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateRoleDto) {
    const tenantId = req.user.tenantId
    return this.rolesService.update(tenantId, id, dto)
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  remove(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
    const tenantId = req.user.tenantId
    return this.rolesService.remove(tenantId, id)
  }

  @Post(':id/permissions')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  assignPermissions(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignPermissionsDto,
  ) {
    return this.rolesService.assignPermissions(id, dto.permissionIds)
  }
}
