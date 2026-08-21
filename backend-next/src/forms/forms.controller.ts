import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common'
import { FormsService } from './forms.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { Roles } from '../common/decorators/roles.decorator'
import { UserRole } from '../users/user.entity'

@Controller('forms')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FormsController {
  constructor(private readonly formsService: FormsService) {}

  @Get()
  findAll() {
    return this.formsService.findAll()
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.formsService.findOne(id)
  }

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() body: { slug: string; name: string; context?: string | null; draft_schema_json?: Record<string, unknown> }) {
    return this.formsService.create(body)
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id', ParseIntPipe) id: number, @Body() body: { slug?: string; name?: string; context?: string | null; draft_schema_json?: Record<string, unknown> }) {
    return this.formsService.updateDraft(id, body)
  }

  @Post(':id/publish')
  @Roles(UserRole.ADMIN)
  publish(@Param('id', ParseIntPipe) id: number) {
    return this.formsService.publish(id)
  }
}
