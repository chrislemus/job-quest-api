import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateJobListDto {
  @IsString()
  @IsNotEmpty()
  label: string;

  @IsOptional()
  @IsNumber()
  order?: number;
}
