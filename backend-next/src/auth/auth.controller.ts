import { Controller, Post, Get, Put, Body, UseGuards, Request, Res, Query } from '@nestjs/common'
import { AuthService } from './auth.service.js'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js'
import { UserRole } from '../users/user.entity.js'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() body: { nombre: string; email: string; password: string; rol?: UserRole }) {
    return this.authService.register(body)
  }

  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password)
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Request() req: any) {
    return req.user
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  updateProfile(@Request() req: any, @Body() body: { nombre?: string; telefono?: string }) {
    return this.authService.updateProfile(req.user.id, body)
  }

  @Get('google')
  googleAuth() {
    // Handled by Passport redirect — this endpoint triggers the Google OAuth flow
  }

  @Get('google/callback')
  async googleCallback(@Query('code') code: string, @Res() res: any) {
    // Passport handles the token exchange; in production use @UseGuards(GoogleOAuthGuard)
    // For simplicity, the callback is handled client-side via the Google API SDK
    return res.redirect(`/auth/google/success?code=${code}`)
  }
}
