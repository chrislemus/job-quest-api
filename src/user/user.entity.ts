import { ApiHideProperty, ApiProperty, OmitType } from '@nestjs/swagger';
import { Role, User } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class UserEntity {
  id: string;
  createdAt: Date;
  email: string;
  firstName: string;
  lastName?: string;
  @Exclude()
  @ApiHideProperty()
  password: string;
  @Exclude()
  @ApiHideProperty()
  refreshToken: string | null;
  role: Role;

  constructor(partial: UserEntity) {
    Object.assign(this, partial);
  }
}
