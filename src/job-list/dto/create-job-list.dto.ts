import { IsNotEmpty, IsString } from 'class-validator';

export class CreateJobListDto {
  @IsString()
  @IsNotEmpty()
  label: string;
}
