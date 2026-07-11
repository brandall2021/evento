import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common'
import { UsersService } from './users.service.js'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js'
import { RolesGuard } from '../common/guards/roles.guard.js'
import { Roles } from '../common/decorators/roles.decorator.js'
import { UserRole } from './user.entity.js'

@Controller('usuarios')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  findAll(
    @Query('rol') rol?: string,
    @Query('activo') activo?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.usersService.findAll({
      rol,
      activo,
      page: page ? parseInt(page) : undefined,
      pageSize: pageSize ? parseInt(pageSize) : undefined,
    })
  }

  @Get('estadisticas')
  @Roles(UserRole.ADMIN)
  estadisticas() {
    return this.usersService.estadisticas()
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findById(id)
  }

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() body: { nombre: string; email: string; password: string; rol?: UserRole; telefono?: string }) {
    return this.usersService.create(body)
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.usersService.update(id, body)
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id)
  }

  @Put(':id/toggle')
  @Roles(UserRole.ADMIN)
  toggleActivo(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.toggleActivo(id)
  }
}
