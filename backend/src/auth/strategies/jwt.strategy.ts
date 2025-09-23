import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService, private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }
  async validate(payload: { sub: number; email: string }) {
    const user = await this.usersService.findOne(payload.sub);
    if (!user) throw new UnauthorizedException();
    const roles = user.userRoles?.map((ur) => ur.role.name) ?? [];
    const permissions = Array.from(
      new Set(
        user.userRoles?.flatMap((ur) => ur.role.rolePermissions?.map((rp) => rp.permission.name) ?? []) ?? [],
      ),
    );
    return {
      userId: payload.sub,
      email: payload.email,
      roles,
      permissions,
      type: user.type,
      department: user.department,
    };
  }
}
