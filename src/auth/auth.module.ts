import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './guards';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from './jwt.module';
import { UserModule } from '@app/user/user.module';
import { PrismaModule } from '@app/prisma';
import {
  JwtRefreshTokenStrategy,
  JwtStrategy,
  LocalStrategy,
} from './strategies';

@Module({
  imports: [
    PassportModule,
    ConfigModule.forRoot(),
    JwtModule,
    UserModule,
    PrismaModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    JwtRefreshTokenStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AuthModule {}
