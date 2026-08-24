import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ThrottlerModule } from '@nestjs/throttler'
import { HealthModule } from './health/health.module'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { CursosModule } from './cursos/cursos.module'
import { InscripcionesModule } from './inscripciones/inscripciones.module'
import { AsistenciasModule } from './asistencias/asistencias.module'
import { PagosModule } from './pagos/pagos.module'
import { CertificadosModule } from './certificados/certificados.module'
import { PlantillasModule } from './plantillas/plantillas.module'
import { PerfilModule } from './perfil/perfil.module'
import { AgendaModule } from './agenda/agenda.module'
import { AcreditacionModule } from './checkin/checkin.module'
import { CredencialesModule } from './credenciales/credenciales.module'
import { PonentesModule } from './ponentes/ponentes.module'
import { ExpositoresModule } from './expositores/expositores.module'
import { PatrocinadoresModule } from './patrocinadores/patrocinadores.module'
import { ChatModule } from './chat/chat.module'
import { NetworkingModule } from './networking/networking.module'
import { ReunionesModule } from './reuniones/reuniones.module'
import { StreamingModule } from './streaming/streaming.module'
import { GamificacionModule } from './gamificacion/gamificacion.module'
import { InteraccionModule } from './interaccion/interaccion.module'
import { CmsModule } from './cms/cms.module'
import { FormsModule } from './forms/forms.module'
import { NotificacionesModule } from './notificaciones/notificaciones.module'
import { PublicApiModule } from './public-api/public-api.module'
import { WebhooksModule } from './webhooks/webhooks.module'
import { AnalyticsModule } from './analytics/analytics.module'
import { ExportModule } from './export/export.module'
import { AuditModule } from './audit/audit.module'
import { OrganizacionesModule } from './organizaciones/organizaciones.module'
import { PermissionsModule } from './permissions/permissions.module'
import { CacheModule } from './cache/cache.module'
import { StorageModule } from './storage/storage.module'
import { WebsocketModule } from './websocket/websocket.module'
import { TenantsModule } from './tenants/tenants.module'
import { RolesModule } from './roles/roles.module'
import { User } from './users/entities/user.entity'
import { Curso } from './cursos/curso.entity'
import { Inscripcion } from './inscripciones/inscripcion.entity'
import { Asistencia } from './asistencias/asistencia.entity'
import { Pago } from './pagos/pago.entity'
import { Certificado } from './certificados/certificado.entity'
import { PlantillaCertificado } from './plantillas/plantilla.entity'
import { PerfilAsistente } from './perfil/perfil.entity'
import { DiaAgenda } from './agenda/dia.entity'
import { Sala } from './agenda/sala.entity'
import { Bloque } from './agenda/bloque.entity'
import { Sesion } from './agenda/sesion.entity'
import { Acreditacion } from './checkin/checkin.entity'
import { Credencial } from './credenciales/credencial.entity'
import { PerfilPonente } from './ponentes/perfil-ponente.entity'
import { Expositor } from './expositores/expositor.entity'
import { ProductoExpositor } from './expositores/producto.entity'
import { Patrocinador } from './patrocinadores/patrocinador.entity'
import { BeneficioPatrocinio } from './patrocinadores/beneficio.entity'
import { Conversacion } from './chat/conversacion.entity'
import { MensajeChat } from './chat/mensaje.entity'
import { ParticipanteConversacion } from './chat/participante.entity'
import { MatchNetworking } from './networking/match.entity'
import { Reunion } from './reuniones/reunion.entity'
import { ParticipanteReunion } from './reuniones/participante.entity'
import { SalaStreaming } from './streaming/sala-streaming.entity'
import { EncuestaStreaming } from './streaming/encuesta.entity'
import { RespuestaEncuesta } from './streaming/respuesta-encuesta.entity'
import { PreguntaQA } from './streaming/pregunta-qa.entity'
import { PuntosHistorial } from './gamificacion/puntos-historial.entity'
import { Badge } from './gamificacion/badge.entity'
import { UsuarioBadge } from './gamificacion/usuario-badge.entity'
import { Comentario } from './interaccion/comentario.entity'
import { Like } from './interaccion/like.entity'
import { Trivia } from './interaccion/trivia.entity'
import { RespuestaTrivia } from './interaccion/respuesta-trivia.entity'
import { Pagina } from './cms/pagina.entity'
import { BlogPost } from './cms/blog-post.entity'
import { Galeria } from './cms/galeria.entity'
import { FAQ } from './cms/faq.entity'
import { FormTemplate } from './forms/form-template.entity'
import { FormTemplateVersion } from './forms/form-template-version.entity'
import { FormSubmission } from './forms/form-submission.entity'
import { Notificacion } from './notificaciones/notificacion.entity'
import { PlantillaNotificacion } from './notificaciones/plantilla-notificacion.entity'
import { Webhook, WebhookEvent } from './webhooks/webhook.entity'
import { AuditLog } from './audit/entities/audit-log.entity'
import { Organizacion, OrganizacionMiembro } from './organizaciones/organizacion.entity'
import { Permission } from './permissions/entities/permission.entity'
import { Tenant } from './tenants/entities/tenant.entity'
import { Role } from './roles/entities/role.entity'
import { RolePermission } from './roles/entities/role-permission.entity'
import { RefreshToken } from './users/entities/refresh-token.entity'
import { UserTenant } from './users/entities/user-tenant.entity'
import { UserRole } from './users/entities/user-role.entity'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST', 'localhost'),
        port: config.get('DB_PORT', 5432),
        username: config.get('DB_USER', 'postgres'),
        password: config.get('DB_PASSWORD', 'postgres'),
        database: config.get('DB_NAME', 'evento_web'),
        entities: [
          User, Curso, Inscripcion, Asistencia, Pago, Certificado, PlantillaCertificado,
          PerfilAsistente, DiaAgenda, Sala, Bloque, Sesion, Acreditacion, Credencial,
          PerfilPonente, Expositor, ProductoExpositor, Patrocinador, BeneficioPatrocinio,
          Conversacion, MensajeChat, ParticipanteConversacion, MatchNetworking,
          Reunion, ParticipanteReunion,
          SalaStreaming, EncuestaStreaming, RespuestaEncuesta, PreguntaQA,
          PuntosHistorial, Badge, UsuarioBadge,
          Comentario, Like, Trivia, RespuestaTrivia,
           Pagina, BlogPost, Galeria, FAQ,
           FormTemplate, FormTemplateVersion, FormSubmission,
          Notificacion, PlantillaNotificacion,
          Webhook, WebhookEvent,
          AuditLog,
          Organizacion, OrganizacionMiembro,
          Permission,
          Tenant,
          Role,
          RolePermission,
          RefreshToken,
          UserTenant,
          UserRole,
        ],
        synchronize: false,
      }),
      inject: [ConfigService],
    }),
    HealthModule,
    AuthModule,
    UsersModule,
    CursosModule,
    InscripcionesModule,
    AsistenciasModule,
    PagosModule,
    CertificadosModule,
    PlantillasModule,
    PerfilModule,
    AgendaModule,
    AcreditacionModule,
    CredencialesModule,
    PonentesModule,
    ExpositoresModule,
    PatrocinadoresModule,
    ChatModule,
    NetworkingModule,
    ReunionesModule,
    StreamingModule,
    GamificacionModule,
    InteraccionModule,
    CmsModule,
    FormsModule,
    NotificacionesModule,
    PublicApiModule,
    WebhooksModule,
    AnalyticsModule,
    ExportModule,
    AuditModule,
    OrganizacionesModule,
    PermissionsModule,
    CacheModule,
    StorageModule,
    WebsocketModule,
    TenantsModule,
    RolesModule,
  ],
})
export class AppModule {}
