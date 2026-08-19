import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common'
import { WebhooksService } from './webhooks.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { Roles } from '../common/decorators/roles.decorator'
import { UserRole } from '../users/user.entity'

@Controller('webhooks')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post()
  crear(@Body() body: { url: string; eventos: string[]; secret?: string }) {
    return this.webhooksService.crear(body)
  }

  @Get()
  listar() {
    return this.webhooksService.listar()
  }

  @Put(':id')
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() body: Partial<{ url: string; eventos: string[]; activo: boolean }>) {
    return this.webhooksService.actualizar(id, body)
  }

  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.webhooksService.eliminar(id)
  }

  @Post('disparar')
  disparar(@Body() body: { evento: string; payload: any }) {
    return this.webhooksService.dispararEvento(body.evento, body.payload)
  }

  @Post(':id/enviar/:eventId')
  enviar(@Param('eventId', ParseIntPipe) eventId: number) {
    return this.webhooksService.enviar(eventId)
  }

  @Get('eventos')
  eventos(@Param('id') id?: string) {
    return this.webhooksService.eventos(id ? parseInt(id) : undefined)
  }
}
