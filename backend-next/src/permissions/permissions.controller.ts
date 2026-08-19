import { Controller, Get, Param, ParseUUIDPipe, UseGuards, Query } from '@nestjs/common'
import { PermissionsService } from './permissions.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'

@Controller('permissions')
@UseGuards(JwtAuthGuard)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  findAll(@Query('module') module?: string) {
    if (module) return this.permissionsService.findByModule(module)
    return this.permissionsService.findAll()
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const perms = await this.permissionsService.findByIds([id])
    return perms[0] ?? null
  }
}
