import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '@app/users/users.service';
import { AuthUser } from './dto';
import { CreateUserDto } from '@app/users/dto';
import * as bcrypt from 'bcrypt';
import { AuthTokens, JwtPayload } from './types';
import { PrismaService } from '@app/prisma';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, pass: string): Promise<AuthUser | null> {
    const user = await this.usersService.findUniqueByEmail(email);
    const userHashPassword = user?.password;
    if (userHashPassword) {
      const isMatch = await bcrypt.compare(pass, userHashPassword);
      if (isMatch) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...authUser } = user;
        return authUser;
      }
    }
    return null;
  }

  createJwt(user: { id: number; email: string }) {
    const payload = { sub: user.id, email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async refreshJwt(userId: number, refreshToken: string): Promise<AuthTokens> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user?.refreshToken) throw new ForbiddenException('Access Denied');

    const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isMatch) throw new ForbiddenException('Access Denied');

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRtHash(user.id, tokens.refreshToken);

    return tokens;
  }

  async updateRtHash(userId: number, rt: string): Promise<void> {
    const salt = await bcrypt.genSalt(10);
    const refreshToken = await bcrypt.hash(rt, salt);

    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken },
    });
  }

  async getTokens(userId: number, email: string): Promise<AuthTokens> {
    const jwtPayload: any = {
      sub: userId,
      email: email,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      }),
    ]);

    return { accessToken, refreshToken };
  }

  async signup(newUserData: CreateUserDto) {
    const user = await this.usersService.createUser(newUserData);
    return this.createJwt(user);
  }
}
