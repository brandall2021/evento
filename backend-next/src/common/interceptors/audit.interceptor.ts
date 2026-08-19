import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common'
import { Observable, tap } from 'rxjs'
import { AuditService } from '../../audit/audit.service.js'
import { AuditAction } from '../../audit/entities/audit-log.entity.js'

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest()
    const { method, originalUrl, user, body } = req

    const action = this.mapMethodToAction(method)
    if (!action) {
      return next.handle()
    }

    const entity = this.extractEntity(originalUrl)

    return next.handle().pipe(
      tap(() => {
        this.auditService.log({
          tenant_id: user?.tenant_id,
          user_id: user?.id,
          action,
          entity,
          new_values: body && typeof body === 'object' ? body : null,
          ip_address: req.ip ?? req.socket?.remoteAddress ?? null,
          user_agent: req.headers['user-agent'] ?? null,
        }).catch(() => {})
      }),
    )
  }

  private mapMethodToAction(method: string): AuditAction | null {
    switch (method) {
      case 'POST':
        return AuditAction.CREATE
      case 'PATCH':
      case 'PUT':
        return AuditAction.UPDATE
      case 'DELETE':
        return AuditAction.DELETE
      default:
        return null
    }
  }

  private extractEntity(url: string): string {
    const segments = url.split('/').filter(Boolean)
    const apiIdx = segments.indexOf('v1')
    if (apiIdx === -1 || apiIdx + 1 >= segments.length) {
      return 'unknown'
    }
    const entitySegment = segments[apiIdx + 1]
    return entitySegment.replace(/-/g, '_')
  }
}
