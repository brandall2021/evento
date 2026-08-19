import { Controller, Get, Post, Put, Body, Param, Query, Request, ParseIntPipe, UseGuards } from '@nestjs/common'
import { PagosService } from './pagos.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { Roles } from '../common/decorators/roles.decorator'
import { UserRole } from '../users/user.entity'

@Controller('pagos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PagosController {
  constructor(private readonly pagosService: PagosService) {}

  @Post()
  crear(
    @Body() body: { inscripcion_id: number; monto: number; metodo: string; cuota_numero?: number; cuota_total?: number; descuento?: number },
    @Request() req: any,
  ) {
    return this.pagosService.crear(body, req.user.id, req.user.rol)
  }

  @Put(':id/confirmar')
  @Roles(UserRole.ADMIN)
  confirmar(@Param('id', ParseIntPipe) id: number) {
    return this.pagosService.confirmar(id)
  }

  @Get()
  findAll(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.pagosService.findAll(req.user, {
      page: page ? parseInt(page) : undefined,
      pageSize: pageSize ? parseInt(pageSize) : undefined,
    })
  }
}
