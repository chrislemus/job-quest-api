import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ConfigModule, registerAs } from '@nestjs/config';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';

// export const authConfig = registerAs('database', () => ({
//   host: process.env.DATABASE_HOST,
//   port: process.env.DATABASE_PORT || 5432,
// }));

@Module({
  imports: [UsersModule, PassportModule],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy],
})
export class AuthModule {}

// @Module({
//   imports: [
//     ConfigModule.forRoot({
//       load: [authConfig],
//     }),
//   ],
//   providers: [AuthService],
//   controllers: [AuthController],
// })
// export class AuthModule {}
