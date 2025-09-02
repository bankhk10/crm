
import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findOneByEmail(registerDto.email);
    if (existingUser) throw new ConflictException('Email already exists');
    const userRole = await this.prisma.role.findUnique({ where: { name: 'USER' } });
    if (!userRole) throw new Error('Default USER role not found');
    const user = await this.usersService.create({ ...registerDto, roleId: userRole.id });
    const { password, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findOneByEmailWithPassword(loginDto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const isMatch = await bcrypt.compare(loginDto.password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');
    if (user.status && user.status.toLowerCase() === 'inactive') throw new UnauthorizedException('User inactive');
    return this.generateTokens(user.id, user.email, user.role.name, user.type);
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, { secret: this.configService.get('JWT_REFRESH_SECRET') });
      const user = await this.usersService.findOne(payload.sub);
      if (!user) throw new UnauthorizedException();
      return this.generateTokens(user.id, user.email, user.role.name, user.type);
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async getProfile(userId: number) {
    const user = await this.usersService.findOne(userId);
    if (!user) throw new UnauthorizedException();
    const { password, ...result } = user;
    return result;
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      throw new NotFoundException('ไม่พบเมลล์สมัครเข้าใช้งาน');
    }
    // Placeholder for sending reset email
    // In production, integrate with an email service here
    console.log(`Send password reset link to ${email}`);
    return { message: 'ส่งลิงก์รีเซ็ตรหัสผ่านไปที่อีเมลแล้ว' };
  }

  private async generateTokens(userId: number, email: string, role: string, type: string) {
    const payload = { email, sub: userId, role, type };
    return {
      accessToken: this.jwtService.sign(payload, { secret: this.configService.get('JWT_SECRET'), expiresIn: '59m' }),
      refreshToken: this.jwtService.sign(payload, { secret: this.configService.get('JWT_REFRESH_SECRET'), expiresIn: '7d' }),
    };
  }
}
