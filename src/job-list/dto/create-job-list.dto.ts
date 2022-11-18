import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateJobListDto {
  @IsString()
  @IsNotEmpty()
  label: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  order?: number;
}
