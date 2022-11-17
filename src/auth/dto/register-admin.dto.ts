import { IsNotEmpty, IsString } from 'class-validator';

export class RegisterAdminDto {
  /** Single use admin registration key */
  @IsString()
  @IsNotEmpty()
  adminKey: string;
}
