import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { JwtStrategy } from './jwt.strategy'
import { User } from '../users/entities/user.entity'
import { RefreshToken } from '../users/entities/refresh-token.entity'
import { UserTenant } from '../users/entities/user-tenant.entity'
import { UserRole } from '../users/entities/user-role.entity'
import { Role } from '../roles/entities/role.entity'
import { RolePermission } from '../roles/entities/role-permission.entity'
import { Permission } from '../permissions/entities/permission.entity'
import { Tenant } from '../tenants/entities/tenant.entity'
import { UsersModule } from '../users/users.module'

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([
      User,
      RefreshToken,
      UserTenant,
      UserRole,
      Role,
      RolePermission,
      Permission,
      Tenant,
    ]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
