import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule as _JwtModule } from '@nestjs/jwt';

/** Pre-configured JWT module. */
export const JwtModule = _JwtModule.registerAsync({
  imports: [ConfigModule.forRoot()],
  useFactory: (config: ConfigService) => {
    const secret = config.get<string>('JWT_SECRET');
    if (!secret) throw Error('"JWT_SECRET" undefined inJwtModule');

    return {
      secret,
      signOptions: { expiresIn: '1h' },
    };
  },
  inject: [ConfigService],
});
