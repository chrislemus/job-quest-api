import { IsNotEmpty, IsString } from 'class-validator';

export class CreateJobListDto {
  /**
   * Job List label to display in UI
   * @example Interview
   */
  @IsString()
  @IsNotEmpty()
  label: string;
}
