import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common'
import { ExportService } from './export.service.js'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js'
import { RolesGuard } from '../common/guards/roles.guard.js'
import { Roles } from '../common/decorators/roles.decorator.js'
import { UserRole } from '../users/user.entity.js'

@Controller('export')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Get('cursos')
  async cursos(@Res() res: any) {
    const csv = await this.exportService.cursosCsv()
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename="cursos.csv"')
    return res.send(csv)
  }

  @Get('inscripciones')
  async inscripciones(@Res() res: any) {
    const csv = await this.exportService.inscripcionesCsv()
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename="inscripciones.csv"')
    return res.send(csv)
  }

  @Get('inscripciones/curso/:id')
  async inscripcionesByCurso(@Param('id') id: string, @Res() res: any) {
    const csv = await this.exportService.inscripcionesCsv(parseInt(id))
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename="inscripciones-curso-${id}.csv"`)
    return res.send(csv)
  }

  @Get('pagos')
  async pagos(@Res() res: any) {
    const csv = await this.exportService.pagosCsv()
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename="pagos.csv"')
    return res.send(csv)
  }

  @Get('asistencias/curso/:id')
  async asistencias(@Param('id') id: string, @Res() res: any) {
    const csv = await this.exportService.asistenciasCsv(parseInt(id))
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename="asistencias-curso-${id}.csv"`)
    return res.send(csv)
  }

  @Get('certificados')
  async certificados(@Res() res: any) {
    const csv = await this.exportService.certificadosCsv()
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename="certificados.csv"')
    return res.send(csv)
  }
}
