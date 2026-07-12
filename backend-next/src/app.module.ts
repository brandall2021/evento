import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from './auth/auth.module.js'
import { UsersModule } from './users/users.module.js'
import { CursosModule } from './cursos/cursos.module.js'
import { InscripcionesModule } from './inscripciones/inscripciones.module.js'
import { AsistenciasModule } from './asistencias/asistencias.module.js'
import { PagosModule } from './pagos/pagos.module.js'
import { CertificadosModule } from './certificados/certificados.module.js'
import { PlantillasModule } from './plantillas/plantillas.module.js'
import { PerfilModule } from './perfil/perfil.module.js'
import { AgendaModule } from './agenda/agenda.module.js'
import { CheckinModule } from './checkin/checkin.module.js'
import { CredencialesModule } from './credenciales/credenciales.module.js'
import { PonentesModule } from './ponentes/ponentes.module.js'
import { ExpositoresModule } from './expositores/expositores.module.js'
import { PatrocinadoresModule } from './patrocinadores/patrocinadores.module.js'
import { User } from './users/user.entity.js'
import { Curso } from './cursos/curso.entity.js'
import { Inscripcion } from './inscripciones/inscripcion.entity.js'
import { Asistencia } from './asistencias/asistencia.entity.js'
import { Pago } from './pagos/pago.entity.js'
import { Certificado } from './certificados/certificado.entity.js'
import { PlantillaCertificado } from './plantillas/plantilla.entity.js'
import { PerfilAsistente } from './perfil/perfil.entity.js'
import { DiaAgenda } from './agenda/dia.entity.js'
import { Sala } from './agenda/sala.entity.js'
import { Bloque } from './agenda/bloque.entity.js'
import { Sesion } from './agenda/sesion.entity.js'
import { Checkin } from './checkin/checkin.entity.js'
import { Credencial } from './credenciales/credencial.entity.js'
import { PerfilPonente } from './ponentes/perfil-ponente.entity.js'
import { Expositor } from './expositores/expositor.entity.js'
import { ProductoExpositor } from './expositores/producto.entity.js'
import { Patrocinador } from './patrocinadores/patrocinador.entity.js'
import { BeneficioPatrocinio } from './patrocinadores/beneficio.entity.js'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
          PerfilAsistente, DiaAgenda, Sala, Bloque, Sesion, Checkin, Credencial,
          PerfilPonente, Expositor, ProductoExpositor, Patrocinador, BeneficioPatrocinio,
        ],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
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
    CheckinModule,
    CredencialesModule,
    PonentesModule,
    ExpositoresModule,
    PatrocinadoresModule,
  ],
})
export class AppModule {}
