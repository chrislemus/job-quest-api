import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthUser } from './dto';
import { CreateUserDto } from '@app/users/dto';
import * as bcrypt from 'bcrypt';
import { AuthTokens } from './types';
import { PrismaService } from '@app/prisma';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, pass: string): Promise<AuthUser | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });

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

  async localLogin(user: { id: number; email: string }): Promise<AuthTokens> {
    const tokens = await this.getTokens(user.id, user.email);
    return tokens;
  }

  async refreshJwt(userId: number, refreshToken: string): Promise<AuthTokens> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user?.refreshToken) throw new ForbiddenException('Access Denied');

    const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isMatch) throw new ForbiddenException('Access Denied');

    const tokens = await this.getTokens(user.id, user.email);
    return tokens;
  }

  async hashValue(value: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(value, salt);
    return hash;
  }

  async getTokens(userId: number, email: string): Promise<AuthTokens> {
    const jwtPayload: any = {
      sub: userId,
      email: email,
    };

    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      }),
    ]);

    // update refresh token in DB
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: refresh_token },
    });

    return { access_token, refresh_token };
  }

  async signup(newUserData: CreateUserDto) {
    const password = await this.hashValue(newUserData.password);

    try {
      const user = await this.prisma.user.create({
        data: { ...newUserData, password },
      });

      return this.getTokens(user.id, user.email);
    } catch (error) {
      this.logger.error(error);

      const isPrismaError =
        error instanceof Prisma.PrismaClientKnownRequestError;

      if (isPrismaError && error.code === 'P2002') {
        const errorMsg =
          'There is a unique constraint violation, a new user cannot be created with this email';
        throw new ConflictException(errorMsg);
      }

      throw new InternalServerErrorException();
    }
  }
}
