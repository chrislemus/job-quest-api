import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateJobLogDto {
  /**
   * Log text content
   * @example Interview went well today
   */
  @IsString()
  content: string;
  @IsNumber()
  @IsNotEmpty()
  jobId: number;
}
