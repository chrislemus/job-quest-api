import { IsString } from 'class-validator';
import { CreateJobLogDto } from './create-job-log.dto';

export class UpdateJobLogDto implements Pick<CreateJobLogDto, 'content'> {
  /**
   * Text content
   * @example Interview went well today
   */
  @IsString()
  content: string;
}
