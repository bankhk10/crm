import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  private buildAccessContext(user: any) {
    const roles = user.userRoles?.map((ur: any) => ur.role.name) ?? [];
    const permissions = Array.from(
      new Set(
        roles.length
          ? user.userRoles.flatMap((ur: any) =>
              ur.role.rolePermissions?.map((rp: any) => rp.permission.name) ?? [],
            )
          : [],
      ),
    );
    return { roles, permissions };
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findOneByEmail(registerDto.email);
    if (existingUser) throw new ConflictException('Email already exists');
    const user = await this.usersService.create({ ...registerDto });
    const { password: _password, userRoles: _userRoles, ...result } = user as any;
    void _password;
    void _userRoles;
    const accessContext = this.buildAccessContext(user);
    return { ...result, ...accessContext };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findOneByEmailWithPassword(loginDto.email);
    const isValid = user && (await bcrypt.compare(loginDto.password, user.password));

    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status?.toLowerCase() === 'inactive') {
      throw new UnauthorizedException('User inactive');
    }

    const accessContext = this.buildAccessContext(user);
    return this.generateTokens(user.id, user.email, user.type, accessContext.roles, accessContext.permissions);
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });
      const user = await this.usersService.findOne(payload.sub);
      if (!user) throw new UnauthorizedException();
      const accessContext = this.buildAccessContext(user);
      return this.generateTokens(user.id, user.email, user.type, accessContext.roles, accessContext.permissions);
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async getProfile(userId: number) {
    const user = await this.usersService.findOne(userId);
    if (!user) throw new UnauthorizedException();
    const { password: _password, userRoles: _userRoles, ...result } = user as any;
    void _password;
    void _userRoles;
    const accessContext = this.buildAccessContext(user);
    return { ...result, ...accessContext };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      throw new NotFoundException('ไม่พบเมลล์สมัครเข้าใช้งาน');
    }
    console.log(`Send password reset link to ${email}`);
    return { message: 'ส่งลิงก์รีเซ็ตรหัสผ่านไปที่อีเมลแล้ว' };
  }

  private generateTokens(
    userId: number,
    email: string,
    type: string,
    roles: string[],
    permissions: string[],
  ) {
    const payload = { email, sub: userId, roles, permissions, type };
    return {
      accessToken: this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: '59m',
      }),
      refreshToken: this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      }),
    };
  }
}
