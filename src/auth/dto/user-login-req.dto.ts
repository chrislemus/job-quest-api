import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

/** User login request DTO */
export class UserLoginReqDto {
  @IsString()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
