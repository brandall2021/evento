import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UploadedFiles,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FilesInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { extname } from 'path'
import { PlantillasService } from './plantillas.service.js'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js'
import { RolesGuard } from '../common/guards/roles.guard.js'
import { Roles } from '../common/decorators/roles.decorator.js'
import { UserRole } from '../users/user.entity.js'

const imageFilter = (_req: any, file: Express.Multer.File, cb: any) => {
  if (!/\.(jpg|jpeg|png|webp)$/i.test(extname(file.originalname))) {
    cb(new Error('Solo se permiten imágenes (jpg, png, webp)'), false)
  } else {
    cb(null, true)
  }
}

@Controller('plantillas')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class PlantillasController {
  constructor(private readonly plantillasService: PlantillasService) {}

  @Get()
  findAll() {
    return this.plantillasService.findAll()
  }

  @Get('default')
  findDefault() {
    return this.plantillasService.findDefault()
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.plantillasService.findById(id)
  }

  @Post()
  @UseInterceptors(
    FilesInterceptor('files', 2, {
      storage: diskStorage({
        destination: './uploads/firmas',
        filename: (_req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`)
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: imageFilter,
    }),
  )
  create(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: any,
  ) {
    const firma = files?.find(f => f.fieldname === 'firma')
    const logo = files?.find(f => f.fieldname === 'logo')
    return this.plantillasService.create({
      nombre: body.nombre,
      config: body.config,
      is_default: body.is_default === 'true' || body.is_default === true,
      firma_url: firma ? `/uploads/firmas/${firma.filename}` : undefined,
      logo_url: logo ? `/uploads/firmas/${logo.filename}` : undefined,
    })
  }

  @Put(':id')
  @UseInterceptors(
    FilesInterceptor('files', 2, {
      storage: diskStorage({
        destination: './uploads/firmas',
        filename: (_req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`)
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: imageFilter,
    }),
  )
  update(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: any,
  ) {
    const firma = files?.find(f => f.fieldname === 'firma')
    const logo = files?.find(f => f.fieldname === 'logo')
    return this.plantillasService.update(id, {
      nombre: body.nombre,
      config: body.config,
      is_default: body.is_default === 'true' || body.is_default === true,
      firma_url: firma ? `/uploads/firmas/${firma.filename}` : undefined,
      logo_url: logo ? `/uploads/firmas/${logo.filename}` : undefined,
    })
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.plantillasService.remove(id)
  }
}
