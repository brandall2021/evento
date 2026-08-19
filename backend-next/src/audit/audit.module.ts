import { Module, Global } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuditLog } from './entities/audit-log.entity.js'
import { AuditService } from './audit.service.js'
import { AuditInterceptor } from '../common/interceptors/audit.interceptor.js'
import { AuditLogsController } from './audit-logs.controller.js'

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([AuditLog])],
  controllers: [AuditLogsController],
  providers: [AuditService, AuditInterceptor],
  exports: [AuditService, AuditInterceptor],
})
export class AuditModule {}
