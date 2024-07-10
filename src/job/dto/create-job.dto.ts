import {
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { JobEntity } from '../entities';
import { JobListDto } from './job-list.dto';

interface WithJobList {
  jobList: JobListDto;
}

export class CreateJobDto
  // TODO: figure out how to allow undefined for null Prisma values.
  // We still would like the type safety of the data type
  implements
    Omit<
      JobEntity,
      | 'id'
      | 'userId'
      | 'location'
      | 'url'
      | 'salary'
      | 'description'
      | 'color'
      | 'jobListRank'
      | 'jobListId'
    >,
    WithJobList
{
  /**
   * Job Title
   * @example 'Software Engineer'
   */
  @IsString()
  @IsNotEmpty()
  title: string;
  /**
   * Job company
   * @example Acme
   */
  @IsString()
  @IsNotEmpty()
  company: string;
  /**
   * Job Location
   * @example 'Raleigh, NC'
   */
  @IsOptional()
  @IsString()
  location?: string;
  /**
   * Job post URL
   */
  @IsString()
  @IsOptional()
  url?: string;
  /**
   * Job salary
   * @example 56k
   */
  @IsOptional()
  @IsString()
  salary?: string;
  /**
   * Job description
   */
  @IsOptional()
  @IsString()
  description?: string;
  /**
   * Hexadecimal color to be used in UI when displaying job content
   * @example #e91e63
   */
  @IsOptional()
  @IsString()
  color?: string;

  /** Parameters for assigning job list to job  */
  @ValidateNested()
  jobList: JobListDto;
}
