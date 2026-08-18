import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class UserResponseDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  email: string

  @ApiProperty()
  firstName: string

  @ApiProperty()
  lastName: string

  @ApiPropertyOptional()
  phone: string | null

  @ApiPropertyOptional()
  avatarUrl: string | null

  @ApiProperty()
  isActive: boolean

  @ApiProperty()
  createdAt: Date

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial)
  }
}
