import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

/** User login request DTO */
export class UserLoginReqDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  password: string;
}
