import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import {
  JwtRefreshTokenStrategy,
  JwtStrategy,
  LocalStrategy,
} from './strategies';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './guards';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from './jwt.module';
import { PrismaService } from '@app/prisma';

@Module({
  imports: [PassportModule, ConfigModule.forRoot(), JwtModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    JwtRefreshTokenStrategy,
    PrismaService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AuthModule {}
