import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { validate } from './config.schema';

@Module({
  imports: [AuthModule, ConfigModule.forRoot({ validate }), UsersModule],
})
export class AppModule {}
