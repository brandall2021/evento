export class AuthUserDto {
  id: string
  email: string
  firstName: string
  lastName: string
  avatarUrl: string | null
}

export class AuthResponseDto {
  access_token: string
  refresh_token: string
  user: AuthUserDto
}
