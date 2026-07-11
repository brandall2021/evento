import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcryptjs'
import { UsersService } from '../users/users.service.js'
import { UserRole } from '../users/user.entity.js'

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(data: { nombre: string; email: string; password: string; rol?: UserRole }) {
    const user = await this.usersService.create({
      nombre: data.nombre,
      email: data.email,
      password: data.password,
      rol: data.rol || UserRole.ATTENDEE,
    })

    const token = this.generateToken(user)
    const { password: _, ...userWithoutPassword } = user
    return { token, user: userWithoutPassword }
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email)
    if (!user) throw new UnauthorizedException('Credenciales inválidas')

    const match = await bcrypt.compare(password, user.password)
    if (!match) throw new UnauthorizedException('Credenciales inválidas')

    const token = this.generateToken(user)
    const { password: _, ...userWithoutPassword } = user
    return { token, user: userWithoutPassword }
  }

  async validateUser(userId: number) {
    return this.usersService.findById(userId)
  }

  async updateProfile(userId: number, data: { nombre?: string; telefono?: string }) {
    return this.usersService.update(userId, data)
  }

  private generateToken(user: any) {
    return this.jwtService.sign({ id: user.id, email: user.email, rol: user.rol })
  }
}
