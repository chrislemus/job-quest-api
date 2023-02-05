import { ApiHideProperty } from '@nestjs/swagger';
import { Role, User } from '@prisma/client';
import { Exclude } from 'class-transformer';
import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class UserEntity implements User {
  @IsNumber()
  id: number;
  @IsDateString()
  createdAt: Date;
  @IsString()
  email: string;
  @IsString()
  firstName: string;
  @IsOptional()
  @IsString()
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
