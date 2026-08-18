import { IsString, IsOptional, IsBoolean, Matches, MinLength, MaxLength } from 'class-validator'

export class CreateTenantDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name: string

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug must be lowercase alphanumeric with optional hyphens',
  })
  slug: string

  @IsOptional()
  @IsString()
  @MaxLength(255)
  domain?: string

  @IsOptional()
  @IsString()
  logo_url?: string

  @IsOptional()
  @IsString()
  banner_url?: string

  @IsOptional()
  settings?: Record<string, unknown>

  @IsOptional()
  @IsBoolean()
  is_active?: boolean
}
