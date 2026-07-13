import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UploadedFiles,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FilesInterceptor } from '@nestjs/platform-express'
import { memoryStorage } from 'multer'
import { extname } from 'path'
import { PlantillasService } from './plantillas.service.js'
import { StorageService } from '../storage/storage.service.js'
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
  constructor(
    private readonly plantillasService: PlantillasService,
    private readonly storageService: StorageService,
  ) {}

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
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: imageFilter,
    }),
  )
  async create(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: any,
  ) {
    const firma = files?.find(f => f.fieldname === 'firma')
    const logo = files?.find(f => f.fieldname === 'logo')
    const firmaUrl = firma ? await this.storageService.upload(firma, 'firmas') : undefined
    const logoUrl = logo ? await this.storageService.upload(logo, 'logos') : undefined
    return this.plantillasService.create({
      nombre: body.nombre,
      config: body.config,
      is_default: body.is_default === 'true' || body.is_default === true,
      firma_url: firmaUrl,
      logo_url: logoUrl,
    })
  }

  @Put(':id')
  @UseInterceptors(
    FilesInterceptor('files', 2, {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: imageFilter,
    }),
  )
  async update(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: any,
  ) {
    const firma = files?.find(f => f.fieldname === 'firma')
    const logo = files?.find(f => f.fieldname === 'logo')
    const firmaUrl = firma ? await this.storageService.upload(firma, 'firmas') : undefined
    const logoUrl = logo ? await this.storageService.upload(logo, 'logos') : undefined
    return this.plantillasService.update(id, {
      nombre: body.nombre,
      config: body.config,
      is_default: body.is_default === 'true' || body.is_default === true,
      firma_url: firmaUrl,
      logo_url: logoUrl,
    })
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.plantillasService.remove(id)
  }
}
