import { UserEntity } from '@app/users/user.entity';
import { OmitType } from '@nestjs/swagger';

/**
 * Authenticated User DTO
 * - excludes sensitive data (ie. password)
 */
export class AuthUser extends OmitType(UserEntity, ['password'] as const) {}
