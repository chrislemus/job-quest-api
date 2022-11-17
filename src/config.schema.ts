import { plainToInstance } from 'class-transformer';
import { IsString, validateSync } from 'class-validator';

/**
 * Environment variables DTO.
 * Includes class validator/class transformer annotations.
 */
export class EnvironmentVariables {
  /** Jwt secret key for auth. */
  @IsString()
  JWT_SECRET: string;
  /** Jwt refresh token secret key for auth. */
  @IsString()
  JWT_REFRESH_SECRET: string;
  /** Database URL. */
  @IsString()
  DATABASE_URL: string;
  /** Single use admin user registration key */
  @IsString()
  ADMIN_REGISTER_KEY: string;
}

/**
 * Config module custom validation function
 * @param config Raw environment variables object.
 * @returns parsed environment variables object.
 */
export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
