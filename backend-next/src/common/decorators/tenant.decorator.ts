import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const TenantId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const user = ctx.switchToHttp().getRequest().user
    return user?.tenantId ?? user?.tenant_id
  },
)
