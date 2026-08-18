import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger'
import { UsersService } from './users.service.js'
import { CreateUserDto } from './dto/create-user.dto.js'
import { UpdateUserDto } from './dto/update-user.dto.js'
import { AssignRoleDto } from './dto/assign-role.dto.js'
import { PageDto } from '../common/dto/pagination.dto.js'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js'
import { RolesGuard } from '../common/guards/roles.guard.js'
import { PermissionsGuard } from '../common/guards/permissions.guard.js'
import { Roles } from '../common/decorators/roles.decorator.js'
import { Permissions } from '../common/decorators/permissions.decorator.js'

@ApiTags('Usuarios (alias)')
@ApiBearerAuth()
@Controller('usuarios')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class UsuariosAliasController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('super_admin', 'admin')
  @Permissions('users.list')
  @ApiOperation({ summary: 'Listar usuarios (paginado) — alias de /users' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'tenantId', required: false, type: String })
  @ApiQuery({ name: 'isActive', required: false, type: String })
  findAll(
    @Query() pageDto: PageDto,
    @Query('tenantId') tenantId?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.usersService.findAll(pageDto, { tenantId, isActive })
  }

  @Get(':id')
  @Roles('super_admin', 'admin')
  @Permissions('users.read')
  @ApiOperation({ summary: 'Obtener usuario por ID — alias de /users' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id)
  }

  @Post()
  @Roles('super_admin', 'admin')
  @Permissions('users.create')
  @ApiOperation({ summary: 'Crear usuario — alias de /users' })
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto)
  }

  @Patch(':id')
  @Roles('super_admin', 'admin')
  @Permissions('users.update')
  @ApiOperation({ summary: 'Actualizar usuario — alias de /users' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto)
  }

  @Delete(':id')
  @Roles('super_admin')
  @Permissions('users.delete')
  @ApiOperation({ summary: 'Eliminar usuario — alias de /users' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.remove(id)
  }

  @Post(':id/roles')
  @Roles('super_admin', 'admin')
  @Permissions('users.assign_role')
  @ApiOperation({ summary: 'Asignar rol — alias de /users' })
  assignRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignRoleDto,
  ) {
    return this.usersService.assignRole(id, dto)
  }

  @Delete(':id/roles/:roleId')
  @Roles('super_admin', 'admin')
  @Permissions('users.remove_role')
  @ApiOperation({ summary: 'Revocar rol — alias de /users' })
  removeRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('roleId', ParseUUIDPipe) roleId: string,
    @Query('tenantId', ParseUUIDPipe) tenantId: string,
  ) {
    return this.usersService.removeRole(id, roleId, tenantId)
  }
}
