import { ApiProperty } from '@nestjs/swagger';

export class SignupDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  password: string;
}
