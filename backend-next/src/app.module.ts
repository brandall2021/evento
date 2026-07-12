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
import { User } from './users/user.entity.js'
import { Curso } from './cursos/curso.entity.js'
import { Inscripcion } from './inscripciones/inscripcion.entity.js'
import { Asistencia } from './asistencias/asistencia.entity.js'
import { Pago } from './pagos/pago.entity.js'
import { Certificado } from './certificados/certificado.entity.js'
import { PlantillaCertificado } from './plantillas/plantilla.entity.js'

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
        entities: [User, Curso, Inscripcion, Asistencia, Pago, Certificado, PlantillaCertificado],
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
  ],
})
export class AppModule {}
