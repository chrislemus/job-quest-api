import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../types';
import { AuthUser } from '../dto';
import bcrypt from 'bcryptjs';
import { UserDBService } from '@app/db/user-db.service';

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh-token',
) {
  constructor(config: ConfigService, private userDB: UserDBService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload): Promise<AuthUser> {
    const auth = req?.get('authorization')?.split(' ');
    const refreshToken = auth?.[1];

    if (!refreshToken) throw new ForbiddenException('Refresh token malformed');

    const { id, email, role } = payload;
    const authUser: AuthUser = { id, email, role };
    // const dbUser = await this.prisma.user.findUnique({
    //   where: { id: authUser.id },
    //   select: { refreshToken: true },
    // });

    const { Item: dbUser } = await this.userDB.queryUnique(authUser.id);
    if (!dbUser?.refreshToken) throw new ForbiddenException('Access Denied');

    const isMatch = await bcrypt.compare(refreshToken, dbUser.refreshToken);
    if (!isMatch) throw new ForbiddenException('Access Denied');

    return authUser;
  }
}
