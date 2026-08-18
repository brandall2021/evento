import { IsUUID } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class AssignRoleDto {
  @ApiProperty({ description: 'Role ID to assign' })
  @IsUUID('4')
  roleId: string

  @ApiProperty({ description: 'Tenant ID where the role applies' })
  @IsUUID('4')
  tenantId: string
}
