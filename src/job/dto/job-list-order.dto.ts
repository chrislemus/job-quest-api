import { IsNumber, ValidateIf } from 'class-validator';

export class JobListOrderDto {
  @ValidateIf((o: JobListOrderDto) => typeof o.afterJobId === undefined)
  @IsNumber()
  beforeJobId: number;

  @ValidateIf((o: JobListOrderDto) => typeof o.beforeJobId === undefined)
  @IsNumber()
  afterJobId: number;
}
