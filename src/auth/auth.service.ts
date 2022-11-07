import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '@app/users/dto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '@app/prisma';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { AuthTokens } from './dto';

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async localLogin(userId: number, userEmail: string): Promise<AuthTokens> {
    const tokens = await this.getTokens(userId, userEmail);
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
        expiresIn: '20m',
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      }),
    ]);

    await this.syncRefreshToken(userId, refresh_token);
    return { access_token, refresh_token };
  }

  async syncRefreshToken(userId: number, refreshToken: string): Promise<void> {
    try {
      const hashRt = await this.hashValue(refreshToken);
      await this.prisma.user.update({
        where: { id: userId },
        data: { refreshToken: hashRt },
      });
    } catch (error) {
      this.logger.error('Unable to sync refresh token to database:::', error);
      throw new InternalServerErrorException();
    }
  }

  async logout(userId: number): Promise<boolean> {
    await this.prisma.user.updateMany({
      where: {
        id: userId,
        refreshToken: { not: null },
      },
      data: { refreshToken: null },
    });
    return true;
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
