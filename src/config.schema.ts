import { plainToInstance } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  validateSync,
} from 'class-validator';

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
  /**
   * Dictates build type
   * - When `true` app will build in local development mode
   * actively listening for changes and running the same app instance
   * to handle all requests.
   * - when `false` or not provided, the app build not actively listen in a specific port.
   * Instead the serverless environment is responsible for invoking the `handler` function
   * to handle requests.
   */
  @IsOptional()
  @IsBoolean()
  NOT_SERVERLESS_BUILD?: boolean;
  /**
   * Max number of jobs a user can create
   * @important TODO: config variable should be extracted for easy customization from client side
   */
  @IsNumber()
  JOB_CREATE_LIMIT: number;
  /**
   * Max number of job lists a user can create
   * @important TODO: config variable should be extracted for easy customization from client side
   */
  @IsNumber()
  JOB_LIST_CREATE_LIMIT: number;
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
