import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { AuthService } from './auth.service.js'
import { AuthController } from './auth.controller.js'
import { JwtStrategy } from './jwt.strategy.js'
import { User } from '../users/user.entity.js'
import { RefreshToken } from './entities/refresh-token.entity.js'
import { UserTenant } from './entities/user-tenant.entity.js'
import { UserRoleAssignment } from './entities/user-role-assignment.entity.js'
import { Role } from '../roles/entities/role.entity.js'
import { RolePermission } from '../roles/entities/role-permission.entity.js'
import { Permission } from '../permissions/entities/permission.entity.js'
import { Tenant } from '../tenants/entities/tenant.entity.js'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      RefreshToken,
      UserTenant,
      UserRoleAssignment,
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
