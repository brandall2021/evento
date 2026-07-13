import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { NestExpressApplication } from '@nestjs/platform-express'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { join } from 'path'
import { AppModule } from './app.module.js'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)

  app.setGlobalPrefix('api')

  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
    credentials: true,
  })

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }))

  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' })

  const config = new DocumentBuilder()
    .setTitle('Evento API')
    .setDescription('API de la plataforma SaaS de gestión de eventos — NestJS Backend')
    .setVersion('2.0')
    .addBearerAuth()
    .addTag('Auth', 'Registro, login, perfil, Google OAuth2')
    .addTag('Users', 'CRUD de usuarios con 12 roles')
    .addTag('Cursos', 'Gestión de cursos/eventos')
    .addTag('Inscripciones', 'Solicitudes y aprobación de inscripciones')
    .addTag('Asistencias', 'Control de asistencia')
    .addTag('Pagos', 'Gestión de pagos')
    .addTag('Certificados', 'Emisión, PDF, validación de certificados')
    .addTag('Plantillas', 'Plantillas de certificado configurables')
    .addTag('Perfil', 'Perfil de asistente')
    .addTag('Agenda', 'Días, salas, bloques, sesiones')
    .addTag('Check-in', 'Check-in QR/manual')
    .addTag('Credenciales', 'Credenciales PDF con QR')
    .addTag('Ponentes', 'Perfiles de ponente')
    .addTag('Expositores', 'Expositores y productos')
    .addTag('Patrocinadores', 'Patrocinadores y beneficios')
    .addTag('Chat', 'Mensajería privada/grupal')
    .addTag('Networking', 'Match por intereses')
    .addTag('Reuniones', 'Reuniones con participantes')
    .addTag('Streaming', 'Salas streaming, encuestas, Q&A')
    .addTag('Gamificación', 'Puntos, badges, ranking')
    .addTag('Interacción', 'Comentarios, likes, trivias')
    .addTag('CMS', 'Páginas, blog, galería, FAQs')
    .addTag('Notificaciones', 'Notificaciones y plantillas')
    .addTag('Public API', 'Endpoints públicos sin autenticación')
    .addTag('Webhooks', 'Webhooks y eventos')
    .addTag('Analytics', 'Dashboard y métricas')
    .addTag('Export', 'Exportación CSV')
    .addTag('Audit Logs', 'Logs de auditoría')
    .addTag('Organizaciones', 'Multi-tenant')
    .addTag('Permissions', 'Permisos granulares')
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('docs', app, document)

  const port = process.env.PORT || 3002
  await app.listen(port)
  console.log(`NestJS running on http://localhost:${port}`)
  console.log(`Swagger docs at http://localhost:${port}/docs`)
}
bootstrap()
