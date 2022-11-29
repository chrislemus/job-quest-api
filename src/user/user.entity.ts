import { ApiHideProperty, ApiProperty, OmitType } from '@nestjs/swagger';
import { Role, User } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class UserEntity implements User {
  id: number;
  createdAt: Date;
  email: string;
  firstName: string;
  lastName: string | null;
  @Exclude()
  @ApiHideProperty()
  password: string;
  @Exclude()
  @ApiHideProperty()
  refreshToken: string;
  role: Role;

  constructor(partial: UserEntity) {
    Object.assign(this, partial);
  }
}
