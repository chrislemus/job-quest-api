import { Role } from 'src/auth/types';
import { ApiHideProperty, ApiProperty, OmitType } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

export class UserEntity {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  @Exclude()
  @ApiHideProperty()
  password: string;
  @Exclude()
  @ApiHideProperty()
  refreshToken?: string;
  role: Role;

  constructor(partial: UserEntity) {
    Object.assign(this, partial);
  }
}
